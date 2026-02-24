# Docker Setup for Windows

## Error: "The system cannot find the file specified"

This error means **Docker Desktop is not running** on Windows.

## Solution

### Step 1: Start Docker Desktop

1. **Open Docker Desktop** from Start Menu
   - Search for "Docker Desktop" in Windows
   - Click to launch

2. **Wait for Docker to start**
   - You'll see a Docker icon in the system tray (bottom right)
   - Wait until it shows "Docker Desktop is running"
   - This can take 1-2 minutes on first start

### Step 2: Verify Docker is Running

```powershell
# Check Docker version
docker --version

# Check if Docker daemon is running
docker info
```

If `docker info` works without errors, Docker is running!

### Step 3: Now Build Your Images

```powershell
# Navigate to backend
cd backend

# Build the image
docker build -t zcinjar/househunter-backend:latest .

# Should work now!
```

## If Docker Desktop is Not Installed

1. **Download Docker Desktop**:
   - Go to: https://www.docker.com/products/docker-desktop/
   - Download "Docker Desktop for Windows"
   - Install it

2. **Restart your computer** after installation

3. **Start Docker Desktop** and wait for it to fully start

## Quick Check Commands

```powershell
# Check if Docker Desktop process is running
Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue

# Check Docker status
docker info

# Test with a simple command
docker run hello-world
```

## Troubleshooting

### Docker Desktop won't start
- Make sure WSL 2 is installed (Docker Desktop requires it)
- Check Windows features: Enable "Virtual Machine Platform" and "Windows Subsystem for Linux"
- Restart your computer

### Still getting connection errors
- Make sure Docker Desktop is fully started (check system tray icon)
- Try restarting Docker Desktop
- Check if Hyper-V is enabled (required for Docker on Windows)

### WSL 2 not installed
```powershell
# Install WSL 2
wsl --install

# Restart computer, then start Docker Desktop
```

