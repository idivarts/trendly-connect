#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="$SCRIPT_DIR/out"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║       Trendly Connect — Static Export            ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

cd "$SCRIPT_DIR"

if [ ! -d "node_modules" ]; then
  echo "📦  Installing dependencies..."
  npm install
fi

if [ -d "$OUT_DIR" ]; then
  echo "🧹  Removing previous out/ directory..."
  rm -rf "$OUT_DIR"
fi

echo "🏗️   Running next build..."
next build

if [ ! -f "$OUT_DIR/index.html" ]; then
  echo "❌  ERROR: out/index.html not found."
  exit 1
fi

HTML_COUNT=$(find "$OUT_DIR" -name "*.html" | wc -l | tr -d ' ')
echo "✅  HTML pages generated: $HTML_COUNT"
echo "✅  Export complete → out/"
echo ""
