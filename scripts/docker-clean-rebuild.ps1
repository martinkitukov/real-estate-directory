# NovaDom Docker Clean Rebuild Script (PowerShell)
# This script helps prevent Docker disk bloat during development

Write-Host "🧹 NovaDom Docker Clean Rebuild" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Step 1: Stop and remove everything
Write-Host "1️⃣ Stopping and removing containers..." -ForegroundColor Yellow
docker compose down -v --remove-orphans

# Step 2: Show current disk usage
Write-Host "2️⃣ Current Docker disk usage:" -ForegroundColor Yellow
docker system df

# Step 3: Clean up unused resources
Write-Host "3️⃣ Cleaning up unused Docker resources..." -ForegroundColor Yellow
docker system prune -a --volumes --force

# Step 4: Show disk usage after cleanup
Write-Host "4️⃣ Disk usage after cleanup:" -ForegroundColor Yellow
docker system df

# Step 5: Rebuild with no cache
Write-Host "5️⃣ Rebuilding images with no cache..." -ForegroundColor Yellow
docker compose build --no-cache

# Step 6: Start services
Write-Host "6️⃣ Starting services..." -ForegroundColor Yellow
docker compose up -d

# Step 7: Show final status
Write-Host "7️⃣ Final status:" -ForegroundColor Yellow
docker compose ps

Write-Host "✅ Clean rebuild complete!" -ForegroundColor Green
Write-Host "💡 Access your app at: http://localhost:3000" -ForegroundColor Green 