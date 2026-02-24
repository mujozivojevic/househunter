import { olxService } from './olxService';
import { listingService } from './listingService';
import { telegramService } from './telegramService';
import { userFilterService } from './userFilterService';
import { logger } from '../utils/logger';
import { logService } from './logService';
import prisma from '../db/prisma';

export class SyncService {
  private apartmentOffset: number = 0;
  private houseOffset: number = 0;
  private lastBackfillTime: Date | null = null;
  private lastNewListingCheckTime: Date | null = null;
  private notificationStartTime: Date | null = null; // Track when real-time notifications started

  /**
   * Initial backfill: fetches 50 items for both apartments and houses, increments offsets
   * Runs every 2 minutes
   */
  async initialBackfill(): Promise<void> {
    // Fetch both apartments and houses
    await this.backfillType('apartment');
    await this.backfillType('house');
    this.lastBackfillTime = new Date();
  }

  /**
   * Backfill a specific type (apartment or house)
   */
  private async backfillType(type: 'apartment' | 'house'): Promise<void> {
    try {
      const limit = 50;
      const offset = type === 'apartment' ? this.apartmentOffset : this.houseOffset;
      const page = Math.floor(offset / limit);
      
      logger.info(`Starting ${type} backfill at offset ${offset}, fetching page ${page}`);
      
      const response = await olxService.fetchListings(type, page, limit);
      
      if (response.data.length === 0) {
        logger.info(`No ${type} listings found in backfill at page ${page} - may have reached end`);
        // Reset offset if we've reached the last page
        if (response.last_page && response.current_page && response.current_page >= response.last_page) {
          logger.info(`Reached last page (${response.last_page}) for ${type}, resetting offset to 0`);
          if (type === 'apartment') {
            this.apartmentOffset = 0;
          } else {
            this.houseOffset = 0;
          }
        }
        return;
      }

      // Check if we've reached the last page
      if (response.last_page && response.current_page && response.current_page >= response.last_page) {
        logger.info(`Reached last page (${response.last_page}) for ${type}, will reset offset after this batch`);
      }

      let newCount = 0;
      let updatedCount = 0;

      for (const listing of response.data) {
        const exists = await listingService.listingExists(listing.id);
        
        if (!exists) {
          newCount++;
        } else {
          updatedCount++;
        }

        await listingService.upsertListing(listing);
      }

      // Update the appropriate offset
      if (type === 'apartment') {
        this.apartmentOffset += response.data.length;
      } else {
        this.houseOffset += response.data.length;
      }

      logger.info(
        `${type} backfill complete: ${newCount} new, ${updatedCount} updated, total offset: ${type === 'apartment' ? this.apartmentOffset : this.houseOffset}, next page: ${page + 1}`
      );

      // Only log if there were new listings added
      if (newCount > 0) {
        const totalInDb = await prisma.listing.count();
        const typeLabel = type === 'apartment' ? 'apartments' : 'houses';
        logService.addLog('fetch', `${newCount} new ${typeLabel} added from page ${page + 1} - total in db is now ${totalInDb}`, {
          fetchedCount: response.data.length,
          newCount,
          updatedCount,
          totalInDb,
          page: page + 1,
          type,
        });
      }
    } catch (error: any) {
      logger.error(`Error in ${type} backfill:`, error.message);
    }
  }

  /**
   * Enable real-time notifications from this point forward
   */
  enableRealTimeNotifications(): void {
    this.notificationStartTime = new Date();
    logger.info(`Real-time notifications enabled. Baseline time: ${this.notificationStartTime.toISOString()}`);
  }

  /**
   * Check for new listings on page 0 (both apartments and houses)
   * Runs frequently for real-time notifications
   */
  async checkForNewListings(): Promise<void> {
    // Check both apartments and houses
    await this.checkTypeForNewListings('apartment');
    await this.checkTypeForNewListings('house');
  }

  /**
   * Check for new listings of a specific type
   */
  private async checkTypeForNewListings(type: 'apartment' | 'house'): Promise<void> {
    try {
      logger.info(`Checking for new ${type} listings...`);

      const response = await olxService.fetchListings(type, 0, 50);

      if (response.data.length === 0) {
        logger.info(`No ${type} listings found`);
        return;
      }

      const listingsToNotify: typeof response.data = [];
      const newListings: typeof response.data = [];
      const priceChangedListings: typeof response.data = [];

      for (const listing of response.data) {
        // Check if listing exists and get old price
        const existingListing = await prisma.listing.findUnique({
          where: { id: listing.id },
        });

        if (!existingListing) {
          // New listing
          newListings.push(listing);
          await listingService.upsertListing(listing);
          listingsToNotify.push(listing);
        } else {
          // Existing listing - check if it was never notified (added before notifications were enabled)
          if (!existingListing.notifiedAt) {
            // Listing exists but was never notified - treat as new
            newListings.push(listing);
            listingsToNotify.push(listing);
          } else if (listing.price < existingListing.price) {
            // Price dropped - need to notify
            priceChangedListings.push(listing);
            listingsToNotify.push(listing);
          }
          // Update listing (price changed or other updates)
          await listingService.upsertListing(listing);
        }
      }

      this.lastNewListingCheckTime = new Date();

      // Count how many listings were actually new vs already existed
      const actuallyNewCount = newListings.length;
      const alreadyExistedCount = response.data.length - actuallyNewCount - priceChangedListings.length;
      const totalInDb = await prisma.listing.count();

      // Log every fetch with details about what was found
      const typeLabel = type === 'apartment' ? 'apartments' : 'houses';
      const message = actuallyNewCount > 0 || priceChangedListings.length > 0
        ? `${response.data.length} ${typeLabel} checked - ${actuallyNewCount} new, ${priceChangedListings.length} price changes, ${alreadyExistedCount} already in db - total: ${totalInDb}`
        : `${response.data.length} ${typeLabel} checked - all already in db (no changes) - total: ${totalInDb}`;
      
      logService.addLog('fetch', message, {
        fetchedCount: response.data.length,
        newCount: actuallyNewCount,
        priceChanges: priceChangedListings.length,
        alreadyExisted: alreadyExistedCount,
        totalInDb,
        type,
      });

      // Only send notifications if real-time notifications are enabled
      // and we have listings to notify about (new or price changed)
      if (this.notificationStartTime && listingsToNotify.length > 0) {
        logger.info(`Found ${listingsToNotify.length} listings to notify (${newListings.length} new, ${priceChangedListings.length} price changes)`);

        // Get all active filters and all users
        const [allFilters, allUsers] = await Promise.all([
          userFilterService.getAllActiveFilters(),
          prisma.user.findMany(),
        ]);

        // Group filters by user
        const filtersByUser = new Map<number, typeof allFilters>();
        for (const filter of allFilters) {
          if (!filtersByUser.has(filter.userId)) {
            filtersByUser.set(filter.userId, []);
          }
          filtersByUser.get(filter.userId)!.push(filter);
        }

        // Calculate age for each listing (minutes since created)
        const now = new Date();
        const apartmentsWithAge = await Promise.all(
          listingsToNotify.map(async (listing) => {
            const dbListing = await prisma.listing.findUnique({
              where: { id: listing.id },
              select: { createdAt: true },
            });
            const ageMinutes = dbListing
              ? Math.floor((now.getTime() - dbListing.createdAt.getTime()) / (1000 * 60))
              : 0;
            return {
              id: listing.id,
              title: listing.title,
              ageMinutes,
              price: listing.price,
            };
          })
        );

        // Log notification event
        const typeLabel = type === 'apartment' ? 'apartments' : 'houses';
        logService.addLog('notification', `${allUsers.length} users alerted with ${listingsToNotify.length} new ${typeLabel}`, {
          alertedUsers: allUsers.length,
          apartments: apartmentsWithAge,
          type,
        });

        // Send alerts for listings that need notification (new or price changed)
        // The telegram service will handle checking if user was already notified and price logic
        for (const listing of listingsToNotify) {
          // Send to users with filters (if listing matches)
          for (const [userId, filters] of filtersByUser.entries()) {
            await telegramService.sendAlert(listing, filters);
          }
          
          // Send to users without filters (they want all listings)
          for (const user of allUsers) {
            if (!filtersByUser.has(user.id)) {
              await telegramService.sendAlert(listing, [], user.id);
            }
          }
        }
      } else if (listingsToNotify.length > 0) {
        // Listings found but notifications not enabled yet (just logging for database seeding)
        logger.info(`Found ${listingsToNotify.length} ${type} listings to check (notifications not enabled, just seeding database)`);
      } else {
        logger.info(`No new ${type} listings or price changes found`);
      }
    } catch (error: any) {
      logger.error(`Error checking for new ${type} listings:`, error.message);
    }
  }

  /**
   * Get sync status
   */
  getStatus() {
    return {
      apartmentOffset: this.apartmentOffset,
      houseOffset: this.houseOffset,
      lastBackfillTime: this.lastBackfillTime,
      lastNewListingCheckTime: this.lastNewListingCheckTime,
      notificationStartTime: this.notificationStartTime,
      realTimeNotificationsEnabled: this.notificationStartTime !== null,
    };
  }
}

export const syncService = new SyncService();

