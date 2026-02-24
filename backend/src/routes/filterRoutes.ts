import { Router } from 'express';
import { userFilterService } from '../services/userFilterService';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/filters/create
 * Create a new filter for a user
 */
router.post('/create', async (req, res) => {
  try {
    const { userId, minPrice, maxPrice, location, type } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const filter = await userFilterService.createFilter({
      userId,
      minPrice,
      maxPrice,
      location,
      type,
    });

    res.json({ message: 'Filter created successfully', filter });
  } catch (error: any) {
    logger.error('Error creating filter:', error.message);
    res.status(500).json({ error: 'Failed to create filter' });
  }
});

/**
 * GET /api/filters/user/:userId
 * Get all filters for a user
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    const filters = await userFilterService.getFiltersByUserId(userId);

    res.json(filters);
  } catch (error: any) {
    logger.error('Error fetching filters:', error.message);
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
});

/**
 * DELETE /api/filters/:id
 * Delete a filter
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid filter id' });
    }

    await userFilterService.deleteFilter(id);

    res.json({ message: 'Filter deleted successfully' });
  } catch (error: any) {
    logger.error('Error deleting filter:', error.message);
    res.status(500).json({ error: 'Failed to delete filter' });
  }
});

export default router;

