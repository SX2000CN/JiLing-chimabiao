// 深色模式和浅色模式的主题配置
const lightTheme = {
  colors: {
    // 系统色彩
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    
    // 灰度色阶
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    
    // 背景色
    background: {
      primary: '#FFFFFF',
      secondary: '#F8F9FA',
      tertiary: '#F1F3F4',
    },
    
    // 文本色
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      inverse: '#FFFFFF',
    },
    
    // 边框色
    border: {
      light: '#E5E7EB',
      medium: '#D1D5DB',
      dark: '#9CA3AF',
    },

    // 窗口控制按钮
    controls: {
      red: '#FF5F57',
      yellow: '#FFBD2E',
      green: '#28CA42',
    }
  }
};

const darkTheme = {
  colors: {
    // 系统色彩 - 深色模式下稍微调亮
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    
    // 灰度色阶 - 深色模式反转
    gray: {
      50: '#1C1C1E',
      100: '#2C2C2E',
      200: '#3A3A3C',
      300: '#48484A',
      400: '#636366',
      500: '#8E8E93',
      600: '#AEAEB2',
      700: '#C7C7CC',
      800: '#D1D1D6',
      900: '#F2F2F7',
    },
    
    // 背景色 - 深色背景
    background: {
      primary: '#1C1C1E',
      secondary: '#2C2C2E',
      tertiary: '#3A3A3C',
    },
    
    // 文本色 - 深色模式文本
    text: {
      primary: '#F2F2F7',
      secondary: '#AEAEB2',
      tertiary: '#8E8E93',
      inverse: '#1C1C1E',
    },
    
    // 边框色 - 深色边框
    border: {
      light: '#3A3A3C',
      medium: '#48484A',
      dark: '#636366',
    },

    // 窗口控制按钮 - 深色模式下稍微调整
    controls: {
      red: '#FF5F57',
      yellow: '#FFBD2E',
      green: '#28CA42',
    }
  }
};

// 共享的基础样式配置
const baseStyles = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  
  typography: {
    fontFamily: {
      sans: ['MiSans', 'Microsoft YaHei', '微软雅黑', 'PingFang SC', '苹方', 'Helvetica Neue', 'Arial', 'sans-serif'],
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
    }
  },
  
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '50%',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  
  // 高质量渲染配置
  rendering: {
    // CSS 优化属性
    optimization: {
      willChange: 'transform',
      backfaceVisibility: 'hidden',
      perspective: '1000px',
      transform: 'translateZ(0)',
    },
    
    // 字体渲染优化
    fontSmoothing: {
      webkit: 'antialiased',
      moz: 'grayscale',
    },
    
    // 动画缓动函数
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    
    // 过渡时间
    duration: {
      fast: '0.1s',
      normal: '0.15s',
      slow: '0.3s',
    }
  }
};

// 创建主题函数，根据模式返回相应主题
export const createTheme = (isDarkMode = false) => {
  const colorTheme = isDarkMode ? darkTheme : lightTheme;
  
  return {
    ...colorTheme,
    ...baseStyles,
    mode: isDarkMode ? 'dark' : 'light',
  };
};

// 默认导出浅色主题（向后兼容）
export const theme = createTheme(false);

// 导出主题常量
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark'
};
