# 🏠 House Hunter - Real Estate Watcher

A full-stack application that monitors OLX listings and sends Telegram notifications to users based on their custom filters.

## 📋 Features

- **Automatic Listing Sync**: Periodically fetches new house/apartment listings from OLX API
- **Real-time Detection**: Detects brand-new listings every 5 minutes
- **Telegram Notifications**: Sends alerts to users when new listings match their filters
- **Custom Filters**: Users can set filters for price range, location, and property type
- **React Dashboard**: Beautiful UI to view listings, manage filters, and monitor system status
- **SQLite Database**: Local database to track all listings and changes

## 🏗️ Architecture

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite via Prisma ORM
- **Cron Jobs**: node-cron for scheduled tasks
- **Notifications**: Telegram Bot API

## 📁 Project Structure

```
houseHunter/
├── backend/
│   ├── src/
│   │   ├── config/       # Environment configuration
│   │   ├── db/           # Prisma client
│   │   ├── services/     # Business logic services
│   │   ├── cron/         # Scheduled jobs
│   │   ├── routes/       # API routes
│   │   └── utils/        # Utilities
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── api/          # API client functions
│   │   └── App.tsx       # Main app component
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Telegram Bot Token (get from [@BotFather](https://t.me/botfather))

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory:
```env
DATABASE_URL="file:./dev.db"
PORT=3001
OLX_API_BASE_URL="https://www.olx.ba/api/v1"
TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"
FRONTEND_URL="http://localhost:5173"
```

4. Generate Prisma client and run migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Start the backend server:
```bash
npm run dev
```

The backend will start on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 📡 API Endpoints

### Listings
- `GET /api/listings` - Get all listings (with pagination)
- `GET /api/listings/:id` - Get a specific listing

### Users
- `POST /api/users/register` - Register a new Telegram user
- `GET /api/users` - Get all users

### Filters
- `POST /api/filters/create` - Create a new filter
- `GET /api/filters/user/:userId` - Get all filters for a user
- `DELETE /api/filters/:id` - Delete a filter

### Status
- `GET /api/status` - Get system status and sync information

## ⏰ Cron Jobs

### Backfill Job
- **Schedule**: Every 2 minutes
- **Purpose**: Fetches 50 listings and increments offset to gradually backfill the database

### New Listing Check
- **Schedule**: Every 5 minutes
- **Purpose**: Checks page 0 for brand-new listings and sends Telegram alerts to users with matching filters

## 🔧 Configuration

### OLX API
The OLX service uses placeholder API endpoints. You'll need to adjust the `olxService.ts` file based on the actual OLX API structure:

- Update the API endpoint URLs
- Adjust the response transformation logic to match OLX's response format
- Configure pagination parameters if needed

### Telegram Bot
1. Create a bot with [@BotFather](https://t.me/botfather)
2. Get your bot token
3. Add it to the `.env` file as `TELEGRAM_BOT_TOKEN`
4. Users need to register their Telegram ID via the API

## 📊 Database Schema

### Listing
- Stores all listings with title, description, price, URL, location, images
- Tracks creation, update, and last seen timestamps

### User
- Stores Telegram user information
- Links to user filters

### UserFilter
- Stores user-defined filters (price range, location, type)
- Used to match new listings and send notifications

## 🎨 Frontend Pages

1. **Listings Page** (`/`): Browse all listings with pagination
2. **Filters Page** (`/filters`): Create and manage user filters
3. **Status Page** (`/status`): Monitor sync jobs and system statistics

## 🔍 Filter Matching Logic

Filters match listings based on:
- **Price**: Min/max price range
- **Location**: Partial string match (case-insensitive)
- **Type**: Searches for keywords in title/description (apartment/stan, house/kuća)

## 🛠️ Development

### Backend
```bash
npm run dev      # Start with hot reload
npm run build    # Build for production
npm start        # Run production build
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Database
```bash
npm run prisma:studio  # Open Prisma Studio (database GUI)
```

## 📝 Notes

- The OLX API integration uses placeholder endpoints - adjust based on actual API documentation
- Telegram notifications require users to register their Telegram ID first
- The database file (`dev.db`) is created automatically on first migration
- All cron jobs start immediately on server startup

## 🐛 Troubleshooting

1. **Database errors**: Run `npm run prisma:migrate` to ensure migrations are up to date
2. **Telegram not working**: Verify your bot token and ensure users are registered
3. **OLX API errors**: Check the API endpoint and adjust the service accordingly
4. **Port conflicts**: Change ports in `.env` (backend) and `vite.config.ts` (frontend)

## 📄 License

ISC

