#!/bin/bash

# Build and Push Docker Images to Docker Hub
# Usage: ./build-and-push.sh YOUR_DOCKERHUB_USERNAME https://your-backend-url.up.railway.app

DOCKERHUB_USERNAME=${1:-"YOUR_DOCKERHUB_USERNAME"}
BACKEND_URL=${2:-"https://your-backend-url.up.railway.app"}

echo "Building and pushing Docker images..."

# Check if logged in
if ! docker info > /dev/null 2>&1; then
    echo "Please login to Docker Hub first: docker login"
    exit 1
fi

# Build and push backend
echo "Building backend image..."
cd backend
docker build -t "${DOCKERHUB_USERNAME}/househunter-backend:latest" .
if [ $? -ne 0 ]; then
    echo "Backend build failed!"
    cd ..
    exit 1
fi

echo "Pushing backend image..."
docker push "${DOCKERHUB_USERNAME}/househunter-backend:latest"
if [ $? -ne 0 ]; then
    echo "Backend push failed!"
    cd ..
    exit 1
fi
cd ..

# Build and push frontend
echo "Building frontend image..."
cd frontend
docker build --build-arg VITE_API_URL=$BACKEND_URL -t "${DOCKERHUB_USERNAME}/househunter-frontend:latest" .
if [ $? -ne 0 ]; then
    echo "Frontend build failed!"
    cd ..
    exit 1
fi

echo "Pushing frontend image..."
docker push "${DOCKERHUB_USERNAME}/househunter-frontend:latest"
if [ $? -ne 0 ]; then
    echo "Frontend push failed!"
    cd ..
    exit 1
fi
cd ..

echo ""
echo "✅ Done! Images pushed to Docker Hub"
echo "Backend: ${DOCKERHUB_USERNAME}/househunter-backend:latest"
echo "Frontend: ${DOCKERHUB_USERNAME}/househunter-frontend:latest"
echo ""
echo "Now deploy these images in Railway!"

