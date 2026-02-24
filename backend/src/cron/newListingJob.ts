import cron from 'node-cron';
import { syncService } from '../services/syncService';
import { logger } from '../utils/logger';

/**
 * New listing check job: runs every 30 seconds for real-time notifications
 * Checks page 0 for new listings and sends alerts
 * Database seeding continues in background (every 2 minutes via backfill)
 */
export function startNewListingJob() {
  logger.info('Starting real-time listing check cron job (runs every 30 seconds)');

  // Run immediately on startup
  syncService.checkForNewListings();

  // Run every 30 seconds for real-time notifications
  cron.schedule('*/30 * * * * *', async () => {
    await syncService.checkForNewListings();
  });
}

