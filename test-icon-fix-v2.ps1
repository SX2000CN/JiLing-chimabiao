# 图标修复验证脚本
# 用于测试新安装包的图标和快捷方式是否正确

Write-Host "=== 集领尺码表生成器 - 图标修复验证脚本 ===" -ForegroundColor Green
Write-Host ""

# 检查当前安装包
$setupFile = ".\dist-electron\集领尺码表生成器-Setup-1.0.0.exe"
$portableFile = ".\dist-electron\集领尺码表生成器-1.0.0-portable.exe"

if (Test-Path $setupFile) {
    $setupSize = (Get-Item $setupFile).Length / 1MB
    Write-Host "✅ 找到安装包: 集领尺码表生成器-Setup-1.0.0.exe ($([math]::Round($setupSize, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "❌ 未找到安装包" -ForegroundColor Red
    exit 1
}

if (Test-Path $portableFile) {
    $portableSize = (Get-Item $portableFile).Length / 1MB
    Write-Host "✅ 找到便携版: 集领尺码表生成器-1.0.0-portable.exe ($([math]::Round($portableSize, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "❌ 未找到便携版" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== 图标文件检查 ===" -ForegroundColor Yellow

# 检查源图标文件
$iconFiles = @(
    ".\build\icon.ico",
    ".\build\icon.png", 
    ".\build\app.ico"
)

foreach ($iconFile in $iconFiles) {
    if (Test-Path $iconFile) {
        $iconSize = (Get-Item $iconFile).Length
        Write-Host "✅ 图标文件存在: $iconFile ($iconSize bytes)" -ForegroundColor Green
    } else {
        Write-Host "❌ 图标文件缺失: $iconFile" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== 配置文件检查 ===" -ForegroundColor Yellow

# 检查配置文件
$configChecks = @{
    "package.json" = @("installerIcon", "uninstallerIcon", "win.icon")
    "main.cjs" = @("icon.*\.ico")
    "build\installer.nsh" = @("resources\\build\\icon\.ico")
}

foreach ($file in $configChecks.Keys) {
    if (Test-Path $file) {
        Write-Host "✅ 配置文件存在: $file" -ForegroundColor Green
        $content = Get-Content $file -Raw -Encoding UTF8
        
        foreach ($pattern in $configChecks[$file]) {
            if ($content -match $pattern) {
                Write-Host "  ✅ 找到图标配置: $pattern" -ForegroundColor Green
            } else {
                Write-Host "  ❌ 未找到图标配置: $pattern" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "❌ 配置文件缺失: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== 修复内容摘要 ===" -ForegroundColor Cyan
Write-Host "1. ✅ 统一图标格式为ICO" -ForegroundColor Green
Write-Host "2. ✅ 修复NSIS脚本中的快捷方式图标路径" -ForegroundColor Green  
Write-Host "3. ✅ 优化资源打包配置" -ForegroundColor Green
Write-Host "4. ✅ 修复main.cjs中的图标引用" -ForegroundColor Green

Write-Host ""
Write-Host "=== 测试建议 ===" -ForegroundColor Yellow
Write-Host "1. 卸载当前版本的应用（如果已安装）"
Write-Host "2. 运行新的安装包: $setupFile"
Write-Host "3. 检查以下项目："
Write-Host "   - 桌面快捷方式图标是否正确显示"
Write-Host "   - 开始菜单中是否创建了'集领'文件夹"
Write-Host "   - 开始菜单快捷方式图标是否正确显示"
Write-Host "   - 任务栏图标是否正确显示"
Write-Host "   - 应用运行时窗口图标是否正确显示"

Write-Host ""
Write-Host "=== 下一步操作 ===" -ForegroundColor Magenta
Write-Host "如果安装后图标仍有问题，请运行以下命令进行调试："
Write-Host "powershell -ExecutionPolicy Bypass -File verify-icon-fix.ps1" -ForegroundColor White

Write-Host ""
Write-Host "脚本执行完成！" -ForegroundColor Green
