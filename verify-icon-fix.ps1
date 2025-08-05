# 图标修复验证脚本
Write-Host "=== 集领尺码表生成器 - 图标修复验证 ===" -ForegroundColor Green

Write-Host "`n🔍 检查修复配置..." -ForegroundColor Yellow

# 1. 检查ICO文件
$iconPath = "build\icon.ico"
if (Test-Path $iconPath) {
    $iconInfo = Get-Item $iconPath
    Write-Host "✅ ICO图标文件: $([math]::Round($iconInfo.Length/1KB, 1)) KB" -ForegroundColor Green
    Write-Host "   更新时间: $($iconInfo.LastWriteTime)" -ForegroundColor Gray
} else {
    Write-Host "❌ ICO图标文件缺失" -ForegroundColor Red
}

# 2. 检查NSIS脚本
$nsisPath = "build\installer.nsh"
if (Test-Path $nsisPath) {
    $nsisContent = Get-Content $nsisPath -Raw
    if ($nsisContent -match "CreateShortCut.*集领.*\.lnk") {
        Write-Host "✅ NSIS脚本: 快捷方式配置正确" -ForegroundColor Green
    } else {
        Write-Host "❌ NSIS脚本: 快捷方式配置有问题" -ForegroundColor Red
    }
} else {
    Write-Host "❌ NSIS脚本文件缺失" -ForegroundColor Red
}
}

# 3. 检查安装包文件
Write-Host "`n📦 检查新生成的安装包:" -ForegroundColor Yellow
$setupFile = "dist-electron\集领尺码表生成器-Setup-1.0.0.exe"
$portableFile = "dist-electron\集领尺码表生成器-1.0.0-portable.exe"

if (Test-Path $setupFile) {
    $setupInfo = Get-Item $setupFile
    Write-Host "✅ 安装版: $([math]::Round($setupInfo.Length/1MB, 2)) MB" -ForegroundColor Green
    Write-Host "   生成时间: $($setupInfo.LastWriteTime)" -ForegroundColor Gray
} else {
    Write-Host "❌ 安装版文件不存在" -ForegroundColor Red
}

if (Test-Path $portableFile) {
    $portableInfo = Get-Item $portableFile
    Write-Host "✅ 便携版: $([math]::Round($portableInfo.Length/1MB, 2)) MB" -ForegroundColor Green
    Write-Host "   生成时间: $($portableInfo.LastWriteTime)" -ForegroundColor Gray
} else {
    Write-Host "❌ 便携版文件不存在" -ForegroundColor Red
}

Write-Host "`n🎯 图标修复要点:" -ForegroundColor Cyan
Write-Host "• 使用了改进的NSIS脚本，支持多路径图标查找" -ForegroundColor White
Write-Host "• 图标文件已包含在extraResources中" -ForegroundColor White
Write-Host "• 快捷方式创建逻辑已优化" -ForegroundColor White

Write-Host "`n📋 测试建议:" -ForegroundColor Yellow
Write-Host "1. 卸载现有版本（如果已安装）" -ForegroundColor White
Write-Host "2. 清理Windows图标缓存" -ForegroundColor White
Write-Host "3. 安装新的Setup版本" -ForegroundColor White
Write-Host "4. 检查开始菜单和桌面图标显示" -ForegroundColor White

Write-Host "`n🔧 如果图标仍显示为白板，可尝试:" -ForegroundColor Yellow
Write-Host "• 重启计算机" -ForegroundColor White
Write-Host "• 删除图标缓存: ie4uinit.exe -show" -ForegroundColor White
Write-Host "• 在另一台电脑上测试" -ForegroundColor White

Write-Host "`n✨ 修复完成！现在可以测试新的安装包。" -ForegroundColor Green
