# Railway Quick Start - Step by Step

## 🎯 The Key: Root Directory Setting

Railway needs to know which directory to look in for the Dockerfile.

## Step-by-Step Setup

### Backend Service

1. **Create Project**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `zakircinjarevic/houseHunter`

2. **Add Backend Service**:
   - Click "Add Service" → "GitHub Repo"
   - Select your repo
   - **IMPORTANT**: Click on the service name to open it
   - Go to **Settings** tab (gear icon)
   - Scroll to **"Root Directory"**
   - Type: `backend`
   - Click **"Save"**

3. **Railway will now**:
   - Look in `backend/` directory
   - Find `backend/Dockerfile`
   - Use `backend/railway.json` for config
   - Build and deploy!

4. **Add Environment Variables**:
   - Go to **Variables** tab
   - Add these (click "New Variable" for each):
     ```
     DATABASE_URL=file:./data/dev.db
     NODE_ENV=production
     TELEGRAM_BOT_TOKEN=your_token
     OLX_CLIENT_ID=your_id
     OLX_CLIENT_SECRET=your_secret
     OLX_ACCESS_TOKEN=your_token
     SESSION_SECRET=random_secret_here
     ```
   - **Don't set PORT** - Railway sets it automatically

5. **Get Backend URL**:
   - After deployment, Railway shows a URL like:
     `https://househunter-backend-production.up.railway.app`
   - Copy this URL!

---

### Frontend Service

1. **Add Frontend Service**:
   - In same project, click "Add Service" again
   - Select "GitHub Repo" → your repo
   - **IMPORTANT**: Click on the service name
   - Go to **Settings** tab
   - Set **Root Directory** to: `frontend`
   - Click **"Save"**

2. **Add Environment Variable**:
   - Go to **Variables** tab
   - Add:
     ```
     VITE_API_URL=https://your-backend-url.up.railway.app
     ```
     (Use the actual backend URL from step 5 above)

3. **Railway will**:
   - Look in `frontend/ directory
   - Find `frontend/Dockerfile`
   - Build the React app
   - Deploy with nginx

---

### Update Backend CORS

1. Go back to **Backend Service**
2. **Variables** tab
3. Add:
   ```
   FRONTEND_URL=https://your-frontend-url.up.railway.app
   ```
   (Use your actual frontend URL)

4. Railway auto-redeploys when you add variables

---

## ✅ Verification Checklist

- [ ] Backend service has Root Directory = `backend`
- [ ] Frontend service has Root Directory = `frontend`
- [ ] All environment variables are set
- [ ] Backend URL is copied
- [ ] Frontend has `VITE_API_URL` pointing to backend
- [ ] Backend has `FRONTEND_URL` pointing to frontend
- [ ] Both services show "Deployed" status

---

## 🎉 You're Done!

Your app should now be live at the frontend URL Railway provided!

## 🔍 How Railway Finds Dockerfiles

```
Repository Structure:
houseHunter/
├── backend/
│   ├── Dockerfile      ← Railway finds this when Root Directory = "backend"
│   ├── railway.json
│   └── ...
└── frontend/
    ├── Dockerfile      ← Railway finds this when Root Directory = "frontend"
    ├── railway.json
    └── ...
```

**The Root Directory setting tells Railway:**
- "Start from this directory"
- "Look for Dockerfile here"
- "Use railway.json from here"

Without Root Directory set, Railway looks in the repo root and won't find the Dockerfiles!

