import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { microAnimations } from '../../styles/animations';

const StyledButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: ${props => {
    switch (props.$size) {
    case 'small': return '6px 12px';
    case 'large': return '12px 24px';
    default: return '8px 16px';
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
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease-out;
  user-select: none;
  white-space: nowrap;
  position: relative;
  overflow: hidden;

  /* 变体样式 */
  ${props => {
    switch (props.$variant) {
    case 'primary':
      return `
          background: ${props.theme.colors.primary};
          color: white;
          
          &:hover {
            background: ${props.theme.colors.primary}dd;
            box-shadow: ${props.theme.shadows.md};
          }
          
          &:active {
            background: ${props.theme.colors.primary}bb;
          }
        `;
    case 'secondary':
      return `
          background: ${props.theme.colors.gray[100]};
          color: ${props.theme.colors.gray[700]};
          
          &:hover {
            background: ${props.theme.colors.gray[200]};
            box-shadow: ${props.theme.shadows.sm};
          }
          
          &:active {
            background: ${props.theme.colors.gray[300]};
          }
        `;
    case 'outline':
      return `
          background: transparent;
          color: ${props.theme.colors.primary};
          border: 1px solid ${props.theme.colors.border.medium};
          
          &:hover {
            background: ${props.theme.colors.primary}0a;
            border-color: ${props.theme.colors.primary};
            box-shadow: ${props.theme.shadows.sm};
          }
          
          &:active {
            background: ${props.theme.colors.primary}1a;
          }
        `;
    case 'ghost':
      return `
          background: transparent;
          color: ${props.theme.colors.gray[600]};
          
          &:hover {
            background: ${props.theme.colors.gray[100]};
          }
          
          &:active {
            background: ${props.theme.colors.gray[200]};
          }
        `;
    case 'danger':
      return `
          background: ${props.theme.colors.error};
          color: white;
          
          &:hover {
            background: ${props.theme.colors.error}dd;
            box-shadow: ${props.theme.shadows.md};
          }
          
          &:active {
            background: ${props.theme.colors.error}bb;
          }
        `;
    default:
      return `
          background: ${props.theme.colors.gray[100]};
          color: ${props.theme.colors.gray[700]};
          
          &:hover {
            background: ${props.theme.colors.gray[200]};
          }
          
          &:active {
            background: ${props.theme.colors.gray[300]};
          }
        `;
    }
  }}

  /* 禁用状态 */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }

  /* 聚焦样式 */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}33;
  }

  /* 加载状态 */
  ${props => props.$loading && `
    pointer-events: none;
    opacity: 0.7;
  `}
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.$size === 'small' ? '14px' : '16px'};
`;

/**
 * macOS 风格按钮组件
 */
const Button = React.forwardRef(({
  children,
  variant = 'default',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  onClick,
  className,
  ...props
}, ref) => {
  const handleClick = (e) => {
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const iconElement = icon && (
    <IconWrapper $size={size}>
      {icon}
    </IconWrapper>
  );

  const loadingElement = loading && <LoadingSpinner />;

  return (
    <StyledButton
      ref={ref}
      $variant={variant}
      $size={size}
      $loading={loading}
      disabled={disabled}
      onClick={handleClick}
      className={className}
      whileHover={!disabled && !loading ? microAnimations.hover : {}}
      whileTap={!disabled && !loading ? microAnimations.tap : {}}
      {...props}
    >
      {loading && loadingElement}
      {!loading && iconPosition === 'left' && iconElement}
      {children}
      {!loading && iconPosition === 'right' && iconElement}
    </StyledButton>
  );
});

Button.displayName = 'Button';

export default Button;
