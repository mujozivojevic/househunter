# Railway Setup Guide

## Quick Setup Steps

### 1. Deploy Backend

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `houseHunter` repository
4. Click **"Add Service"** → **"GitHub Repo"**
5. Select your repo again
6. **CRITICAL**: In the service settings:
   - Go to **Settings** tab
   - Find **"Root Directory"** section
   - Set it to: `backend`
   - Railway will now look for `backend/Dockerfile`
7. Railway will detect the Dockerfile automatically once Root Directory is set

### 2. Configure Backend Environment Variables

In the backend service, go to **Variables** tab and add:

```
DATABASE_URL=file:./data/dev.db
NODE_ENV=production
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
OLX_CLIENT_ID=your_olx_client_id
OLX_CLIENT_SECRET=your_olx_client_secret
OLX_ACCESS_TOKEN=your_olx_access_token
SESSION_SECRET=your_random_secret_here_make_it_long_and_random
```

**Note**: Railway sets `PORT` automatically - don't set it manually!

### 3. Get Backend URL

After deployment, Railway will give you a URL like:
```
https://househunter-backend-production.up.railway.app
```

Copy this URL - you'll need it for the frontend!

### 4. Deploy Frontend

1. In the same Railway project, click **"Add Service"** again
2. Select **"GitHub Repo"** → your repo
3. **CRITICAL**: In the service settings:
   - Go to **Settings** tab
   - Find **"Root Directory"** section
   - Set it to: `frontend`
   - Railway will now look for `frontend/Dockerfile`
4. Go to **Variables** tab
5. Add:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app
   ```
   (Replace with your actual backend URL from step 3)

### 5. Update Backend CORS

1. Go back to backend service
2. Add environment variable:
   ```
   FRONTEND_URL=https://your-frontend-url.up.railway.app
   ```
   (Replace with your actual frontend URL)

3. Railway will automatically redeploy when you add variables

## Troubleshooting

### "Error creating build plan with Railpack" or "Dockerfile doesn't exist"

This means Railway is looking in the wrong directory. Solution:
1. **Go to your service Settings** in Railway
2. **Find "Root Directory"** field
3. **Set it to:**
   - `backend` for backend service
   - `frontend` for frontend service
4. **Save** and Railway will redeploy
5. The `railway.json` files help, but Root Directory is the key setting!

**Visual Guide:**
```
Your Repo Root/
├── backend/
│   ├── Dockerfile  ← Railway finds this when Root Directory = "backend"
│   └── railway.json
└── frontend/
    ├── Dockerfile  ← Railway finds this when Root Directory = "frontend"
    └── railway.json
```

### Build fails

- Check build logs in Railway dashboard
- Make sure all dependencies are in `package.json`
- Verify Node version (should be 20)

### Port errors

- Railway sets `PORT` automatically - don't override it
- The app listens on `process.env.PORT` which Railway provides

### Database issues

- SQLite works but data is ephemeral (lost on redeploy)
- Consider adding Railway's PostgreSQL addon for persistent data
- Or use Railway's volume mount for SQLite file

## Railway Features

- ✅ **Auto-deploy** on every git push
- ✅ **Free SSL/HTTPS** automatically
- ✅ **Environment variables** management
- ✅ **Logs** viewer in dashboard
- ✅ **Metrics** and monitoring
- ✅ **Custom domains** (free)

## Next Steps

1. Test your deployed app
2. Set up custom domain (optional)
3. Monitor logs for any issues
4. Configure Telegram bot with your Railway URLs

