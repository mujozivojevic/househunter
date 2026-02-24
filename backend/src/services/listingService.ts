import prisma from '../db/prisma';
import { OLXListing } from './olxService';
import { logger } from '../utils/logger';

export class ListingService {
  /**
   * Store or update a listing in the database
   */
  async upsertListing(listing: OLXListing): Promise<void> {
    try {
      await prisma.listing.upsert({
        where: { id: listing.id },
        update: {
          title: listing.title,
          description: listing.description || null,
          price: listing.price,
          url: listing.url,
          location: listing.location || null,
          images: JSON.stringify(listing.images || []),
          updatedAt: new Date(),
          lastSeen: new Date(),
        },
        create: {
          id: listing.id,
          title: listing.title,
          description: listing.description || null,
          price: listing.price,
          url: listing.url,
          location: listing.location || null,
          images: JSON.stringify(listing.images || []),
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSeen: new Date(),
        },
      });
    } catch (error: any) {
      logger.error(`Error upserting listing ${listing.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Check if a listing exists
   */
  async listingExists(id: string): Promise<boolean> {
    const listing = await prisma.listing.findUnique({
      where: { id },
    });
    return !!listing;
  }

  /**
   * Get all listings with pagination
   */
  async getAllListings(page: number = 0, limit: number = 50) {
    const skip = page * limit;
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.listing.count(),
    ]);

    return {
      listings: listings.map((l) => ({
        ...l,
        images: JSON.parse(l.images || '[]'),
      })),
      total,
      page,
      limit,
    };
  }

  /**
   * Get listing by ID
   */
  async getListingById(id: string) {
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) return null;

    return {
      ...listing,
      images: JSON.parse(listing.images || '[]'),
    };
  }

  /**
   * Get new listings (created in the last N minutes)
   */
  async getNewListings(minutes: number = 5) {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    const listings = await prisma.listing.findMany({
      where: {
        createdAt: {
          gte: since,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return listings.map((l) => ({
      ...l,
      images: JSON.parse(l.images || '[]'),
    }));
  }

  /**
   * Clear old listings - keep only those created/updated in last 7 days or from Nov 15, 2025 onwards
   */
  async clearOldListings(): Promise<number> {
    const nov15_2025 = new Date('2025-11-15T00:00:00.000Z');
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Delete listings that:
    // - Were created before Nov 15, 2025 AND haven't been updated in the last 7 days
    const result = await prisma.listing.deleteMany({
      where: {
        AND: [
          {
            createdAt: {
              lt: nov15_2025,
            },
          },
          {
            updatedAt: {
              lt: sevenDaysAgo,
            },
          },
        ],
      },
    });

    logger.info(`Cleared ${result.count} old listings (created before Nov 15, 2025 and not updated in last 7 days)`);
    return result.count;
  }
}

export const listingService = new ListingService();

