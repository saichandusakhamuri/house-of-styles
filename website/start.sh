#!/bin/bash

# House of Styles - Startup Script
# Starts both backend server and frontend development

echo "🚀 Starting House of Styles..."
echo ""

# Check if backend folder exists
if [ ! -d "backend" ]; then
  echo "❌ Backend folder not found"
  exit 1
fi

# Check if node_modules exists in backend
if [ ! -d "backend/node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  cd backend
  npm install
  cd ..
fi

# Start backend in background
echo "🔧 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend is running
echo ""
echo "Checking backend connection..."
if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
  echo "✅ Backend is running on http://localhost:5001"
else
  echo "⚠️  Backend health check failed - it may still be starting"
fi

echo ""
echo "✅ Services ready!"
echo ""
echo "📂 Frontend files:"
echo "  - Main website:    file://$PWD/index.html"
echo "  - VIP Club:        file://$PWD/vip.html"
echo "  - Custom Studio:   file://$PWD/custom.html"
echo ""
echo "🌐 Backend API:"
echo "  - API Base URL:    http://localhost:5001/api"
echo "  - Socket.IO:       http://localhost:5001"
echo ""
echo "📝 Next steps:"
echo "  1. Open index.html in your browser (or use a local server)"
echo "  2. Register a new account"
echo "  3. Test shopping, VIP, and custom order features"
echo ""
echo "📚 For more information, see INTEGRATION_GUIDE.md"
echo ""
echo "Backend process ID: $BACKEND_PID"
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait $BACKEND_PID
