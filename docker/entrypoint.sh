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
aria2c --conf-path=/app/data/aria2/aria2.conf --rpc-secret="${ARIA2_SECRET:-}" &

echo "Starting nginx..."
nginx -g "daemon off;" &

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

wait -n
exit $?