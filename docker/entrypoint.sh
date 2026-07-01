#!/bin/bash
set -e

mkdir -p /app/data/aria2
mkdir -p /app/data/server
mkdir -p /app/data/downloads

if [ ! -f /app/data/aria2/aria2.session ]; then
    touch /app/data/aria2/aria2.session
fi

if [ ! -f /app/data/aria2/aria2.conf ]; then
    cp /app/aria2.conf.template /app/data/aria2/aria2.conf
fi

# Always generate a clean runtime config from template to avoid any corruption issues
# User customizations via env vars will override settings when needed
cp /app/aria2.conf.template /app/data/aria2/aria2.conf.runtime

# Merge valid custom settings from user config if file exists
if [ -f /app/data/aria2/aria2.conf ]; then
    echo "Merging user customizations from aria2.conf..."
    TMP_USER=$(mktemp)
    grep -E '^[a-z][a-z0-9-]*=[^=[:space:]]+$' /app/data/aria2/aria2.conf 2>/dev/null | \
        grep -v '^rpc-secret=$' | \
        grep -v '^log=' | \
        grep -v '^log-level=' | \
        sort -u > "$TMP_USER" || true

    if [ -s "$TMP_USER" ]; then
        TMP_MERGED=$(mktemp)
        while IFS= read -r line; do
            key="${line%%=*}"
            if ! grep -q "^${key}=" "$TMP_USER"; then
                echo "$line" >> "$TMP_MERGED"
            fi
        done < /app/aria2.conf.template
        cat "$TMP_USER" >> "$TMP_MERGED"
        mv "$TMP_MERGED" /app/data/aria2/aria2.conf.runtime
    fi
    rm -f "$TMP_USER"
fi

# Build aria2 command
ARIA2_CMD="aria2c --conf-path=/app/data/aria2/aria2.conf.runtime --log=- --log-level=notice"
if [ -n "${ARIA2_SECRET:-}" ]; then
    ARIA2_CMD="$ARIA2_CMD --rpc-secret=$ARIA2_SECRET"
fi

# Create server .env file with correct paths ALWAYS
cat > /app/data/server/.env << EOF
PORT=65004
NODE_ENV=production
DATA_DIR=/app/data/server
JWT_SECRET=${JWT_SECRET:-your-secret-key-change-in-production}
JWT_EXPIRES_IN=${JWT_EXPIRES_IN:-7d}
ARIA2_RPC_URL=${ARIA2_RPC_URL:-http://localhost:6800/jsonrpc}
ARIA2_SECRET=${ARIA2_SECRET:-}
ENABLE_REGISTER=${ENABLE_REGISTER:-false}
EOF

# Always create symlink
ln -sf /app/data/server/.env /app/server/.env

# Migrate store.json if it exists in wrong location
if [ -f /app/data/store.json ] && [ ! -f /app/data/server/store.json ]; then
    echo "Migrating existing store.json to correct location..."
    mv /app/data/store.json /app/data/server/store.json
fi

# Create default admin user if ADMIN_USERNAME and ADMIN_PASSWORD are set and no users exist
if [ -n "${ADMIN_USERNAME:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
    echo "Checking for default admin user..."
    cd /app/server
    DATA_DIR=/app/data/server JWT_SECRET="${JWT_SECRET:-your-secret-key-change-in-production}" \
        node dist/cli.js create "${ADMIN_USERNAME}" "${ADMIN_PASSWORD}" \
        || echo "Warning: Failed to create admin user"
fi

echo "Starting aria2..."
$ARIA2_CMD &
ARIA2_PID=$!

echo "Starting server..."
cd /app/server
export NODE_ENV=production
export PORT=65004
export DATA_DIR=/app/data/server
export JWT_SECRET=${JWT_SECRET:-your-secret-key-change-in-production}
export JWT_EXPIRES_IN=${JWT_EXPIRES_IN:-7d}
export ARIA2_RPC_URL=${ARIA2_RPC_URL:-http://localhost:6800/jsonrpc}
export ARIA2_SECRET=${ARIA2_SECRET:-}
export ENABLE_REGISTER=${ENABLE_REGISTER:-false}
node dist/server.js &
SERVER_PID=$!

echo "Starting nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

shutdown() {
    echo "Shutting down..."
    kill $NGINX_PID 2>/dev/null || true
    kill $SERVER_PID 2>/dev/null || true
    kill $ARIA2_PID 2>/dev/null || true
    wait $NGINX_PID $SERVER_PID $ARIA2_PID 2>/dev/null || true
    exit 0
}

trap shutdown SIGTERM SIGINT

wait -n $ARIA2_PID $SERVER_PID $NGINX_PID
echo "One process exited, shutting down container..."
shutdown