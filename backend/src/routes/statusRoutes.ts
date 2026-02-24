import { Router } from 'express';
import { syncService } from '../services/syncService';
import prisma from '../db/prisma';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/status
 * Get system status and sync information
 */
router.get('/', async (req, res) => {
  try {
    const syncStatus = syncService.getStatus();
    
    const [totalListings, totalUsers, totalFilters] = await Promise.all([
      prisma.listing.count(),
      prisma.user.count(),
      prisma.userFilter.count(),
    ]);

    res.json({
      sync: syncStatus,
      stats: {
        totalListings,
        totalUsers,
        totalFilters,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error fetching status:', error.message);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

/**
 * POST /api/status/enable-notifications
 * Enable real-time notifications from this point forward
 */
router.post('/enable-notifications', async (req, res) => {
  try {
    syncService.enableRealTimeNotifications();
    const status = syncService.getStatus();
    res.json({
      message: 'Real-time notifications enabled',
      notificationStartTime: status.notificationStartTime,
    });
  } catch (error: any) {
    logger.error('Error enabling notifications:', error.message);
    res.status(500).json({ error: 'Failed to enable notifications' });
  }
});

export default router;

