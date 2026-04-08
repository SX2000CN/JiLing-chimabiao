import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const SegmentContainer = styled.div`
  display: inline-flex;
  background: ${props => props.theme.colors.gray[100]};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 2px;
  border: 1px solid ${props => props.theme.colors.border.medium};
  position: relative;
  
  ${props => props.$size === 'small' && `
    padding: 1px;
    border-radius: ${props.theme.borderRadius.sm};
  `}

  ${props => props.$size === 'large' && `
    padding: 3px;
    border-radius: ${props.theme.borderRadius.lg};
  `}
`;

const SegmentButton = styled(motion.button)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => {
    switch (props.$size) {
    case 'small': return '4px 8px';
    case 'large': return '10px 16px';
    default: return '6px 12px';
    }
  }};
  font-size: ${props => {
    switch (props.$size) {
    case 'small': return '12px';
    case 'large': return '16px';
    default: return '14px';
    }
  }};
  font-weight: 500;
  font-family: ${props => props.theme.typography.fontFamily.sans.join(', ')};
  border: none;
  border-radius: ${props => {
    switch (props.$size) {
    case 'small': return props.theme.borderRadius.sm;
    case 'large': return props.theme.borderRadius.lg;
    default: return props.theme.borderRadius.md;
    }
  }};
  background: transparent;
  color: ${props => props.$active 
    ? props.theme.colors.gray[700] 
    : props.theme.colors.gray[500]
};
  cursor: pointer;
  transition: all 0.2s ease-out;
  white-space: nowrap;
  user-select: none;
  min-width: ${props => {
    switch (props.$size) {
    case 'small': return '40px';
    case 'large': return '80px';
    default: return '60px';
    }
  }};
  z-index: 1;

  &:hover {
    color: ${props => props.theme.colors.gray[700]};
  }

  &:focus {
    outline: none;
    z-index: 2;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* 左侧圆角 */
  ${props => props.$position === 'first' && `
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  `}

  /* 中间无圆角 */
  ${props => props.$position === 'middle' && `
    border-radius: 0;
  `}

  /* 右侧圆角 */
  ${props => props.$position === 'last' && `
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  `}

  /* 单个按钮 */
  ${props => props.$position === 'only' && `
    /* 保持默认圆角 */
  `}
`;

const ActiveIndicator = styled(motion.div)`
  position: absolute;
  top: 2px;
  bottom: 2px;
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => {
    switch (props.$size) {
    case 'small': return props.theme.borderRadius.sm;
    case 'large': return props.theme.borderRadius.lg;
    default: return props.theme.borderRadius.md;
    }
  }};
  box-shadow: ${props => props.theme.shadows.sm};
  z-index: 0;
  
  ${props => props.$size === 'small' && `
    top: 1px;
    bottom: 1px;
  `}

  ${props => props.$size === 'large' && `
    top: 3px;
    bottom: 3px;
  `}
`;

/**
 * 获取按钮位置
 */
const getPosition = (index, total) => {
  if (total === 1) {
    return 'only';
  }
  if (index === 0) {
    return 'first';
  }
  if (index === total - 1) {
    return 'last';
  }
  return 'middle';
};

/**
 * Finder 风格分段控制器组件
 */
const SegmentedControl = ({
  options = [],
  value,
  onChange,
  size = 'medium',
  disabled = false,
  className,
  ...props
}) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [buttonWidths, setButtonWidths] = React.useState([]);
  const buttonRefs = React.useRef([]);

  // 计算当前选中项的索引
  React.useEffect(() => {
    const index = options.findIndex(option => {
      const optionValue = typeof option === 'object' ? option.value : option;
      return optionValue === value;
    });
    setActiveIndex(index >= 0 ? index : 0);
  }, [options, value]);

  // 测量按钮宽度
  React.useEffect(() => {
    const widths = buttonRefs.current.map(ref => 
      ref ? ref.getBoundingClientRect().width : 0
    );
    setButtonWidths(widths);
  }, [options, size]);

  // 计算活动指示器的位置和宽度
  const getActiveIndicatorStyle = () => {
    if (buttonWidths.length === 0 || activeIndex < 0) {
      return { left: 0, width: 0 };
    }

    const left = buttonWidths
      .slice(0, activeIndex)
      .reduce((sum, width) => sum + width, 0);
    const width = buttonWidths[activeIndex] || 0;

    return { left, width };
  };

  const handleOptionClick = (option) => {
    if (disabled) {
      return;
    }

    const optionValue = typeof option === 'object' ? option.value : option;
    onChange?.(optionValue, option);
  };

  if (options.length === 0) {
    return null;
  }

  const activeStyle = getActiveIndicatorStyle();

  return (
    <SegmentContainer 
      $size={size} 
      className={className} 
      {...props}
    >
      {/* 活动指示器 */}
      <ActiveIndicator
        $size={size}
        style={{
          left: activeStyle.left,
          width: activeStyle.width,
        }}
        layout
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
      />

      {/* 选项按钮 */}
      {options.map((option, index) => {
        const optionValue = typeof option === 'object' ? option.value : option;
        const optionLabel = typeof option === 'object' ? option.label : option;
        const isActive = optionValue === value;
        const position = getPosition(index, options.length);

        return (
          <SegmentButton
            key={optionValue}
            ref={el => buttonRefs.current[index] = el}
            $active={isActive}
            $position={position}
            $size={size}
            disabled={disabled}
            onClick={() => handleOptionClick(option, index)}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
          >
            {optionLabel}
          </SegmentButton>
        );
      })}
    </SegmentContainer>
  );
};

export default SegmentedControl;
