# Docker Disk Usage Check Script
Write-Host "🔍 Docker Disk Usage Report" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

Write-Host "`n📊 Overall Docker System Usage:" -ForegroundColor Yellow
docker system df

Write-Host "`n🖼️ Images:" -ForegroundColor Yellow
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

Write-Host "`n📦 Containers:" -ForegroundColor Yellow
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Size}}"

Write-Host "`n💾 Volumes:" -ForegroundColor Yellow
docker volume ls

Write-Host "`n🧹 Cleanup Recommendations:" -ForegroundColor Green
Write-Host "- Run 'docker system prune -a --volumes' to clean unused resources" -ForegroundColor White
Write-Host "- Run 'docker compose down -v' to remove containers and volumes" -ForegroundColor White
Write-Host "- Use './scripts/docker-clean-rebuild.ps1' for a complete clean rebuild" -ForegroundColor White 