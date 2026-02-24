import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { config } from './config/env';
import { logger } from './utils/logger';
import { startBackfillJob } from './cron/backfillJob';
import { startNewListingJob } from './cron/newListingJob';
import { syncService } from './services/syncService';
import { telegramPollingService } from './services/telegramPollingService';

// Routes
import listingsRoutes from './routes/listingsRoutes';
import userRoutes from './routes/userRoutes';
import filterRoutes from './routes/filterRoutes';
import statusRoutes from './routes/statusRoutes';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import testRoutes from './routes/testRoutes';
import telegramRoutes from './routes/telegramRoutes';
import logRoutes from './routes/logRoutes';

const app = express();

// Determine if we're in production (Railway uses HTTPS)
const isProduction = process.env.NODE_ENV === 'production' || 
                     process.env.RAILWAY_ENVIRONMENT === 'production' ||
                     (process.env.PORT && process.env.PORT !== '3001'); // Railway sets PORT

// Session middleware (must be before CORS)
app.use(session({
  secret: process.env.SESSION_SECRET || 'househunter-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false, // Don't save empty sessions
  name: 'househunter.sid', // Custom session name
  cookie: {
    secure: isProduction ? true : false, // HTTPS required in production (Railway)
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-origin with credentials in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    // Don't set domain - let browser handle it
    // path: '/' is default
  },
}));

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin) return callback(null, true);
    
    // Allow requests from frontend URL or any IP address
    const allowedOrigins = [
      config.frontendUrl,
      /^http:\/\/localhost/,           // Local development
      /^http:\/\/127\.0\.0\.1/,        // Localhost IP
      /^http:\/\/192\.168\./,          // Private IP ranges
      /^http:\/\/10\./,                // Private IP ranges
      /^http:\/\/172\.(1[6-9]|2[0-9]|3[01])\./,  // Private IP ranges
      /^https:\/\/.*\.up\.railway\.app$/,  // Railway HTTPS URLs
      /^https:\/\/.*\.railway\.app$/,     // Railway custom domains
    ];
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      }
      return allowed.test(origin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      // Log rejected origins for debugging
      logger.warn(`CORS blocked origin: ${origin}`);
      // In production, you might want to reject: callback(new Error('Not allowed by CORS'))
      // For now, allow to avoid blocking legitimate requests
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
app.use('/api/listings', listingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/test', testRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/logs', logRoutes);

// Root endpoint - simple UP check
app.get('/', (req, res) => {
  res.send('UP!');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
  logger.info(`Frontend URL: ${config.frontendUrl}`);

  // Start cron jobs
  startBackfillJob(); // Database seeding (every 2 minutes)
  startNewListingJob(); // Real-time notifications (every 1 minute)
  
  // Enable real-time notifications from this point forward
  syncService.enableRealTimeNotifications();
  
  // Start Telegram polling to handle /start command
  telegramPollingService.startPolling();
  
  logger.info('Cron jobs ENABLED - using fixed filters: 60-100 sqm, 3 rooms, apartment, Kanton Sarajevo, price 100k-250k KM');
  logger.info('Real-time notifications ENABLED - checking for new listings every 1 minute');
  logger.info('Telegram polling ENABLED - listening for /start command to auto-register users');
});

