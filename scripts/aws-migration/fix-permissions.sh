#!/bin/bash

# Script to fix .next directory permissions and start dev server

echo "🔧 Fixing Next.js permissions and starting dev server..."

# Kill any running Next.js processes
echo "Stopping any running Next.js processes..."
pkill -f "next" || true

# Wait a moment
sleep 2

# Try to fix permissions
echo "Fixing permissions on .next directory..."
sudo chown -R $(whoami) .next 2>/dev/null || true
sudo chmod -R 755 .next 2>/dev/null || true

# If that fails, try to remove with sudo
if [ -d ".next" ]; then
    echo "Removing .next directory with elevated permissions..."
    sudo rm -rf .next || true
fi

# Clear npm cache just in case
echo "Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

# Start the development server
echo "Starting development server..."
npm run dev