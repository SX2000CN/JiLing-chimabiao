import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Windows 风格窗口控制容器 - 位于右上角，占满工具栏高度
const WindowControlsContainer = styled.div`
  display: flex;
  align-items: stretch;
  -webkit-app-region: no-drag;
  height: 100%;  /* 占满父容器（工具栏）高度 */
  margin-left: auto;  /* 推到右侧 */
  gap: 0;  /* 移除按钮间隙 */
`;

// Windows 风格控制按钮 - 占满父容器高度，无间隙
const ControlButton = styled.button`
  width: 46px;
  height: 100%;  /* 占满父容器高度 */
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease;
  color: ${props => props.theme?.colors?.gray?.[600] || '#6B7280'};
  margin: 0;  /* 移除外边距 */
  padding: 0;  /* 移除内边距 */

  /* 彻底移除所有点击高亮效果 */
  outline: none !important;
  outline-offset: 0;
  -webkit-tap-highlight-color: transparent;
  box-shadow: none !important;
  border: none !important;
  user-select: none;

  &:hover {
    background-color: ${props => props.theme?.colors?.gray?.[200] || 'rgba(0, 0, 0, 0.1)'};
  }

  /* 移除 active 状态的背景变化 */
  &:active {
    background-color: ${props => props.theme?.colors?.gray?.[200] || 'rgba(0, 0, 0, 0.1)'};
  }

  &:focus {
    outline: none !important;
    box-shadow: none !important;
  }

  &:focus-visible {
    outline: none !important;
    box-shadow: none !important;
  }

  &.close:hover {
    background-color: #E81123;
    color: white;
  }

  &.close:active {
    background-color: #E81123;
    color: white;
  }

  svg {
    width: 10px;
    height: 10px;
    stroke-width: 1;
  }
`;

// 最小化图标 (横线)
const MinimizeIcon = () => (
  <svg viewBox="0 0 10 10" fill="none" stroke="currentColor">
    <line x1="0" y1="5" x2="10" y2="5" />
  </svg>
);

// 最大化图标 (方框)
const MaximizeIcon = () => (
  <svg viewBox="0 0 10 10" fill="none" stroke="currentColor">
    <rect x="0.5" y="0.5" width="9" height="9" />
  </svg>
);

// 还原图标 (两个重叠方框)
const RestoreIcon = () => (
  <svg viewBox="0 0 10 10" fill="none" stroke="currentColor">
    <rect x="2.5" y="0.5" width="7" height="7" />
    <path d="M0.5 2.5 L0.5 9.5 L7.5 9.5 L7.5 7.5" />
  </svg>
);

// 关闭图标 (X)
const CloseIcon = () => (
  <svg viewBox="0 0 10 10" fill="none" stroke="currentColor">
    <line x1="0" y1="0" x2="10" y2="10" />
    <line x1="10" y1="0" x2="0" y2="10" />
  </svg>
);

const WindowControlsWindows = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const checkMaximized = async () => {
      if (window.electronAPI?.window?.isMaximized) {
        const maximized = await window.electronAPI.window.isMaximized();
        setIsMaximized(maximized);
      }
    };
    
    checkMaximized();
    
    const handleWindowStateChange = (event) => {
      if (event.detail && typeof event.detail.maximized !== 'undefined') {
        setIsMaximized(event.detail.maximized);
      }
    };
    
    window.addEventListener('window-state-changed', handleWindowStateChange);
    const interval = setInterval(checkMaximized, 1000);
    
    return () => {
      window.removeEventListener('window-state-changed', handleWindowStateChange);
      clearInterval(interval);
    };
  }, []);

  const handleMinimize = () => {
    try {
      if (window.electronAPI?.window?.minimize) {
        window.electronAPI.window.minimize();
      }
    } catch (error) {
      console.error('最小化窗口失败:', error);
    }
  };

  const handleMaximize = () => {
    try {
      if (window.electronAPI?.window?.toggleMaximize) {
        window.electronAPI.window.toggleMaximize();
      }
    } catch (error) {
      console.error('切换窗口最大化失败:', error);
    }
  };

  const handleClose = () => {
    try {
      if (window.electronAPI?.window?.close) {
        window.electronAPI.window.close();
      } else {
        window.close();
      }
    } catch (error) {
      console.error('关闭窗口失败:', error);
    }
  };

  return (
    <WindowControlsContainer>
      <ControlButton onClick={handleMinimize} title="最小化">
        <MinimizeIcon />
      </ControlButton>
      <ControlButton onClick={handleMaximize} title={isMaximized ? '还原' : '最大化'}>
        {isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
      </ControlButton>
      <ControlButton className="close" onClick={handleClose} title="关闭">
        <CloseIcon />
      </ControlButton>
    </WindowControlsContainer>
  );
};

export default WindowControlsWindows;

