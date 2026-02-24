# Deploy Pre-built Docker Images to Railway

You can build Docker images locally and push them to Railway's container registry, then deploy those images directly.

## Option 1: Railway Container Registry (Recommended)

Railway has its own container registry you can push to.

### Step 1: Install Railway CLI

```bash
# Windows (PowerShell)
iwr https://railway.app/install.sh | iex

# Or download from: https://railway.app/cli
```

### Step 2: Login to Railway

```bash
railway login
```

### Step 3: Link to Your Project

```bash
railway link
# Select your project
```

### Step 4: Build and Push Backend Image

```bash
cd backend

# Build the image
docker build -t househunter-backend .

# Tag for Railway registry
docker tag househunter-backend railway.app/househunter-backend:latest

# Push to Railway
railway up --dockerfile Dockerfile
```

Or manually:
```bash
# Get your Railway registry URL (from Railway dashboard → Settings → Registry)
# It looks like: registry.railway.app/v2/YOUR_PROJECT_ID

# Login to Railway registry
railway login

# Build and tag
docker build -t registry.railway.app/v2/YOUR_PROJECT_ID/househunter-backend:latest .

# Push
docker push registry.railway.app/v2/YOUR_PROJECT_ID/househunter-backend:latest
```

### Step 5: Deploy Image in Railway

1. In Railway dashboard, go to your service
2. Go to **Settings** → **Deploy**
3. Change **Source** from "GitHub" to "Docker Image"
4. Enter your image name: `registry.railway.app/v2/YOUR_PROJECT_ID/househunter-backend:latest`
5. Click **Deploy**

---

## Option 2: Docker Hub (Easier)

### Step 1: Build and Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Build backend
cd backend
docker build -t YOUR_DOCKERHUB_USERNAME/househunter-backend:latest .
docker push YOUR_DOCKERHUB_USERNAME/househunter-backend:latest

# Build frontend (need to set VITE_API_URL)
cd ../frontend
docker build --build-arg VITE_API_URL=https://your-backend-url.up.railway.app -t YOUR_DOCKERHUB_USERNAME/househunter-frontend:latest .
docker push YOUR_DOCKERHUB_USERNAME/househunter-frontend:latest
```

### Step 2: Deploy in Railway

1. In Railway, create new service
2. Select **"Deploy from Docker Hub"**
3. Enter: `YOUR_DOCKERHUB_USERNAME/househunter-backend:latest`
4. Add environment variables
5. Deploy!

---

## Option 3: GitHub Container Registry (ghcr.io)

### Step 1: Build and Push to GHCR

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Build and tag backend
cd backend
docker build -t ghcr.io/YOUR_GITHUB_USERNAME/househunter-backend:latest .
docker push ghcr.io/YOUR_GITHUB_USERNAME/househunter-frontend:latest

# Build and tag frontend
cd ../frontend
docker build --build-arg VITE_API_URL=https://your-backend-url.up.railway.app -t ghcr.io/YOUR_GITHUB_USERNAME/househunter-frontend:latest .
docker push ghcr.io/YOUR_GITHUB_USERNAME/househunter-frontend:latest
```

### Step 2: Deploy in Railway

1. In Railway, create service
2. Select **"Deploy from Docker Hub"** (GHCR works the same way)
3. Enter: `ghcr.io/YOUR_GITHUB_USERNAME/househunter-backend:latest`
4. Add environment variables
5. Deploy!

---

## Quick Script: Build and Push Both

Create `build-and-push.sh` (or `.bat` for Windows):

```bash
#!/bin/bash

# Backend
cd backend
docker build -t YOUR_DOCKERHUB_USERNAME/househunter-backend:latest .
docker push YOUR_DOCKERHUB_USERNAME/househunter-backend:latest

# Frontend (update VITE_API_URL with your backend URL)
cd ../frontend
docker build --build-arg VITE_API_URL=https://your-backend-url.up.railway.app -t YOUR_DOCKERHUB_USERNAME/househunter-frontend:latest .
docker push YOUR_DOCKERHUB_USERNAME/househunter-frontend:latest

echo "Done! Images pushed to Docker Hub"
```

Windows PowerShell version (`build-and-push.ps1`):

```powershell
# Backend
cd backend
docker build -t YOUR_DOCKERHUB_USERNAME/househunter-backend:latest .
docker push YOUR_DOCKERHUB_USERNAME/househunter-backend:latest

# Frontend
cd ..\frontend
docker build --build-arg VITE_API_URL=https://your-backend-url.up.railway.app -t YOUR_DOCKERHUB_USERNAME/househunter-frontend:latest .
docker push YOUR_DOCKERHUB_USERNAME/househunter-frontend:latest

Write-Host "Done! Images pushed to Docker Hub"
```

---

## Advantages of Pre-built Images

✅ **Faster deployments** - No build time on Railway  
✅ **Test locally first** - Build and test before deploying  
✅ **Consistent builds** - Same image every time  
✅ **Version control** - Tag images with versions  
✅ **Reuse images** - Deploy same image to multiple services  

---

## Railway CLI Commands

```bash
# Login
railway login

# Link to project
railway link

# Deploy from local Dockerfile
railway up --dockerfile backend/Dockerfile

# View logs
railway logs

# Open service
railway open
```

---

## Tips

1. **Tag with versions**: Use tags like `:v1.0.0`, `:latest`, `:main`
2. **Test locally first**: `docker run` your images before pushing
3. **Use .dockerignore**: Speeds up builds
4. **Multi-stage builds**: Already using them (good!)
5. **Cache layers**: Docker caches layers automatically

---

## Troubleshooting

### "unauthorized: authentication required"
- Make sure you're logged in: `docker login`
- Check your credentials

### "denied: requested access to the resource is denied"
- Verify image name matches your username/org
- Check you have push permissions

### Frontend can't connect to backend
- Make sure `VITE_API_URL` is set correctly in build
- Check backend URL is accessible
- Verify CORS settings in backend

