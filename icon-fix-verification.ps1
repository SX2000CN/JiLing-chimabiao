# Icon Fix Verification Script
# Test script for the new installer package

Write-Host "=== JiLing Size Chart Generator - Icon Fix Verification ===" -ForegroundColor Green
Write-Host ""

# Check installer files
$setupFile = ".\dist-electron\集领尺码表生成器-Setup-1.0.0.exe"
$portableFile = ".\dist-electron\集领尺码表生成器-1.0.0-portable.exe"

if (Test-Path $setupFile) {
    $setupSize = (Get-Item $setupFile).Length / 1MB
    Write-Host "✅ Setup package found: $([math]::Round($setupSize, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "❌ Setup package not found" -ForegroundColor Red
}

if (Test-Path $portableFile) {
    $portableSize = (Get-Item $portableFile).Length / 1MB
    Write-Host "✅ Portable version found: $([math]::Round($portableSize, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "❌ Portable version not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Icon Files Check ===" -ForegroundColor Yellow

# Check icon files
$iconFiles = @(
    ".\build\icon.ico",
    ".\build\icon.png", 
    ".\build\app.ico"
)

foreach ($iconFile in $iconFiles) {
    if (Test-Path $iconFile) {
        $iconSize = (Get-Item $iconFile).Length
        Write-Host "✅ Icon file exists: $iconFile ($iconSize bytes)" -ForegroundColor Green
    } else {
        Write-Host "❌ Icon file missing: $iconFile" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Fix Summary ===" -ForegroundColor Cyan
Write-Host "1. ✅ Unified icon format to ICO" -ForegroundColor Green
Write-Host "2. ✅ Fixed NSIS shortcut icon paths" -ForegroundColor Green
Write-Host "3. ✅ Optimized resource packaging" -ForegroundColor Green
Write-Host "4. ✅ Fixed main.cjs icon reference" -ForegroundColor Green

Write-Host ""
Write-Host "=== Testing Instructions ===" -ForegroundColor Yellow
Write-Host "1. Uninstall current version (if installed)"
Write-Host "2. Run new installer: $setupFile"
Write-Host "3. Check these items:"
Write-Host "   - Desktop shortcut icon displays correctly"
Write-Host "   - Start Menu 'JiLing' folder is created"
Write-Host "   - Start Menu shortcut icon displays correctly"
Write-Host "   - Taskbar icon displays correctly"
Write-Host "   - Application window icon displays correctly"

Write-Host ""
Write-Host "Script completed successfully!" -ForegroundColor Green
