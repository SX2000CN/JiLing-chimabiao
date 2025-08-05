# 集领尺码表生成器 - 新安装包测试脚本

Write-Host "=== 集领尺码表生成器 - 新安装包测试验证 ===" -ForegroundColor Green
Write-Host ""

# 获取当前时间
$currentTime = Get-Date
Write-Host "测试时间: $currentTime" -ForegroundColor Cyan

# 检查新安装包
$setupFile = ".\dist-electron\集领尺码表生成器-Setup-1.0.0.exe"
$portableFile = ".\dist-electron\集领尺码表生成器-1.0.0-portable.exe"

Write-Host "=== 新安装包信息 ===" -ForegroundColor Yellow

if (Test-Path $setupFile) {
    $setupInfo = Get-Item $setupFile
    $setupSize = $setupInfo.Length / 1MB
    Write-Host "✅ 标准安装包: $([math]::Round($setupSize, 2)) MB" -ForegroundColor Green
    Write-Host "   文件: $($setupInfo.Name)" -ForegroundColor White
    Write-Host "   生成时间: $($setupInfo.LastWriteTime)" -ForegroundColor White
    
    # 检查是否是最新构建（5分钟内）
    $timeDiff = (Get-Date) - $setupInfo.LastWriteTime
    if ($timeDiff.TotalMinutes -lt 5) {
        Write-Host "   ✅ 这是最新构建的版本！" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  警告：这可能不是最新构建的版本" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ 标准安装包不存在" -ForegroundColor Red
    exit 1
}

if (Test-Path $portableFile) {
    $portableInfo = Get-Item $portableFile
    $portableSize = $portableInfo.Length / 1MB
    Write-Host "✅ 便携版: $([math]::Round($portableSize, 2)) MB" -ForegroundColor Green
    Write-Host "   生成时间: $($portableInfo.LastWriteTime)" -ForegroundColor White
} else {
    Write-Host "❌ 便携版不存在" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== 配置验证 ===" -ForegroundColor Yellow

# 检查配置文件
$configFile = ".\dist-electron\builder-effective-config.yaml"
if (Test-Path $configFile) {
    $config = Get-Content $configFile -Raw
    
    Write-Host "✅ 构建配置文件存在" -ForegroundColor Green
    
    # 检查关键配置
    if ($config -match "createDesktopShortcut: false") {
        Write-Host "✅ 自动桌面快捷方式已禁用" -ForegroundColor Green
    } else {
        Write-Host "❌ 自动桌面快捷方式配置错误" -ForegroundColor Red
    }
    
    if ($config -match "createStartMenuShortcut: false") {
        Write-Host "✅ 自动开始菜单快捷方式已禁用" -ForegroundColor Green
    } else {
        Write-Host "❌ 自动开始菜单快捷方式配置错误" -ForegroundColor Red
    }
    
    if ($config -match "menuCategory: false") {
        Write-Host "✅ 自动菜单分类已禁用" -ForegroundColor Green
    } else {
        Write-Host "❌ 自动菜单分类配置错误" -ForegroundColor Red
    }
} else {
    Write-Host "❌ 构建配置文件不存在" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== 安装前准备 ===" -ForegroundColor Yellow

# 检查是否有现有安装
$installedVersion = Get-WmiObject -Class Win32_Product | Where-Object { $_.Name -like "*集领*" -or $_.Name -like "*JiLing*" }
if ($installedVersion) {
    Write-Host "⚠️  检测到已安装的版本:" -ForegroundColor Yellow
    foreach ($app in $installedVersion) {
        Write-Host "   - $($app.Name) (版本: $($app.Version))" -ForegroundColor White
    }
    Write-Host "   建议先卸载旧版本再安装新版本" -ForegroundColor Yellow
} else {
    Write-Host "✅ 未检测到已安装的版本" -ForegroundColor Green
}

# 检查开始菜单中是否有残留
$startMenuPaths = @(
    "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\集领",
    "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\集领科技",
    "$env:ProgramData\Microsoft\Windows\Start Menu\Programs\集领",
    "$env:ProgramData\Microsoft\Windows\Start Menu\Programs\集领科技"
)

$hasRemnants = $false
foreach ($path in $startMenuPaths) {
    if (Test-Path $path) {
        Write-Host "⚠️  发现开始菜单残留: $path" -ForegroundColor Yellow
        $hasRemnants = $true
    }
}

if (-not $hasRemnants) {
    Write-Host "✅ 开始菜单无残留文件" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== 测试步骤 ===" -ForegroundColor Cyan
Write-Host "1. 如有旧版本，请先完全卸载" -ForegroundColor White
Write-Host "2. 清理开始菜单残留文件夹（如果有）" -ForegroundColor White
Write-Host "3. 运行新安装包: $setupFile" -ForegroundColor White
Write-Host "4. 安装过程中会显示调试信息，请注意观察" -ForegroundColor White
Write-Host "5. 安装完成后检查:" -ForegroundColor White
Write-Host "   - 开始菜单是否出现'集领'文件夹" -ForegroundColor White
Write-Host "   - 快捷方式图标是否正确显示" -ForegroundColor White
Write-Host "   - 桌面快捷方式是否创建并显示正确图标" -ForegroundColor White

Write-Host ""
Write-Host "=== 预期修复效果 ===" -ForegroundColor Magenta
Write-Host "✅ 开始菜单中出现'集领'文件夹" -ForegroundColor Green
Write-Host "✅ 文件夹内有'集领尺码表生成器'快捷方式" -ForegroundColor Green
Write-Host "✅ 所有快捷方式显示集领LOGO图标" -ForegroundColor Green
Write-Host "✅ 桌面快捷方式正确创建" -ForegroundColor Green

Write-Host ""
Write-Host "准备就绪，可以开始测试新安装包！" -ForegroundColor Green
