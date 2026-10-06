# CampusMart — Start All Services
# Run this from the campusmart_final root folder

$rootDir = $PSScriptRoot

# Kill any existing processes on our ports
Write-Host "🧹 Clearing ports 3001, 5173..." -ForegroundColor Yellow
@(3001, 5173) | ForEach-Object {
    $port = $_
    $pids = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($pids) {
        Stop-Process -Id $pids -Force -ErrorAction SilentlyContinue
        Write-Host "  Cleared port $port"
    }
}

Start-Sleep -Seconds 1

# Start Backend
Write-Host "`n🚀 Starting Backend on http://localhost:3001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$rootDir\backend'; npx prisma generate 2>`$null; npx ts-node-dev --respawn --transpile-only src/index.ts`"" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "🌐 Starting Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$rootDir'; npm run dev`"" -WindowStyle Normal

Write-Host "`n✅ All services starting! Please wait a few seconds..." -ForegroundColor Green
Write-Host "`n   Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "   Frontend Admin: http://localhost:5173/login?redirect=/admin/dashboard" -ForegroundColor White
Write-Host "   Backend:   http://localhost:3001" -ForegroundColor White
Write-Host "`n   Admin login: admin@campusmart.in / Admin@1234`n" -ForegroundColor Yellow
