#!/bin/bash
set -e

# ── Azure App Service startup script for Laravel ──
# This script runs every time the container starts

echo "🚀 Starting Laravel deployment..."

cd /home/site/wwwroot

# ── 1. Generate app key if not already set ──
php artisan key:generate --force --no-interaction 2>/dev/null || true

# ── 2. Run database migrations ──
echo "📦 Running migrations..."
php artisan migrate --force --no-interaction

# ── 3. Create storage symlink ──
# Azure App Service needs the symlink recreated on each deploy
rm -f public/storage
php artisan storage:link --force 2>/dev/null || true

# ── 4. Ensure storage directories exist with correct permissions ──
mkdir -p storage/app/public/avatars
mkdir -p storage/app/public/posts
mkdir -p storage/framework/{cache,sessions,views}
mkdir -p storage/logs
chmod -R 775 storage bootstrap/cache

# ── 5. Clear and cache config for performance ──
echo "⚡ Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# ── 6. Optimize autoloader ──
composer dump-autoload --optimize --no-dev 2>/dev/null || true

echo "✅ Laravel startup complete — ready to serve!"
