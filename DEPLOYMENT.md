# Deployment Guide

This guide covers deploying HouseHunter to free cloud platforms.

> **🚀 Easiest Option: [Deploy from GitHub](./DEPLOYMENT-GITHUB.md) - No CLI needed!**
> 
> **For Google Cloud Platform deployment, see [DEPLOYMENT-GCP.md](./DEPLOYMENT-GCP.md)**

## 🚀 Free Cloud Options

### Option 1: Railway (Recommended - Easiest)

**Railway** offers a free tier with $5 credit monthly.

#### Steps:

1. **Sign up** at [railway.app](https://railway.app)

2. **Install Railway CLI** (optional):
   ```bash
   npm i -g @railway/cli
   railway login
   ```

3. **Deploy Backend**:
   - Create new project in Railway
   - Connect your GitHub repo
   - Add a new service → Select `backend` folder
   - Railway will auto-detect Dockerfile
   - Add environment variables:
     ```
     DATABASE_URL=file:./data/dev.db
     PORT=3001
     FRONTEND_URL=https://your-frontend-url.railway.app
     TELEGRAM_BOT_TOKEN=your_token
     OLX_CLIENT_ID=your_id
     OLX_CLIENT_SECRET=your_secret
     OLX_ACCESS_TOKEN=your_token
     NODE_ENV=production
     ```

4. **Deploy Frontend**:
   - Add another service → Select `frontend` folder
   - Add environment variable:
     ```
     VITE_API_URL=https://your-backend-url.railway.app
     ```
   - Update `frontend/src/api/*.ts` files to use `import.meta.env.VITE_API_URL`

5. **Get URLs** and update `FRONTEND_URL` in backend

---

### Option 2: Render

**Render** offers free tier with some limitations.

#### Steps:

1. **Sign up** at [render.com](https://render.com)

2. **Deploy Backend**:
   - New → Web Service
   - Connect GitHub repo
   - Root Directory: `backend`
   - Build Command: `npm ci && npx prisma generate && npm run build`
   - Start Command: `npm start`
   - Environment Variables: (same as Railway)
   - Add Disk: 1GB (for SQLite database)

3. **Deploy Frontend**:
   - New → Static Site
   - Root Directory: `frontend`
   - Build Command: `npm ci && npm run build`
   - Publish Directory: `dist`
   - Environment Variables:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com
     ```

---

### Option 3: Fly.io

**Fly.io** offers free tier with 3 shared VMs.

#### Steps:

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   fly auth signup
   ```

2. **Deploy Backend**:
   ```bash
   cd backend
   fly launch
   # Follow prompts, select region
   fly secrets set TELEGRAM_BOT_TOKEN=your_token
   fly secrets set OLX_CLIENT_ID=your_id
   # ... set all secrets
   fly deploy
   ```

3. **Deploy Frontend**:
   ```bash
   cd frontend
   fly launch
   fly deploy
   ```

---

### Option 4: Vercel (Frontend) + Railway/Render (Backend)

**Vercel** is excellent for frontend, free tier is generous.

#### Steps:

1. **Deploy Frontend to Vercel**:
   - Sign up at [vercel.com](https://vercel.com)
   - Import GitHub repo
   - Root Directory: `frontend`
   - Framework Preset: Vite
   - Environment Variable:
     ```
     VITE_API_URL=https://your-backend-url.railway.app
     ```

2. **Deploy Backend** to Railway or Render (see above)

---

## 📝 Important Notes

### Database Persistence

SQLite files need persistent storage:
- **Railway**: Automatically persists volumes
- **Render**: Add a Disk (1GB free)
- **Fly.io**: Use volumes: `fly volumes create data --size 1`

### Environment Variables

Make sure to set all required environment variables:
- `TELEGRAM_BOT_TOKEN`
- `OLX_CLIENT_ID`
- `OLX_CLIENT_SECRET`
- `OLX_ACCESS_TOKEN`
- `DATABASE_URL` (for SQLite: `file:./data/dev.db`)
- `FRONTEND_URL` (your frontend URL)
- `PORT` (usually auto-set by platform)

### CORS Configuration

Update `backend/src/index.ts` CORS settings to allow your frontend domain:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-frontend.vercel.app',
  credentials: true,
}));
```

### Database Migrations

Run migrations on first deploy:
```bash
# In Railway/Render shell or via CLI
cd backend
npx prisma migrate deploy
```

---

## 🐳 Local Docker Testing

Test locally before deploying:

```bash
# Build and run
docker-compose up --build

# Access UI at:
# - http://localhost (frontend)
# - http://localhost:3001 (backend API)
# - http://YOUR_IP_ADDRESS (from other devices on same network)
```

### Accessing via IP Address

To access the UI from other devices on your network:

1. **Find your server's IP address**:
   ```bash
   # Windows
   ipconfig
   
   # Linux/Mac
   ifconfig
   # or
   hostname -I
   ```

2. **Update environment variables**:
   - Set `FRONTEND_URL=http://YOUR_IP_ADDRESS` in backend
   - Set `VITE_API_URL=http://YOUR_IP_ADDRESS:3001` in frontend build

3. **Access from other devices**:
   - Open browser on phone/tablet/other computer
   - Navigate to `http://YOUR_IP_ADDRESS`
   - Make sure firewall allows port 80 and 3001

4. **For Docker Compose**:
   ```bash
   # Update docker-compose.yml FRONTEND_URL to your IP
   # Then rebuild
   docker-compose up --build
   ```

### Running Individual Containers

```bash
# Backend
cd backend
docker build -t househunter-backend .
docker run -p 3001:3001 \
  -e FRONTEND_URL=http://YOUR_IP_ADDRESS \
  -e TELEGRAM_BOT_TOKEN=your_token \
  --env-file .env \
  househunter-backend

# Frontend
cd frontend
docker build -t househunter-frontend \
  --build-arg VITE_API_URL=http://YOUR_IP_ADDRESS:3001 .
docker run -p 80:80 househunter-frontend
```

---

## 🔧 Troubleshooting

### Database locked errors
- Ensure only one instance is writing to SQLite
- Use PostgreSQL for production (recommended for multiple instances)

### Port issues
- Most platforms set `PORT` automatically
- Use `process.env.PORT` in your code

### Build failures
- Check Node version (should be 20)
- Ensure all dependencies are in `package.json`
- Check build logs for specific errors

---

## 💡 Recommended Setup

**Best for free tier:**
- **Frontend**: Vercel (excellent free tier)
- **Backend**: Railway (easiest setup, good free tier)
- **Database**: SQLite (included) or upgrade to PostgreSQL later

This gives you:
- ✅ Free hosting
- ✅ Automatic SSL/HTTPS
- ✅ Easy deployments from GitHub
- ✅ Good performance

