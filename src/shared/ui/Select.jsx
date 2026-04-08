import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styled, { useTheme } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SelectTrigger = styled(motion.button)`
  width: 100%;
  padding: ${props => {
    switch (props.$size) {
    case 'small': return '6px 28px 6px 12px';
    case 'large': return '12px 36px 12px 16px';
    default: return '8px 32px 8px 12px';
    }
  }};
  font-size: ${props => {
    switch (props.$size) {
    case 'small': return '12px';
    case 'large': return '16px';
    default: return '14px';
    }
  }};
  font-family: ${props => props.theme.typography.fontFamily.sans.join(', ')};
  border: 1px solid ${props => props.theme.colors.border.medium};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background.secondary};
  color: ${props => props.$placeholder ? props.theme.colors.gray[500] : props.theme.colors.gray[800]};
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease-out;
  position: relative;

  &:hover {
    border-color: ${props => props.theme.colors.border.dark};
    background: ${props => props.theme.colors.background.tertiary};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}33;
  }

  &:disabled {
    background: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.gray[400]};
    cursor: not-allowed;
  }

  /* 错误状态 */
  ${props => props.$error && `
    border-color: ${props.theme.colors.error};

    &:focus {
      border-color: ${props.theme.colors.error};
      box-shadow: 0 0 0 3px ${props.theme.colors.error}33;
    }
  `}

  /* 展开状态 */
  ${props => props.$isOpen && `
    border-color: ${props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props.theme.colors.primary}33;
  `}
`;

const ChevronIcon = styled(motion.div)`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%); /* 基础居中位置，具体位置调整由Framer Motion控制 */
  width: 16px;
  height: 16px;
  color: ${props => props.theme.colors.gray[500]};
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  transition: color 0.2s ease;

  &::after {
    content: '';
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid currentColor;
  }

  /* 悬停状态下的颜色变化 */
  ${props => props.$isOpen && `
    color: ${props.theme.colors.primary};
  `}
`;

const OptionsContainer = styled(motion.div)`
  position: fixed;
  z-index: 9999;
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.medium};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.lg};
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
  min-width: 120px;
`;

const Option = styled(motion.div)`
  padding: 8px 12px;
  font-size: 14px;
  color: ${props => props.theme.colors.gray[800]};
  cursor: pointer;
  transition: all 0.15s ease-out;

  &:hover {
    background: ${props => props.theme.colors.gray[100]};
  }

  &:active {
    background: ${props => props.theme.colors.gray[200]};
  }

  ${props => props.$selected && `
    background: ${props.theme.colors.primary};
    color: white;

    &:hover {
      background: ${props.theme.colors.primary}dd;
    }
  `}

  ${props => props.$disabled && `
    color: ${props.theme.colors.gray[400]};
    cursor: not-allowed;

    &:hover {
      background: transparent;
    }
  `}
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.theme.colors.gray[700]};
  margin-bottom: 4px;
`;

const ErrorMessage = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.error};
  margin-top: 4px;
`;

const HelperText = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.gray[500]};
  margin-top: 4px;
`;

/**
 * macOS 风格选择器组件
 */
const Select = ({
  label,
  placeholder = '请选择...',
  options = [],
  value,
  onChange,
  error,
  helperText,
  size = 'medium',
  disabled = false,
  className,
  ...props
}) => {
  const theme = useTheme();  // 获取主题以支持深色模式
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  // 计算下拉菜单位置
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) {
      return;
    }
    
    const rect = triggerRef.current.getBoundingClientRect();
    
    setDropdownPosition({
      top: rect.bottom + 4, // 添加4px间距，不需要scrollY因为使用fixed定位
      left: rect.left,
      width: rect.width
    });
  }, []);

  // 监听滚动和窗口大小变化，重新计算位置
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleScroll = () => {
      calculatePosition();
    };

    const handleResize = () => {
      calculatePosition();
    };

    // 监听所有可能的滚动容器
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    // 初始计算位置
    calculatePosition();

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, calculatePosition]);

  // 处理打开下拉菜单
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(prev => !prev);
    }
  };

  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        // 检查是否点击在Portal渲染的下拉菜单内
        const dropdownElements = document.querySelectorAll('[data-dropdown-container]');
        let clickedInDropdown = false;
        
        dropdownElements.forEach(element => {
          if (element.contains(event.target)) {
            clickedInDropdown = true;
          }
        });
        
        if (!clickedInDropdown) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) {
        return;
      }

      switch (event.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        // TODO: 添加键盘导航逻辑
        break;
      case 'Enter':
        event.preventDefault();
        // TODO: 添加选择逻辑
        break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleOptionClick = (option) => {
    if (!option.disabled) {
      onChange?.(option.value, option);
      setIsOpen(false);
    }
  };

  // 查找当前选中的选项
  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';
  const isPlaceholder = !selectedOption;

  return (
    <SelectContainer ref={containerRef} className={className}>
      {label && <Label>{label}</Label>}
      
      <SelectTrigger
        ref={triggerRef}
        $size={size}
        $error={Boolean(error)}
        $isOpen={isOpen}
        $placeholder={isPlaceholder}
        disabled={disabled}
        onClick={handleToggle}
        whileTap={{ scale: disabled ? 1 : 0.99 }}
        {...props}
      >
        {displayValue || placeholder}
        <ChevronIcon
          $isOpen={isOpen}
          $size={size}
          animate={{ 
            rotate: isOpen ? 180 : 0,
            y: -6 // 向上移动6px，保持在Framer Motion控制下
          }}
          transition={{ duration: 0.2 }}
        />
      </SelectTrigger>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <OptionsContainer
              as={motion.div}
              data-dropdown-container
              style={{
                position: 'fixed',
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                zIndex: 9999,
                backgroundColor: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.medium}`,
                borderRadius: theme.borderRadius.md,
                boxShadow: theme.shadows.lg,
                maxHeight: '200px',
                overflowY: 'auto'
              }}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {options.map((option, index) => (
                <Option
                  key={option.value}
                  $selected={option.value === value}
                  $disabled={option.disabled}
                  onClick={() => handleOptionClick(option)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={!option.disabled ? { backgroundColor: theme.colors.gray[100] } : {}}
                >
                  {option.label}
                </Option>
              ))}
              {options.length === 0 && (
                <Option $disabled>
                  暂无选项
                </Option>
              )}
            </OptionsContainer>
          )}
        </AnimatePresence>,
        document.body
      )}

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      {!error && helperText && (
        <HelperText>
          {helperText}
        </HelperText>
      )}
    </SelectContainer>
  );
};

export default Select;
