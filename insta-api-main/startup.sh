#!/bin/bash

# ── Azure App Service startup script for Laravel ──
# This script runs every time the container starts

cd /home/site/wwwroot

# Generate app key if not set
php artisan key:generate --force --no-interaction 2>/dev/null || true

# Run migrations
php artisan migrate --force --no-interaction

# Create storage symlink
php artisan storage:link --force 2>/dev/null || true

# Clear and cache config for performance
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Laravel startup complete"
