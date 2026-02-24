import cron from 'node-cron';
import { syncService } from '../services/syncService';
import { logger } from '../utils/logger';

/**
 * Backfill job: runs every 2 minutes
 * Fetches 50 items and increments offset
 */
export function startBackfillJob() {
  logger.info('Starting backfill cron job (runs every 2 minutes)');

  // Run immediately on startup
  syncService.initialBackfill();

  // Then run every 2 minutes
  cron.schedule('*/2 * * * *', async () => {
    await syncService.initialBackfill();
  });
}

