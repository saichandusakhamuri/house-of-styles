#!/bin/bash
# ========================================
# House of Styles - Connection Checklist
# ========================================
# Run this to verify your setup is correct

echo ""
echo "🔍 Checking House of Styles Connection..."
echo ""

PASS=0
FAIL=0

check() {
  if eval "$1" > /dev/null 2>&1; then
    echo "✅ $2"
    ((PASS++))
  else
    echo "❌ $2"
    ((FAIL++))
  fi
}

# Checks
check "which node" "Node.js installed"
check "which npm" "npm installed"
check "which mongod" "MongoDB installed"
check "test -d backend" "Backend folder exists"
check "test -f backend/server.js" "Backend server.js found"
check "test -f api-client.js" "API client found"
check "test -f index.html" "Frontend HTML found"
check "test -f backend/.env" "Backend .env configured"

echo ""
echo "═══════════════════════════════════════════"

if [ $FAIL -eq 0 ]; then
  echo "✅ All checks passed!"
  echo ""
  echo "Next steps:"
  echo "1. Start MongoDB:    mongod"
  echo "2. Start Backend:    cd backend && npm run dev"
  echo "3. Open Frontend:    open index.html"
  echo ""
else
  echo "⚠️  $FAIL check(s) failed"
  echo ""
  echo "Issues to fix:"
  if ! which node > /dev/null 2>&1; then
    echo "  • Install Node.js: https://nodejs.org"
  fi
  if ! which mongod > /dev/null 2>&1; then
    echo "  • Install MongoDB: https://docs.mongodb.com/manual/installation/"
  fi
  if ! test -f backend/.env; then
    echo "  • Configure backend: cd backend && cp .env.example .env"
  fi
  echo ""
fi

echo "═══════════════════════════════════════════"
echo ""
