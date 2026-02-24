import { Router } from 'express';
import { telegramService } from '../services/telegramService';
import { logger } from '../utils/logger';
import prisma from '../db/prisma';
import { listingService } from '../services/listingService';

const router = Router();

/**
 * GET /api/telegram/bot-info
 * Get bot information to verify token is valid
 */
router.get('/bot-info', async (req, res) => {
  try {
    const result = await telegramService.getBotInfo();
    if (result.success) {
      res.json({ 
        message: 'Bot token is valid',
        botInfo: result.info,
      });
    } else {
      res.status(500).json({ 
        error: result.error || 'Failed to get bot info' 
      });
    }
  } catch (error: any) {
    logger.error('Error getting bot info:', error.message);
    res.status(500).json({ error: 'Failed to get bot info' });
  }
});

/**
 * POST /api/telegram/test
 * Send a test message to a Telegram user
 */
router.post('/test', async (req, res) => {
  try {
    const { telegramId, message } = req.body;

    if (!telegramId) {
      return res.status(400).json({ error: 'telegramId is required' });
    }

    const testMessage = message || '🧪 Test message from House Hunter! If you receive this, Telegram notifications are working correctly.';

    const result = await telegramService.sendMessage(telegramId, testMessage);

    if (result.success) {
      res.json({ 
        message: 'Test message sent successfully',
        telegramId,
      });
    } else {
      res.status(500).json({ 
        error: result.error || 'Failed to send test message. Check if TELEGRAM_BOT_TOKEN is configured.' 
      });
    }
  } catch (error: any) {
    logger.error('Error sending test Telegram message:', error.message);
    res.status(500).json({ error: 'Failed to send test message' });
  }
});

/**
 * POST /api/telegram/test-listing
 * Send a test listing alert to a Telegram user
 */
router.post('/test-listing', async (req, res) => {
  try {
    const { telegramId } = req.body;

    if (!telegramId) {
      return res.status(400).json({ error: 'telegramId is required' });
    }

    // Get a sample listing from database
    const result = await listingService.getAllListings(0, 1);
    
    if (result.listings.length === 0) {
      return res.status(404).json({ error: 'No listings in database. Wait for cron jobs to fetch some listings first.' });
    }

    const sampleListing = result.listings[0];
    
    // Convert to OLXListing format (convert null to undefined)
    const olxListing = {
      id: sampleListing.id,
      title: sampleListing.title,
      description: sampleListing.description || undefined,
      price: sampleListing.price,
      url: sampleListing.url,
      location: sampleListing.location || undefined,
      images: sampleListing.images || [],
    };

    // Get user to send to
    const user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found with this Telegram ID' });
    }

    // Send as if it's a new listing (empty filters = send to all)
    await telegramService.sendAlert(olxListing, [], user.id);

    res.json({ 
      message: 'Test listing alert sent successfully',
      telegramId,
      listingId: sampleListing.id,
    });
  } catch (error: any) {
    logger.error('Error sending test listing alert:', error.message);
    res.status(500).json({ error: 'Failed to send test listing alert' });
  }
});

export default router;

