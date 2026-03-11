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

# Start servers with minimal output
Write-Host "✅ Starting servers..." -ForegroundColor Cyan

# Start Backend Server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 2

# Start Frontend Server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start" -WindowStyle Normal

Write-Host "Servers are launching. Backend at http://localhost:5001 and frontend at http://localhost:3000 (may auto-select different port if 3000 is busy)."
Write-Host "Close the PowerShell windows to stop servers." -ForegroundColor Yellow

