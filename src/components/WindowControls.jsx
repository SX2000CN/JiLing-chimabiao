import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// 窗口控制容器 - 延伸到左边缘，沉浸式设计
const WindowControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;  /* 确保垂直居中 */
  gap: 8px;
  -webkit-app-region: no-drag;
  padding: 0 16px 0 16px;  /* 左侧直接到边缘，右侧保持间距 */
  height: 100%;  /* 填满父容器高度 */
  min-height: 32px;  /* 与工具栏高度一致（32px） */
`;

// 控制按钮
const ControlButton = styled.button`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &.close {
    background: #ff5f57;
    &:hover::after {
      content: '×';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #4a0000;
      font-size: 8px;
      font-weight: bold;
    }
  }
  
  &.minimize {
    background: #ffbd2e;
    &:hover::after {
      content: '−';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #7a4a00;
      font-size: 8px;
      font-weight: bold;
    }
  }
  
  &.maximize {
    background: #28ca42;
    &:hover::after {
      content: '□';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #0a4a1a;
      font-size: 6px;
      font-weight: bold;
    }
  }
`;

const WindowControlsComponent = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const checkMaximized = async () => {
      if (window.electronAPI?.window?.isMaximized) {
        const maximized = await window.electronAPI.window.isMaximized();
        setIsMaximized(maximized);
      }
    };
    
    checkMaximized();
    
    // 监听窗口状态变化
    const handleWindowStateChange = (event) => {
      if (event.detail && typeof event.detail.maximized !== 'undefined') {
        setIsMaximized(event.detail.maximized);
      }
    };
    
    // 使用全局事件监听
    window.addEventListener('window-state-changed', handleWindowStateChange);
    
    // 备用轮询机制（降低频率以提高性能）
    const interval = setInterval(checkMaximized, 1000);
    
    return () => {
      window.removeEventListener('window-state-changed', handleWindowStateChange);
      clearInterval(interval);
    };
  }, []);

  const handleClose = () => {
    try {
      if (window.electronAPI?.window?.close) {
        window.electronAPI.window.close();
      } else {
        console.warn('窗口控制 API 不可用');
        window.close();
      }
    } catch (error) {
      console.error('关闭窗口失败:', error);
    }
  };

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

  return (
    <WindowControls>
      <ControlButton className="close" onClick={handleClose} title="关闭" />
      <ControlButton className="minimize" onClick={handleMinimize} title="最小化" />
      <ControlButton 
        className="maximize" 
        onClick={handleMaximize} 
        title={isMaximized ? "还原" : "最大化"} 
      />
    </WindowControls>
  );
};

export default WindowControlsComponent;
