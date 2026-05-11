@echo off
REM House of Styles - Startup Script for Windows
REM Starts both backend server and frontend development

echo.
echo 🚀 Starting House of Styles...
echo.

REM Check if backend folder exists
if not exist "backend" (
  echo ❌ Backend folder not found
  exit /b 1
)

REM Check if node_modules exists in backend
if not exist "backend\node_modules" (
  echo 📦 Installing backend dependencies...
  cd backend
  call npm install
  cd ..
)

REM Start backend in new window
echo 🔧 Starting backend server...
start "House of Styles Backend" cmd /k "cd backend && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Check if backend is running
echo.
echo Checking backend connection...

REM Simple connection test
powershell -Command "try { $null = Invoke-WebRequest -Uri 'http://localhost:5001/api/health' -ErrorAction Stop; Write-Host '✅ Backend is running on http://localhost:5001' } catch { Write-Host '⚠️  Backend health check failed - it may still be starting' }"

echo.
echo ✅ Services ready!
echo.
echo 📂 Frontend files:
echo   - Main website:    file:///%cd%\index.html
echo   - VIP Club:        file:///%cd%\vip.html
echo   - Custom Studio:   file:///%cd%\custom.html
echo.
echo 🌐 Backend API:
echo   - API Base URL:    http://localhost:5001/api
echo   - Socket.IO:       http://localhost:5001
echo.
echo 📝 Next steps:
echo   1. Open index.html in your browser (or use a local server)
echo   2. Register a new account
echo   3. Test shopping, VIP, and custom order features
echo.
echo 📚 For more information, see INTEGRATION_GUIDE.md
echo.
echo Press Ctrl+C in the backend window to stop all services
echo.
pause
