#!/bin/bash

# BitStream - Verification script
# Verifies that all components are correctly set up

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🔍 BitStream Project Verification"
echo "=================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
node_version=$(node -v)
echo "  Node.js: $node_version"

npm_version=$(npm -v)
echo "  npm: $npm_version"

echo ""

# Check web project
echo "✓ Checking web project structure..."
if [ -d "$PROJECT_DIR/web/src" ]; then
  echo "  ✓ src/ directory exists"
else
  echo "  ✗ src/ directory missing"
  exit 1
fi

if [ -f "$PROJECT_DIR/web/package.json" ]; then
  echo "  ✓ package.json exists"
else
  echo "  ✗ package.json missing"
  exit 1
fi

if [ -f "$PROJECT_DIR/web/vite.config.ts" ]; then
  echo "  ✓ vite.config.ts exists"
else
  echo "  ✗ vite.config.ts missing"
  exit 1
fi

# Check web components
echo "  ✓ Vue components:"
for component in Sidebar TopBar TaskList TaskRow ProgressBar StatusBadge ActionButtons BottomStats; do
  if [ -f "$PROJECT_DIR/web/src/components/$component.vue" ]; then
    echo "    ✓ $component.vue"
  else
    echo "    ✗ $component.vue missing"
  fi
done

# Check web styles
if [ -f "$PROJECT_DIR/web/src/styles/main.css" ]; then
  echo "  ✓ Global styles (main.css)"
else
  echo "  ✗ main.css missing"
fi

# Check web types
if [ -f "$PROJECT_DIR/web/src/types/index.ts" ]; then
  echo "  ✓ TypeScript types"
else
  echo "  ✗ types missing"
fi

# Check web API client
if [ -f "$PROJECT_DIR/web/src/api/client.ts" ]; then
  echo "  ✓ API client"
else
  echo "  ✗ API client missing"
fi

echo ""

# Check mock-server project
echo "✓ Checking mock-server structure..."
if [ -d "$PROJECT_DIR/mock-server/src" ]; then
  echo "  ✓ src/ directory exists"
else
  echo "  ✗ src/ directory missing"
  exit 1
fi

if [ -f "$PROJECT_DIR/mock-server/package.json" ]; then
  echo "  ✓ package.json exists"
else
  echo "  ✗ package.json missing"
  exit 1
fi

if [ -f "$PROJECT_DIR/mock-server/src/server.ts" ]; then
  echo "  ✓ server.ts"
else
  echo "  ✗ server.ts missing"
fi

if [ -f "$PROJECT_DIR/mock-server/src/data.ts" ]; then
  echo "  ✓ Mock data (data.ts)"
else
  echo "  ✗ data.ts missing"
fi

echo ""

# Check node_modules
echo "✓ Checking dependencies..."
if [ -d "$PROJECT_DIR/web/node_modules" ]; then
  echo "  ✓ web/node_modules exists"
else
  echo "  ✗ web/node_modules missing - run: cd web && npm install"
fi

if [ -d "$PROJECT_DIR/mock-server/node_modules" ]; then
  echo "  ✓ mock-server/node_modules exists"
else
  echo "  ✗ mock-server/node_modules missing - run: cd mock-server && npm install"
fi

echo ""
echo "=================================="
echo "✅ All checks passed!"
echo ""
echo "Next steps:"
echo "1. Run: ./start-dev.sh"
echo "2. Open browser to: http://localhost:5173"
echo "3. Mock API available at: http://localhost:3001"
echo ""
