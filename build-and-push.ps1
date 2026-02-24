# Build and Push Docker Images to Docker Hub
# Usage: .\build-and-push.ps1

param(
    [string]$DockerHubUsername = "YOUR_DOCKERHUB_USERNAME",
    [string]$BackendUrl = "https://your-backend-url.up.railway.app"
)

Write-Host "Building and pushing Docker images..." -ForegroundColor Green

# Login check
Write-Host "`nChecking Docker login..." -ForegroundColor Yellow
docker info | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please login to Docker Hub first: docker login" -ForegroundColor Red
    exit 1
}

# Build and push backend
Write-Host "`nBuilding backend image..." -ForegroundColor Yellow
Set-Location backend
docker build -t "${DockerHubUsername}/househunter-backend:latest" .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "Pushing backend image..." -ForegroundColor Yellow
docker push "${DockerHubUsername}/househunter-backend:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend push failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Build and push frontend
Write-Host "`nBuilding frontend image..." -ForegroundColor Yellow
Set-Location frontend
docker build --build-arg VITE_API_URL=$BackendUrl -t "${DockerHubUsername}/househunter-frontend:latest" .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "Pushing frontend image..." -ForegroundColor Yellow
docker push "${DockerHubUsername}/househunter-frontend:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend push failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host "`n✅ Done! Images pushed to Docker Hub" -ForegroundColor Green
Write-Host "Backend: ${DockerHubUsername}/househunter-backend:latest" -ForegroundColor Cyan
Write-Host "Frontend: ${DockerHubUsername}/househunter-frontend:latest" -ForegroundColor Cyan
Write-Host "`nNow deploy these images in Railway!" -ForegroundColor Yellow

