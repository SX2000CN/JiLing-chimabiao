import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const TitleBarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  background: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  padding: 0 16px;
  user-select: none;
  -webkit-app-region: drag;
  position: relative;
`;

const TrafficLights = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  -webkit-app-region: no-drag;
`;

const ControlButton = styled(motion.button)`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease-out;
  position: relative;
  
  ${props => {
    switch (props.$color) {
      case 'red':
        return `
          background: ${props.theme.colors.controls.red};
          
          &:hover {
            background: #ff3b30;
            
            &::after {
              content: '×';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: rgba(0, 0, 0, 0.7);
              font-size: 8px;
              font-weight: bold;
              line-height: 1;
            }
          }
        `;
      case 'yellow':
        return `
          background: ${props.theme.colors.controls.yellow};
          
          &:hover {
            background: #ffcc00;
            
            &::after {
              content: '−';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: rgba(0, 0, 0, 0.7);
              font-size: 10px;
              font-weight: bold;
              line-height: 1;
            }
          }
        `;
      case 'green':
        return `
          background: ${props.theme.colors.controls.green};
          
          &:hover {
            background: #30d158;
            
            &::after {
              content: '⤢';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(90deg);
              color: rgba(0, 0, 0, 0.7);
              font-size: 8px;
              font-weight: bold;
              line-height: 1;
            }
          }
        `;
      default:
        return '';
    }
  }}

  &:active {
    transform: scale(0.9);
  }

  &:focus {
    outline: none;
  }
`;

const WindowTitle = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.colors.gray[700]};
  white-space: nowrap;
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AppIcon = styled.img`
  width: 16px;
  height: 16px;
  border-radius: 3px;
  object-fit: contain;
`;

const ToolbarButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  -webkit-app-region: no-drag;
`;

const IconButton = styled(motion.button)`
  width: 28px;
  height: 28px;
  border-radius: ${props => props.theme.borderRadius.sm};
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.gray[500]};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.15s ease-out;

  &:hover {
    background: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.gray[700]};
  }

  &:active {
    background: ${props => props.theme.colors.gray[200]};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary}33;
  }
`;

/**
 * macOS 风格标题栏组件
 */
const TitleBar = ({
  title = '尺码表生成器',
  onClose,
  onMinimize,
  onMaximize,
  onSettings,
  onHelp,
  showControls = true,
  showTitle = true,
  showToolbar = true,
  className,
  ...props
}) => {
  const handleClose = () => {
    onClose?.();
    // 在 Electron 中关闭窗口
    if (window.electronAPI) {
      window.electronAPI.window.close();
    }
  };

  const handleMinimize = () => {
    onMinimize?.();
    // 在 Electron 中最小化窗口
    if (window.electronAPI) {
      window.electronAPI.window.minimize();
    }
  };

  const handleMaximize = () => {
    onMaximize?.();
    // 在 Electron 中最大化/还原窗口
    if (window.electronAPI) {
      window.electronAPI.window.toggleMaximize();
    }
  };

  const handleSettings = () => {
    onSettings?.();
  };

  const handleHelp = () => {
    onHelp?.();
  };

  return (
    <TitleBarContainer className={className} {...props}>
      {showControls && (
        <TrafficLights>
          <ControlButton
            $color="red"
            onClick={handleClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="关闭"
          />
          <ControlButton
            $color="yellow"
            onClick={handleMinimize}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="最小化"
          />
          <ControlButton
            $color="green"
            onClick={handleMaximize}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="最大化"
          />
        </TrafficLights>
      )}

      {showTitle && (
        <WindowTitle>
          <AppIcon src="/icon_32x32.png" alt="应用图标" />
          {title}
        </WindowTitle>
      )}

      {showToolbar && (
        <ToolbarButtons>
          <IconButton
            onClick={handleSettings}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="设置"
          >
            ⚙️
          </IconButton>
          <IconButton
            onClick={handleHelp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="帮助"
          >
            ❓
          </IconButton>
        </ToolbarButtons>
      )}
    </TitleBarContainer>
  );
};

export default TitleBar;
