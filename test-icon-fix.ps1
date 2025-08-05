# 测试图标修复脚本
Write-Host "=== 集领尺码表生成器图标修复测试 ===" -ForegroundColor Green

# 1. 检查安装包文件
Write-Host "`n1. 检查安装包文件:" -ForegroundColor Yellow
$setupFile = "dist-electron\集领尺码表生成器-Setup-1.0.0.exe"
$portableFile = "dist-electron\集领尺码表生成器-1.0.0-portable.exe"

if (Test-Path $setupFile) {
    $setupInfo = Get-Item $setupFile
    Write-Host "✅ 安装版: $($setupInfo.Name) ($([math]::Round($setupInfo.Length/1MB, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "❌ 安装版文件不存在" -ForegroundColor Red
}

if (Test-Path $portableFile) {
    $portableInfo = Get-Item $portableFile
    Write-Host "✅ 便携版: $($portableInfo.Name) ($([math]::Round($portableInfo.Length/1MB, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "❌ 便携版文件不存在" -ForegroundColor Red
}

# 2. 检查图标文件
Write-Host "`n2. 检查图标文件:" -ForegroundColor Yellow
$iconFile = "build\icon.ico"
if (Test-Path $iconFile) {
    $iconInfo = Get-Item $iconFile
    Write-Host "✅ ICO图标: $($iconInfo.Name) ($([math]::Round($iconInfo.Length/1KB, 2)) KB)" -ForegroundColor Green
    Write-Host "   创建时间: $($iconInfo.CreationTime)" -ForegroundColor Gray
} else {
    Write-Host "❌ ICO图标文件不存在" -ForegroundColor Red
}

# 3. 检查配置文件
Write-Host "`n3. 检查配置文件:" -ForegroundColor Yellow

# 检查 main.cjs 中的图标配置
$mainFile = "main.cjs"
if (Test-Path $mainFile) {
    $mainContent = Get-Content $mainFile -Raw
    if ($mainContent -match "icon.*icon\.ico") {
        Write-Host "✅ main.cjs: 图标配置正确 (使用 icon.ico)" -ForegroundColor Green
    } else {
        Write-Host "❌ main.cjs: 图标配置可能有问题" -ForegroundColor Red
    }
} else {
    Write-Host "❌ main.cjs 文件不存在" -ForegroundColor Red
}

# 检查 package.json 中的配置
$packageFile = "package.json"
if (Test-Path $packageFile) {
    $packageContent = Get-Content $packageFile -Raw | ConvertFrom-Json
    
    # 检查 win.icon 配置
    if ($packageContent.build.win.icon -eq "build/icon.ico") {
        Write-Host "✅ package.json: Windows图标配置正确" -ForegroundColor Green
    } else {
        Write-Host "❌ package.json: Windows图标配置错误: $($packageContent.build.win.icon)" -ForegroundColor Red
    }
    
    # 检查 NSIS 图标配置
    if ($packageContent.build.nsis.installerIcon -eq "build/icon.ico") {
        Write-Host "✅ package.json: NSIS安装程序图标配置正确" -ForegroundColor Green
    } else {
        Write-Host "❌ package.json: NSIS安装程序图标配置错误" -ForegroundColor Red
    }
} else {
    Write-Host "❌ package.json 文件不存在" -ForegroundColor Red
}

# 4. 检查 NSIS 脚本
Write-Host "`n4. 检查NSIS脚本:" -ForegroundColor Yellow
$nsisFile = "build\installer.nsh"
if (Test-Path $nsisFile) {
    $nsisContent = Get-Content $nsisFile -Raw
    if ($nsisContent -match "icon\.ico") {
        Write-Host "✅ installer.nsh: 快捷方式图标配置正确" -ForegroundColor Green
    } else {
        Write-Host "⚠️  installer.nsh: 未找到明确的图标配置" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ installer.nsh 文件不存在" -ForegroundColor Red
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Green
Write-Host "如果所有检查都显示✅，说明图标配置已修复" -ForegroundColor Cyan
Write-Host "建议现在卸载旧版本，然后安装新版本测试图标显示" -ForegroundColor Cyan
