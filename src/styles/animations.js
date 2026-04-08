import { css } from 'styled-components';

// 基础过渡动画
export const transitions = {
  fast: 'all 0.15s ease-out',
  normal: 'all 0.2s ease-out',
  slow: 'all 0.3s ease-out',
  spring: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

// 弹性动画配置
export const springConfig = {
  type: 'spring',
  stiffness: 300,
  damping: 30
};

// 微交互动画
export const microAnimations = {
  hover: {
    scale: 1.02,
    transition: { type: 'spring', stiffness: 400, damping: 25 }
  },
  tap: {
    scale: 0.98,
    transition: { type: 'spring', stiffness: 400, damping: 25 }
  },
  focus: {
    scale: 1.01,
    transition: { type: 'spring', stiffness: 400, damping: 25 }
  }
};

// 页面过渡动画
export const pageTransitions = {
  slideLeft: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 }
  },
  slideRight: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 }
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  }
};

// 列表项动画
export const listItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.05,
      type: 'spring',
      stiffness: 300,
      damping: 25
    }
  })
};

// 样式工具函数
export const createGlassEffect = (opacity = 0.8) => css`
  background: rgba(255, 255, 255, ${opacity});
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

export const createHoverEffect = () => css`
  transition: ${transitions.normal};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const createFocusRing = (color = '#007AFF') => css`
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${color}33;
  }
`;

export default {
  transitions,
  springConfig,
  microAnimations,
  pageTransitions,
  listItemVariants,
  createGlassEffect,
  createHoverEffect,
  createFocusRing
};
