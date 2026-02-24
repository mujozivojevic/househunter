import { Router } from 'express';
import { listingService } from '../services/listingService';
import { logger } from '../utils/logger';
import prisma from '../db/prisma';

const router = Router();

/**
 * GET /api/listings
 * Get all listings with pagination
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await listingService.getAllListings(page, limit);

    res.json(result);
  } catch (error: any) {
    logger.error('Error fetching listings:', error.message);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

/**
 * GET /api/listings/:id
 * Get a specific listing by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const listing = await listingService.getListingById(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json(listing);
  } catch (error: any) {
    logger.error('Error fetching listing:', error.message);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

/**
 * DELETE /api/listings/flush
 * Delete all listings from database
 */
router.delete('/flush', async (req, res) => {
  try {
    const count = await prisma.listing.deleteMany({});
    logger.info(`Flushed ${count.count} listings from database`);
    res.json({ message: `Deleted ${count.count} listings`, count: count.count });
  } catch (error: any) {
    logger.error('Error flushing listings:', error.message);
    res.status(500).json({ error: 'Failed to flush listings' });
  }
});

/**
 * DELETE /api/listings/clear-old
 * Clear old listings (created before Nov 15, 2025 and not updated in last 7 days)
 */
router.delete('/clear-old', async (req, res) => {
  try {
    const count = await listingService.clearOldListings();
    res.json({ message: `Cleared ${count} old listings`, count });
  } catch (error: any) {
    logger.error('Error clearing old listings:', error.message);
    res.status(500).json({ error: 'Failed to clear old listings' });
  }
});

export default router;
