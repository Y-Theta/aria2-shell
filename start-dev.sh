#!/bin/bash

# BitStream - Start development servers
# This script starts both the mock API server and the web UI dev server

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Starting BitStream development servers..."
echo ""

# Start mock server
echo "📦 Starting Mock API Server (http://localhost:3001)..."
cd "$PROJECT_DIR/mock-server"
npm run dev > "$PROJECT_DIR/mock-server.log" 2>&1 &
MOCK_PID=$!
echo "   Mock server PID: $MOCK_PID"

# Wait for mock server to start
sleep 2

# Check if mock server is running
if ! kill -0 $MOCK_PID 2>/dev/null; then
  echo "❌ Mock server failed to start. Check $PROJECT_DIR/mock-server.log"
  exit 1
fi

# Test mock API health
if curl -s http://localhost:3001/health > /dev/null; then
  echo "✅ Mock server is running"
else
  echo "⚠️  Mock server may not have started properly"
fi

echo ""

# Start web dev server
echo "🎨 Starting Web Dev Server (http://localhost:5173)..."
cd "$PROJECT_DIR/web"
npm run dev > "$PROJECT_DIR/web-dev.log" 2>&1 &
WEB_PID=$!
echo "   Web server PID: $WEB_PID"

sleep 2

# Check if web server is running
if ! kill -0 $WEB_PID 2>/dev/null; then
  echo "❌ Web server failed to start. Check $PROJECT_DIR/web-dev.log"
  kill $MOCK_PID 2>/dev/null || true
  exit 1
fi

echo "✅ Web server is running"
echo ""
echo "========================================="
echo "🎉 All servers started successfully!"
echo ""
echo "📡 Mock API Server: http://localhost:3001"
echo "🎨 Web UI:          http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "========================================="
echo ""

# Function to cleanup on exit
cleanup() {
  echo ""
  echo "🛑 Stopping servers..."
  kill $MOCK_PID 2>/dev/null || true
  kill $WEB_PID 2>/dev/null || true
  echo "✅ Servers stopped"
}

trap cleanup EXIT INT TERM

# Keep script running
wait
