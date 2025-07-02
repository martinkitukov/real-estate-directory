#!/bin/bash

# NovaDom Docker Clean Rebuild Script
# This script helps prevent Docker disk bloat during development

echo "🧹 NovaDom Docker Clean Rebuild"
echo "=================================="

# Step 1: Stop and remove everything
echo "1️⃣ Stopping and removing containers..."
docker compose down -v --remove-orphans

# Step 2: Show current disk usage
echo "2️⃣ Current Docker disk usage:"
docker system df

# Step 3: Clean up unused resources
echo "3️⃣ Cleaning up unused Docker resources..."
docker system prune -a --volumes --force

# Step 4: Show disk usage after cleanup
echo "4️⃣ Disk usage after cleanup:"
docker system df

# Step 5: Rebuild with no cache
echo "5️⃣ Rebuilding images with no cache..."
docker compose build --no-cache

# Step 6: Start services
echo "6️⃣ Starting services..."
docker compose up -d

# Step 7: Show final status
echo "7️⃣ Final status:"
docker compose ps

echo "✅ Clean rebuild complete!"
echo "💡 Access your app at: http://localhost:3000" 