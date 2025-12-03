import React from 'react';
import styled from 'styled-components';
import WindowControlsComponent from './WindowControls';
import WindowControlsWindows from './WindowControlsWindows';
import { useAppStore } from '../stores/useAppStore';

const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;  /* 调整为 32px，与 Windows 控件高度一致 */
  background: ${props => props.theme.colors.background.primary};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  padding: 0;
  gap: 0;
  -webkit-app-region: drag;  /* 允许拖拽整个工具栏 */
`;

const ToolbarSection = styled.div`
  display: flex;
  align-items: stretch;
  height: 100%;
  -webkit-app-region: no-drag;
`;

/**
 * 工具栏组件 - 极简版
 * 仅包含窗口控件（macOS 在左侧，Windows 在右侧）
 * 状态指示器已移至 StatusBar
 */
const Toolbar = ({
  className,
  ...props
}) => {
  // 获取窗口控件样式
  const windowControlStyle = useAppStore((state) => state.uiPreferences.windowControlStyle);
  const isWindowsStyle = windowControlStyle === 'windows';

  // 处理双击标题栏事件
  const handleDoubleClick = (event) => {
    if (event.target.tagName === 'BUTTON' || event.target.closest('button')) {
      return;
    }
    if (window.electronAPI?.window?.toggleMaximize) {
      window.electronAPI.window.toggleMaximize();
    }
  };

  return (
    <ToolbarContainer
      className={className}
      onDoubleClick={handleDoubleClick}
      {...props}
    >
      <ToolbarSection>
        {/* macOS 风格：窗口控件在左侧 */}
        {!isWindowsStyle && <WindowControlsComponent />}
      </ToolbarSection>

      <ToolbarSection>
        {/* Windows 风格：窗口控件在右侧 */}
        {isWindowsStyle && <WindowControlsWindows />}
      </ToolbarSection>
    </ToolbarContainer>
  );
};

export default Toolbar;
