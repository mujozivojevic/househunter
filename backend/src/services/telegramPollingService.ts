import { telegramService } from './telegramService';
import { logger } from '../utils/logger';

export class TelegramPollingService {
  private lastUpdateId: number = 0;
  private isPolling: boolean = false;

  /**
   * Start polling for Telegram updates
   */
  async startPolling(): Promise<void> {
    if (this.isPolling) {
      logger.warn('Telegram polling already started');
      return;
    }

    this.isPolling = true;
    logger.info('Starting Telegram polling service for /start command handling');

    // Start polling loop
    this.poll();
  }

  /**
   * Poll for updates
   */
  private async poll(): Promise<void> {
    while (this.isPolling) {
      try {
        const updates = await telegramService.getUpdates(this.lastUpdateId > 0 ? this.lastUpdateId + 1 : undefined);

        if (updates && updates.ok && updates.result) {
          for (const update of updates.result) {
            // Update last processed update ID
            if (update.update_id >= this.lastUpdateId) {
              this.lastUpdateId = update.update_id;
            }

            // Handle the message
            await telegramService.handleMessage(update);
          }
        }

        // Small delay before next poll
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        logger.error('Error in Telegram polling:', error.message);
        // Wait a bit longer on error before retrying
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  /**
   * Stop polling
   */
  stopPolling(): void {
    this.isPolling = false;
    logger.info('Stopped Telegram polling service');
  }
}

export const telegramPollingService = new TelegramPollingService();

