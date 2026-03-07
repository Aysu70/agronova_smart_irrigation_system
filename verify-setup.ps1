# AGRANOVA Diagnostic & Setup Verification Script
# This script checks all prerequisites and configurations

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║    🌱 AGRANOVA - Diagnostic & Setup Verification 🌱       ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Track results
$allPassed = $true

# ============================================================================
# 1. Check Node.js
# ============================================================================
Write-Host "1️⃣  Checking Node.js Installation..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version
    $nodeInstalled = $true
    Write-Host "   ✅ Node.js installed: $nodeVersion`n" -ForegroundColor Green
} catch {
    $nodeInstalled = $false
    $allPassed = $false
    Write-Host "   ❌ Node.js not found`n" -ForegroundColor Red
    Write-Host "   💡 Solution: Download from https://nodejs.org`n" -ForegroundColor Cyan
}

# ============================================================================
# 2. Check MongoDB
# ============================================================================
Write-Host "2️⃣  Checking MongoDB..." -ForegroundColor Yellow

try {
    $process = Get-Process mongod -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "   ✅ MongoDB is RUNNING`n" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  MongoDB is NOT running`n" -ForegroundColor Red
        $allPassed = $false
        Write-Host "   💡 To fix:" -ForegroundColor Cyan
        Write-Host "      net start MongoDB" -ForegroundColor Yellow
        Write-Host "      Or download from https://www.mongodb.com`n" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ⚠️  MongoDB not found`n" -ForegroundColor Red
    $allPassed = $false
    Write-Host "   💡 Options:" -ForegroundColor Cyan
    Write-Host "      1. Install MongoDB from https://www.mongodb.com" -ForegroundColor Yellow
    Write-Host "      2. Use MongoDB Atlas (cloud): https://cloud.mongodb.com`n" -ForegroundColor Cyan
}

# ============================================================================
# 3. Check Ports
# ============================================================================
Write-Host "3️⃣  Checking Available Ports..." -ForegroundColor Yellow

$port5001 = Test-NetConnection localhost -Port 5001 -WarningAction SilentlyContinue
$port3001 = Test-NetConnection localhost -Port 3001 -WarningAction SilentlyContinue
$port27017 = Test-NetConnection localhost -Port 27017 -WarningAction SilentlyContinue

if ($port5001.TcpTestSucceeded) {
    Write-Host "   ⚠️  Port 5001 (Backend) is IN USE" -ForegroundColor Yellow
    Write-Host "      Either backend is running or port needs to be freed`n" -ForegroundColor Cyan
} else {
    Write-Host "   ✅ Port 5001 (Backend) is available`n" -ForegroundColor Green
}

if ($port3001.TcpTestSucceeded) {
    Write-Host "   ⚠️  Port 3001 (Frontend) is IN USE" -ForegroundColor Yellow
    Write-Host "      Either frontend is running or port needs to be freed`n" -ForegroundColor Cyan
} else {
    Write-Host "   ✅ Port 3001 (Frontend) is available`n" -ForegroundColor Green
}

if ($port27017.TcpTestSucceeded) {
    Write-Host "   ✅ Port 27017 (MongoDB) is responding`n" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Port 27017 (MongoDB) not responding`n" -ForegroundColor Yellow
    $allPassed = $false
}

# ============================================================================
# 4. Check Backend Configuration
# ============================================================================
Write-Host "4️⃣  Checking Backend Configuration..." -ForegroundColor Yellow

$backendEnv = "backend/.env"
if (Test-Path $backendEnv) {
    Write-Host "   ✅ backend/.env exists" -ForegroundColor Green
    
    # Read and check configuration
    $envContent = Get-Content $backendEnv
    if ($envContent -match "MONGODB_URI") {
        Write-Host "   ✅ MONGODB_URI configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  MONGODB_URI not configured" -ForegroundColor Yellow
        $allPassed = $false
    }
    
    if ($envContent -match "PORT") {
        $port = $envContent | Select-String "PORT=" | ForEach-Object { $_.ToString().Split('=')[1] }
        Write-Host "   ✅ PORT configured: $port`n" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ backend/.env not found`n" -ForegroundColor Red
    $allPassed = $false
    Write-Host "   💡 Create backend/.env with required variables`n" -ForegroundColor Cyan
}

# ============================================================================
# 5. Check Frontend Configuration
# ============================================================================
Write-Host "5️⃣  Checking Frontend Configuration..." -ForegroundColor Yellow

$frontendEnv = "frontend/.env"
if (Test-Path $frontendEnv) {
    Write-Host "   ✅ frontend/.env exists" -ForegroundColor Green
    $envContent = Get-Content $frontendEnv
    if ($envContent -match "REACT_APP_API_URL") {
        Write-Host "   ✅ REACT_APP_API_URL configured`n" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  REACT_APP_API_URL not configured`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  frontend/.env not found" -ForegroundColor Yellow
    Write-Host "   💡 This might cause API connection issues`n" -ForegroundColor Cyan
}

# ============================================================================
# 6. Check Dependencies
# ============================================================================
Write-Host "6️⃣  Checking Node Modules..." -ForegroundColor Yellow

if ((Test-Path "backend/node_modules") -and (Get-ChildItem "backend/node_modules" | Measure-Object).Count -gt 0) {
    Write-Host "   ✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Backend dependencies not installed" -ForegroundColor Yellow
    Write-Host "      Run: cd backend && npm install`n" -ForegroundColor Cyan
}

if ((Test-Path "frontend/node_modules") -and (Get-ChildItem "frontend/node_modules" | Measure-Object).Count -gt 0) {
    Write-Host "   ✅ Frontend dependencies installed`n" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Frontend dependencies not installed" -ForegroundColor Yellow
    Write-Host "      Run: cd frontend && npm install`n" -ForegroundColor Cyan
}

# ============================================================================
# 7. Check Bluetooth Support
# ============================================================================
Write-Host "7️⃣  Checking Bluetooth System Support..." -ForegroundColor Yellow

try {
    $bluetooth = Get-Service Bluetooth -ErrorAction SilentlyContinue
    if ($bluetooth.Status -eq "Running") {
        Write-Host "   ✅ Windows Bluetooth Service is Running`n" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Windows Bluetooth Service is NOT Running" -ForegroundColor Yellow
        Write-Host "      Run: net start Bluetooth`n" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ⚠️  Could not check Bluetooth service`n" -ForegroundColor Yellow
}

# ============================================================================
# 8. Summary
# ============================================================================
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan

if ($allPassed) {
    Write-Host "║                   ✅ ALL CHECKS PASSED                     ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
    
    Write-Host "🚀 Ready to start the application!`n" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Open Terminal 1: cd backend && npm start" -ForegroundColor Cyan
    Write-Host "  2. Open Terminal 2: cd frontend && npm start" -ForegroundColor Cyan
    Write-Host "  3. Open browser: http://localhost:3001" -ForegroundColor Cyan
    Write-Host "  4. Power on HC-05 module" -ForegroundColor Cyan
    Write-Host "  5. Connect using Dashboard hardware panel`n" -ForegroundColor Cyan
} else {
    Write-Host "║                   ⚠️  ISSUES FOUND                       ║" -ForegroundColor Yellow
    Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
    
    Write-Host "❌ Some checks failed. Please fix the issues above.`n" -ForegroundColor Red
    Write-Host "📖 For detailed help, see: BLUETOOTH_DATABASE_FIXES.md`n" -ForegroundColor Cyan
}

Read-Host "`nPress Enter to exit"
