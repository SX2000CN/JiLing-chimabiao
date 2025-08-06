import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 24px;
  padding-top: 10vh; /* 距离顶部10vh，确保在小窗口中也能完全显示 */
  overflow-y: auto;

  /* 响应式调整 */
  @media (max-height: 600px) {
    padding-top: 24px; /* 小高度窗口时减少顶部间距 */
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    padding-top: 24px;
  }
`;

const ModalContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  max-width: ${props => props.$maxWidth || '500px'};
  width: 100%;
  max-height: 80vh; /* 减少最大高度，为顶部和底部留出更多空间 */
  overflow-y: auto;
  margin-bottom: 24px; /* 确保底部有足够空间 */
`;

const ModalHeader = styled.div`
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.colors.gray[800]};
  margin: 0;
`;

const CloseButton = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${props => props.theme.colors.gray[400]};
  font-size: 16px;
  transition: all 0.2s ease-out;

  &:hover {
    background: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.gray[600]};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary}33;
  }
`;

const ModalContent = styled.div`
  padding: 24px;
`;

/**
 * 模态框组件
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth,
  closeOnOverlayClick = true,
  closeOnEsc = true
}) => {
  // 处理 ESC 键关闭
  useEffect(() => {
    if (!closeOnEsc || !isOpen) return;

    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose, closeOnEsc]);

  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleOverlayClick}
        >
          <ModalContainer
            $maxWidth={maxWidth}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {title && (
              <ModalHeader>
                <ModalTitle>{title}</ModalTitle>
                <CloseButton onClick={onClose}>
                  ✕
                </CloseButton>
              </ModalHeader>
            )}
            
            <ModalContent>
              {children}
            </ModalContent>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default Modal;
