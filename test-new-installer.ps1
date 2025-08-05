# New Installer Test Script
Write-Host "=== JiLing Size Chart Generator - New Installer Test ===" -ForegroundColor Green
Write-Host ""

# Check new installer files
$setupFile = ".\dist-electron\集领尺码表生成器-Setup-1.0.0.exe"

if (Test-Path $setupFile) {
    $setupInfo = Get-Item $setupFile
    $setupSize = $setupInfo.Length / 1MB
    Write-Host "Setup File: $([math]::Round($setupSize, 2)) MB" -ForegroundColor Green
    Write-Host "Build Time: $($setupInfo.LastWriteTime)" -ForegroundColor White
    
    # Check if it's a recent build (within 5 minutes)
    $timeDiff = (Get-Date) - $setupInfo.LastWriteTime
    if ($timeDiff.TotalMinutes -lt 5) {
        Write-Host "✅ This is a fresh build!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: This might not be the latest build" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Setup file not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Configuration Check ===" -ForegroundColor Yellow

# Check effective config
$configFile = ".\dist-electron\builder-effective-config.yaml"
if (Test-Path $configFile) {
    $config = Get-Content $configFile -Raw
    
    if ($config -match "createDesktopShortcut: false") {
        Write-Host "✅ Auto desktop shortcut disabled" -ForegroundColor Green
    }
    
    if ($config -match "createStartMenuShortcut: false") {
        Write-Host "✅ Auto start menu shortcut disabled" -ForegroundColor Green
    }
    
    if ($config -match "menuCategory: false") {
        Write-Host "✅ Auto menu category disabled" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Config file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Instructions ===" -ForegroundColor Cyan
Write-Host "1. Uninstall any existing version"
Write-Host "2. Run the new installer: $setupFile"
Write-Host "3. During installation, you will see debug message boxes"
Write-Host "4. After installation, check:"
Write-Host "   - Start Menu for 'JiLing' folder"
Write-Host "   - Desktop shortcut with correct icon"
Write-Host "   - All shortcuts display JiLing logo"

Write-Host ""
Write-Host "Ready to test the new installer package!" -ForegroundColor Green
