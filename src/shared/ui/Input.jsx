import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled(motion.input)`
  width: 100%;
  padding: ${props => {
    switch (props.$size) {
    case 'small': return '6px 12px';
    case 'large': return '12px 16px';
    default: return '8px 12px';
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
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.gray[700]};
  transition: all 0.2s ease-out;

  &::placeholder {
    color: ${props => props.theme.colors.gray[400]};
  }

  &:hover {
    border-color: ${props => props.theme.colors.border.dark};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}33;
  }

  &:disabled {
    background: ${props => props.theme.colors.gray[50]};
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

  /* 成功状态 */
  ${props => props.$success && `
    border-color: ${props.theme.colors.success};
    
    &:focus {
      border-color: ${props.theme.colors.success};
      box-shadow: 0 0 0 3px ${props.theme.colors.success}33;
    }
  `}

  /* 带图标时的内边距调整 */
  ${props => props.$hasLeftIcon && `
    padding-left: ${props.$size === 'small' ? '32px' : '40px'};
  `}

  ${props => props.$hasRightIcon && `
    padding-right: ${props.$size === 'small' ? '32px' : '40px'};
  `}
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.gray[400]};
  font-size: ${props => props.$size === 'small' ? '14px' : '16px'};
  z-index: 1;

  ${props => props.$position === 'left' && `
    left: ${props.$size === 'small' ? '8px' : '12px'};
  `}

  ${props => props.$position === 'right' && `
    right: ${props.$size === 'small' ? '8px' : '12px'};
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
  display: flex;
  align-items: center;
  gap: 4px;
`;

const HelperText = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.gray[500]};
  margin-top: 4px;
`;

/**
 * macOS 风格输入框组件
 */
const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  size = 'medium',
  disabled = false,
  className,
  onChange,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const handleFocus = (e) => {
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    onBlur?.(e);
  };

  const hasError = Boolean(error);
  const hasLeftIcon = Boolean(leftIcon);
  const hasRightIcon = Boolean(rightIcon);

  return (
    <InputContainer className={className}>
      {label && <Label>{label}</Label>}
      
      <div style={{ position: 'relative' }}>
        {leftIcon && (
          <IconWrapper $position="left" $size={size}>
            {leftIcon}
          </IconWrapper>
        )}
        
        <StyledInput
          ref={ref}
          $size={size}
          $error={hasError}
          $hasLeftIcon={hasLeftIcon}
          $hasRightIcon={hasRightIcon}
          disabled={disabled}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          initial={{ scale: 1 }}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          {...props}
        />
        
        {rightIcon && (
          <IconWrapper $position="right" $size={size}>
            {rightIcon}
          </IconWrapper>
        )}
      </div>

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
    </InputContainer>
  );
});

Input.displayName = 'Input';

export default Input;
