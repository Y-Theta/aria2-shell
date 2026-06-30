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

# Create a clean runtime config by filtering out problematic lines
# Remove empty rpc-secret, log settings, and any corrupted lines
TMP_CONF=$(mktemp)
grep -v '^rpc-secret=$' /app/data/aria2/aria2.conf | \
    grep -v '^log=' | \
    grep -v '^log-level=' | \
    grep -v '^$' | \
    grep -E '^[a-z-]+=.+$' > "$TMP_CONF" || true

# Ensure file ends with newline
echo "" >> "$TMP_CONF"
mv "$TMP_CONF" /app/data/aria2/aria2.conf.runtime

# Build aria2 command arguments
ARIA2_CMD="aria2c --conf-path=/app/data/aria2/aria2.conf.runtime --log=- --log-level=notice"
if [ -n "${ARIA2_SECRET:-}" ]; then
    ARIA2_CMD="$ARIA2_CMD --rpc-secret=$ARIA2_SECRET"
fi

if [ ! -f /app/data/server/.env ]; then
    cat > /app/data/server/.env << EOF
PORT=65004
NODE_ENV=production
DATA_DIR=/app/data/server
JWT_SECRET=${JWT_SECRET:-your-secret-key-change-in-production}
JWT_EXPIRES_IN=7d
ARIA2_RPC_URL=http://localhost:6800/jsonrpc
ARIA2_SECRET=${ARIA2_SECRET:-}
ENABLE_REGISTER=false
EOF
fi

if [ ! -f /app/server/.env ] && [ -f /app/data/server/.env ]; then
    ln -sf /app/data/server/.env /app/server/.env
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