# 开始菜单显示问题修复脚本

Write-Host "=== 集领尺码表生成器 - 开始菜单显示修复 ===" -ForegroundColor Green
Write-Host ""

# 检查文件夹和快捷方式是否存在
$jilingFolder = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\集领"
$shortcutFile = "$jilingFolder\集领尺码表生成器.lnk"

Write-Host "=== 文件状态检查 ===" -ForegroundColor Yellow

if (Test-Path $jilingFolder) {
    Write-Host "✅ 集领文件夹存在: $jilingFolder" -ForegroundColor Green
    $folderInfo = Get-Item $jilingFolder
    Write-Host "   创建时间: $($folderInfo.CreationTime)" -ForegroundColor White
} else {
    Write-Host "❌ 集领文件夹不存在" -ForegroundColor Red
    exit 1
}

if (Test-Path $shortcutFile) {
    Write-Host "✅ 快捷方式存在: $shortcutFile" -ForegroundColor Green
    $shortcutInfo = Get-Item $shortcutFile
    Write-Host "   创建时间: $($shortcutInfo.CreationTime)" -ForegroundColor White
    Write-Host "   文件大小: $($shortcutInfo.Length) bytes" -ForegroundColor White
} else {
    Write-Host "❌ 快捷方式不存在" -ForegroundColor Red
}

# 检查快捷方式目标
Write-Host ""
Write-Host "=== 快捷方式详情 ===" -ForegroundColor Yellow

try {
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutFile)
    Write-Host "目标程序: $($Shortcut.TargetPath)" -ForegroundColor White
    Write-Host "图标路径: $($Shortcut.IconLocation)" -ForegroundColor White
    Write-Host "工作目录: $($Shortcut.WorkingDirectory)" -ForegroundColor White
    
    # 检查目标程序是否存在
    if (Test-Path $Shortcut.TargetPath) {
        Write-Host "✅ 目标程序存在" -ForegroundColor Green
    } else {
        Write-Host "❌ 目标程序不存在" -ForegroundColor Red
    }
    
    # 检查图标文件是否存在
    $iconPath = $Shortcut.IconLocation -replace ",.*$", ""
    if (Test-Path $iconPath) {
        Write-Host "✅ 图标文件存在" -ForegroundColor Green
    } else {
        Write-Host "❌ 图标文件不存在: $iconPath" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 无法读取快捷方式信息: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== 开始菜单缓存修复 ===" -ForegroundColor Yellow

Write-Host "正在刷新开始菜单缓存..." -ForegroundColor Cyan

# 方法1: 重启Windows资源管理器
Write-Host "1. 重启Windows资源管理器..." -ForegroundColor White
try {
    Stop-Process -Name "explorer" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Start-Process "explorer.exe"
    Write-Host "✅ Windows资源管理器已重启" -ForegroundColor Green
} catch {
    Write-Host "❌ 重启资源管理器失败: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 3

# 方法2: 强制刷新图标缓存
Write-Host "2. 清理图标缓存..." -ForegroundColor White
try {
    $iconCachePath = "$env:LOCALAPPDATA\Microsoft\Windows\Explorer\iconcache_*.db"
    Get-ChildItem -Path $iconCachePath -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "✅ 图标缓存已清理" -ForegroundColor Green
} catch {
    Write-Host "⚠️  图标缓存清理可能不完整" -ForegroundColor Yellow
}

# 方法3: 触发开始菜单刷新
Write-Host "3. 触发开始菜单刷新..." -ForegroundColor White
try {
    # 创建并删除一个临时快捷方式来触发刷新
    $tempShortcut = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\temp_refresh.lnk"
    $WshShell = New-Object -comObject WScript.Shell
    $TempShortcut = $WshShell.CreateShortcut($tempShortcut)
    $TempShortcut.TargetPath = "notepad.exe"
    $TempShortcut.Save()
    Start-Sleep -Seconds 1
    Remove-Item $tempShortcut -Force -ErrorAction SilentlyContinue
    Write-Host "✅ 开始菜单刷新触发完成" -ForegroundColor Green
} catch {
    Write-Host "⚠️  开始菜单刷新触发可能失败" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== 手动检查步骤 ===" -ForegroundColor Cyan
Write-Host "如果开始菜单中仍然看不到'集领'文件夹，请尝试以下步骤："
Write-Host ""
Write-Host "1. 按 Win + R，输入: shell:programs" -ForegroundColor White
Write-Host "   这会直接打开开始菜单程序文件夹" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 查看是否有'集领'文件夹" -ForegroundColor White
Write-Host "   如果有，双击测试快捷方式是否工作" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 尝试注销并重新登录" -ForegroundColor White
Write-Host "   这会强制刷新整个用户界面" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 检查Windows版本兼容性" -ForegroundColor White
Write-Host "   某些Windows版本可能需要额外时间来更新开始菜单" -ForegroundColor Gray

Write-Host ""
Write-Host "=== 备用解决方案 ===" -ForegroundColor Magenta
Write-Host "如果问题持续存在，可以手动创建快捷方式："
Write-Host "1. 右键桌面 -> 新建 -> 快捷方式"
Write-Host "2. 浏览到: C:\Program Files\jiling-size-table\集领尺码表生成器.exe"
Write-Host "3. 命名为: 集领尺码表生成器"
Write-Host "4. 右键快捷方式 -> 属性 -> 更改图标"
Write-Host "5. 浏览到: C:\Program Files\jiling-size-table\resources\build\icon.ico"

Write-Host ""
Write-Host "修复脚本执行完成！请检查开始菜单是否现在显示'集领'文件夹。" -ForegroundColor Green
