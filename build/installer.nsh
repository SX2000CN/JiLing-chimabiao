; 集领尺码表生成器 自定义安装脚本
; 解决图标显示和开始菜单文件夹问题

; 在安装开始时设置Shell上下文
!macro customInit
  SetShellVarContext current
!macroend

; 自定义安装步骤
!macro customInstall
  ; 设置为当前用户上下文
  SetShellVarContext current
  
  ; 获取应用程序路径
  StrCpy $0 "$INSTDIR\${PRODUCT_FILENAME}.exe"
  
  ; 创建桌面快捷方式（带图标）
  CreateShortCut "$DESKTOP\集领尺码表生成器.lnk" "$0" "" "$INSTDIR\resources\build\icon.ico" 0
  
  ; 创建开始菜单程序组
  CreateDirectory "$SMPROGRAMS\集领"
  
  ; 创建开始菜单快捷方式（带图标）
  CreateShortCut "$SMPROGRAMS\集领\集领尺码表生成器.lnk" "$0" "" "$INSTDIR\resources\build\icon.ico" 0
  CreateShortCut "$SMPROGRAMS\集领\卸载集领尺码表生成器.lnk" "$INSTDIR\Uninstall ${PRODUCT_FILENAME}.exe" "" "$INSTDIR\resources\build\icon.ico" 0
!macroend

; 自定义卸载步骤
!macro customUnInstall
  ; 设置为当前用户上下文
  SetShellVarContext current
  
  ; 删除桌面快捷方式
  Delete "$DESKTOP\集领尺码表生成器.lnk"
  
  ; 删除开始菜单快捷方式和文件夹
  Delete "$SMPROGRAMS\集领\集领尺码表生成器.lnk"
  Delete "$SMPROGRAMS\集领\卸载集领尺码表生成器.lnk"
  RMDir "$SMPROGRAMS\集领"
!macroend
