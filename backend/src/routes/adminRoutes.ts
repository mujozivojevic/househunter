import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/admin/logout
 * Admin logout endpoint (no auth required)
 */
router.post('/logout', (req: Request, res: Response) => {
  req.session?.destroy((err) => {
    if (err) {
      logger.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    
    logger.info('Admin logout successful');
    res.json({ success: true, message: 'Logout successful' });
  });
});

/**
 * GET /api/admin/me
 * Get current admin session info (no auth required)
 */
router.get('/me', (req: Request, res: Response) => {
  res.json({ 
    authenticated: true,
    username: 'admin'
  });
});

/**
 * GET /api/admin/check
 * Check if user is authenticated (always returns true - no login required)
 */
router.get('/check', (req: Request, res: Response) => {
  res.json({ 
    authenticated: true,
    username: 'admin'
  });
});

export default router;

