import express from 'express';
import { logService } from '../services/logService';

const router = express.Router();

/**
 * GET /api/logs
 * Get recent activity logs
 */
router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = logService.getLogs(limit);
    res.json({ logs });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

/**
 * DELETE /api/logs
 * Clear all logs
 */
router.delete('/', (req, res) => {
  try {
    logService.clearLogs();
    res.json({ message: 'Logs cleared' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to clear logs' });
  }
});

export default router;

