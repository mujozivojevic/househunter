# GitHub-Based Deployment Guide

Deploy directly from GitHub without installing any CLI tools! 🚀

## 🎯 Recommended: Railway (Easiest)

Railway can deploy directly from GitHub with zero configuration.

**See [RAILWAY-SETUP.md](./RAILWAY-SETUP.md) for detailed Railway setup instructions.**

### Step 1: Push to GitHub

1. **Create a GitHub repository** (if you haven't already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/houseHunter.git
   git push -u origin main
   ```

2. **Make sure `.env` is in `.gitignore`** (never commit secrets!)

### Step 2: Deploy to Railway

1. **Sign up** at [railway.app](https://railway.app) (use GitHub login)

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `houseHunter` repository

3. **Deploy Backend**:
   - Railway will detect your repo
   - Click "Add Service" → "GitHub Repo"
   - Select your repo
   - Set **Root Directory** to: `backend`
   - Railway auto-detects the Dockerfile! 🎉

4. **Add Environment Variables** (in Railway dashboard):
   ```
   DATABASE_URL=file:./data/dev.db
   NODE_ENV=production
   PORT=3001
   TELEGRAM_BOT_TOKEN=your_token_here
   OLX_CLIENT_ID=your_id_here
   OLX_CLIENT_SECRET=your_secret_here
   OLX_ACCESS_TOKEN=your_token_here
   SESSION_SECRET=your_random_secret_here
   ```
   - Click "Variables" tab in your service
   - Add each variable

5. **Get Backend URL**:
   - Railway gives you a URL like: `https://househunter-backend-production.up.railway.app`
   - Copy this URL!

6. **Deploy Frontend**:
   - Click "Add Service" again
   - Select same repo
   - Set **Root Directory** to: `frontend`
   - Add **Environment Variable**:
     ```
     VITE_API_URL=https://your-backend-url.up.railway.app
     ```
   - Railway will build and deploy automatically!

7. **Update Backend CORS**:
   - In backend service, add environment variable:
     ```
     FRONTEND_URL=https://your-frontend-url.up.railway.app
     ```
   - Redeploy backend (Railway auto-redeploys on variable changes)

**That's it!** Your app is live! 🎉

---

## 🎨 Alternative: Render (Also Easy)

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy to Render

1. **Sign up** at [render.com](https://render.com) (use GitHub login)

2. **Deploy Backend**:
   - Click "New" → "Web Service"
   - Connect your GitHub repo
   - Settings:
     - **Name**: `househunter-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm ci && npx prisma generate && npm run build`
     - **Start Command**: `npm start`
   - Add **Environment Variables** (same as Railway)
   - Click "Create Web Service"

3. **Deploy Frontend**:
   - Click "New" → "Static Site"
   - Connect same GitHub repo
   - Settings:
     - **Name**: `househunter-frontend`
     - **Root Directory**: `frontend`
     - **Build Command**: `npm ci && npm run build`
     - **Publish Directory**: `dist`
   - Add **Environment Variable**:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com
     ```

4. **Update Backend CORS**:
   - In backend service, add:
     ```
     FRONTEND_URL=https://your-frontend-url.onrender.com
     ```

---

## ⚡ Alternative: Vercel (Frontend) + Railway (Backend)

Best of both worlds - Vercel is amazing for frontend!

### Frontend on Vercel

1. **Sign up** at [vercel.com](https://vercel.com) (use GitHub login)

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import your GitHub repo
   - Settings:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add **Environment Variable**:
     ```
     VITE_API_URL=https://your-backend-url.up.railway.app
     ```
   - Click "Deploy"

3. **Backend on Railway** (follow Railway steps above)

---

## 🔄 Automatic Deployments

All these platforms automatically deploy when you push to GitHub!

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Platform automatically rebuilds and deploys! 🚀
```

---

## 🔐 Security: Environment Variables

**Never commit secrets to GitHub!**

Make sure your `.gitignore` includes:
```
.env
.env.local
*.db
*.db-journal
data/
```

**Add secrets in platform dashboard:**
- Railway: Service → Variables tab
- Render: Service → Environment tab
- Vercel: Project → Settings → Environment Variables

---

## 📊 Comparison

| Platform | Free Tier | Ease of Use | Auto-Deploy | Best For |
|----------|-----------|-------------|-------------|----------|
| **Railway** | $5/month credit | ⭐⭐⭐⭐⭐ | ✅ | Full-stack apps |
| **Render** | Limited free | ⭐⭐⭐⭐ | ✅ | Simple deployments |
| **Vercel** | Generous | ⭐⭐⭐⭐⭐ | ✅ | Frontend/Static sites |

---

## 🚀 Quick Start (Railway - Recommended)

1. **Push code to GitHub**
2. **Sign up at railway.app** (GitHub login)
3. **New Project** → Select repo
4. **Add Backend Service** (root: `backend`)
5. **Add Environment Variables**
6. **Add Frontend Service** (root: `frontend`)
7. **Done!** 🎉

**Total time: ~10 minutes!**

---

## 💡 Pro Tips

1. **Use Railway's GitHub integration** - it's the easiest
2. **Enable auto-deploy** - every push = new deployment
3. **Use Railway's built-in PostgreSQL** - better than SQLite for production
4. **Set up custom domains** - free SSL included
5. **Monitor logs** - all platforms have built-in log viewers

---

## 🐛 Troubleshooting

### Build fails
- Check build logs in platform dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version (should be 20)

### Environment variables not working
- Make sure variable names match exactly
- Redeploy after adding variables
- Check for typos

### CORS errors
- Update `FRONTEND_URL` in backend
- Ensure frontend URL matches exactly (including https://)

### Database issues
- SQLite works but consider PostgreSQL for production
- Railway offers free PostgreSQL addon

---

## 📝 Next Steps

After deployment:
1. ✅ Test your app at the provided URL
2. ✅ Set up custom domain (optional)
3. ✅ Enable monitoring
4. ✅ Configure Telegram bot
5. ✅ Start monitoring logs

**You're live!** 🎉

