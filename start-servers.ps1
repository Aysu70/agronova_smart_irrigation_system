# AGRANOVA - Start All Servers Script
# This script starts both backend and frontend servers

Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                   ║" -ForegroundColor Green
Write-Host "║          🌱 AGRANOVA SERVER STARTUP 🌱           ║" -ForegroundColor Green
Write-Host "║                                                   ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Check if in correct directory
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Error: Run this script from the project root directory" -ForegroundColor Red
    Write-Host "   Expected: C:\Users\ACER\agronova_smart_irrigation_system" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Starting servers..." -ForegroundColor Cyan
Write-Host ""

# Start Backend Server
Write-Host "🔧 Starting Backend Server (Port 5001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start Frontend Server
Write-Host "🎨 Starting Frontend Server (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║             ✅ SERVERS STARTING...                ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📡 Backend API:  http://localhost:5001" -ForegroundColor Cyan
Write-Host "🌐 Frontend App: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Wait 10-20 seconds for both servers to fully start..." -ForegroundColor Yellow
Write-Host ""
Write-Host "🔑 Login Credentials:" -ForegroundColor Magenta
Write-Host "   Email:    admin@agranova.com" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "   - Backend runs in demo mode (no MongoDB needed)" -ForegroundColor Gray
Write-Host "   - All features work, data just won't persist" -ForegroundColor Gray
Write-Host "   - Close the PowerShell windows to stop servers" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
