import dotenv from 'dotenv';
import path from 'path';

// Load .env file from backend directory
const envPath = path.resolve(__dirname, '../../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn(`[CONFIG] Warning: Could not load .env file from ${envPath}`);
} else {
  console.log(`[CONFIG] Loaded .env file from ${envPath}`);
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10), // Railway sets PORT automatically
  databaseUrl: process.env.DATABASE_URL || 'file:./data/dev.db',
  olxApiBaseUrl: process.env.OLX_API_BASE_URL || 'https://api.olx.ba',
  olxClientId: process.env.OLX_CLIENT_ID || '',
  olxClientSecret: process.env.OLX_CLIENT_SECRET || '',
  olxAccessToken: process.env.OLX_ACCESS_TOKEN || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

