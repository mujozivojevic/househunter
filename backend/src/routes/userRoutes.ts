import { Router } from 'express';
import prisma from '../db/prisma';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/users/register
 * Register a new Telegram user
 */
router.post('/register', async (req, res) => {
  try {
    const { telegramId, username } = req.body;

    if (!telegramId) {
      return res.status(400).json({ error: 'telegramId is required' });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (user) {
      return res.json({ message: 'User already exists', user });
    }

    // Create new user
    user = await prisma.user.create({
      data: {
        telegramId,
        username: username || null,
      },
    });

    res.json({ message: 'User registered successfully', user });
  } catch (error: any) {
    logger.error('Error registering user:', error.message);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

/**
 * GET /api/users
 * Get all users
 */
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        filters: true,
      },
    });

    res.json(users);
  } catch (error: any) {
    logger.error('Error fetching users:', error.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;

