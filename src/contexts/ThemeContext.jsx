import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, THEME_MODES } from '../styles/theme';

// 创建主题上下文
const ThemeContext = createContext();

// 自定义Hook获取主题上下文
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 主题提供者组件
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // 从localStorage读取主题偏好
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-mode');
    if (savedTheme) {
      setIsDarkMode(savedTheme === THEME_MODES.DARK);
    } else {
      // 检测系统深色模式偏好
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(systemPrefersDark);
    }
  }, []);
  
  // 切换主题模式
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme-mode', newMode ? THEME_MODES.DARK : THEME_MODES.LIGHT);
  };
  
  // 设置特定主题模式
  const setThemeMode = (mode) => {
    const newIsDarkMode = mode === THEME_MODES.DARK;
    setIsDarkMode(newIsDarkMode);
    localStorage.setItem('theme-mode', mode);
  };
  
  // 创建当前主题
  const theme = createTheme(isDarkMode);
  
  // 更新CSS变量
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    
    // 设置CSS变量
    if (isDarkMode) {
      root.style.setProperty('--text-primary', '#F2F2F7');
      root.style.setProperty('--text-secondary', '#AEAEB2');
      root.style.setProperty('--bg-secondary', '#2C2C2E');
      root.style.setProperty('--border-light', '#3A3A3C');
    } else {
      root.style.setProperty('--text-primary', '#111827');
      root.style.setProperty('--text-secondary', '#6B7280');
      root.style.setProperty('--bg-secondary', '#F9FAFB');
      root.style.setProperty('--border-light', '#E5E7EB');
    }
  }, [isDarkMode]);
  
  const contextValue = {
    theme,
    isDarkMode,
    mode: isDarkMode ? THEME_MODES.DARK : THEME_MODES.LIGHT,
    toggleTheme,
    setThemeMode,
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};