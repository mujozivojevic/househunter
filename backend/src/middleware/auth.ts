import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user is authenticated as admin
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  
  res.status(401).json({ error: 'Unauthorized. Please login.' });
}

