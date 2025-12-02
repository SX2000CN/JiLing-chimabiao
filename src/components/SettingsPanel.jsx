import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import CategoryManager from './CategoryManager';
import { useTheme } from '../contexts/ThemeContext';

const PanelContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: ${props => props.theme.colors.background.primary};
  border-left: 1px solid ${props => props.theme.colors.border.light};
  box-shadow: ${props => props.theme.shadows.xl};
  z-index: 1000;
  overflow-y: auto;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  position: sticky;
  top: 0;
  background: ${props => props.theme.colors.background.primary};
  z-index: 10;
`;

const PanelTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.gray[800]};
  margin: 0;
`;

const PanelContent = styled.div`
  padding: 20px;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  margin-bottom: 20px;
`;

const Tab = styled.button`
  padding: 12px 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.gray[600]};
  border-bottom: 2px solid ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease-out;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const TabContent = styled(motion.div)`
  min-height: 300px;
`;

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
`;

/**
 * 设置面板组件
 */
const SettingsPanel = ({ 
  isOpen, 
  onClose, 
  appState, 
  setAppState, 
  onCategoryAdd, 
  onCategoryEdit, 
  onCategoryDelete 
}) => {
  const [activeTab, setActiveTab] = useState('categories');
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const tabs = [
    { id: 'categories', label: '类别管理' },
    { id: 'general', label: '通用设置' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'categories':
        return (
          <CategoryManager
            appState={appState}
            setAppState={setAppState}
            onCategoryAdd={onCategoryAdd}
            onCategoryEdit={onCategoryEdit}
            onCategoryDelete={onCategoryDelete}
            showHeader={false}
          />
        );
      case 'general':
        return (
          <div>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: 'var(--text-primary, #374151)',
              fontFamily: 'MiSans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}>通用设置</h3>
            

            {/* 深色模式开关 */}
            <div style={{ 
              marginBottom: '20px',
              padding: '16px', 
              background: 'var(--bg-secondary, #F9FAFB)', 
              borderRadius: '8px',
              border: '1px solid var(--border-light, #E5E7EB)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center'
              }}>
                <div>
                  <label style={{ 
                    fontWeight: '500',
                    fontSize: '14px',
                    color: 'var(--text-primary, #374151)',
                    display: 'block',
                    marginBottom: '4px',
                    fontFamily: 'MiSans, -apple-system, BlinkMacSystemFont, "Segue UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale'
                  }}>深色模式</label>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary, #6B7280)',
                    fontFamily: 'MiSans, -apple-system, BlinkMacSystemFont, "Segue UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale'
                  }}>切换应用主题外观</div>
                </div>
                <label style={{ 
                  position: 'relative',
                  display: 'inline-block',
                  width: '44px',
                  height: '24px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={isDarkMode}
                    onChange={toggleTheme}
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: isDarkMode ? '#007AFF' : '#D1D5DB',
                    borderRadius: '12px',
                    transition: 'background-color 0.2s ease',
                    cursor: 'pointer'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '',
                      height: '18px',
                      width: '18px',
                      left: isDarkMode ? '23px' : '3px',
                      bottom: '3px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '50%',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                    }} />
                  </span>
                </label>
              </div>
            </div>
            
            {/* 导出路径设置 */}
            <div style={{ 
              marginBottom: '20px',
              padding: '16px', 
              background: 'var(--bg-secondary, #F9FAFB)', 
              borderRadius: '8px',
              border: '1px solid var(--border-light, #E5E7EB)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <label style={{ 
                  fontWeight: '500',
                  fontSize: '14px',
                  color: 'var(--text-primary, #374151)',
                  fontFamily: 'MiSans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale'
                }}>默认导出路径</label>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '8px',
                alignItems: 'center'
              }}>
                <div
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid var(--border-light, #D1D5DB)',
                    borderRadius: '6px',
                    fontSize: '13px',
                    background: 'var(--bg-secondary, #F9FAFB)',
                    color: 'var(--text-secondary, #6B7280)',
                    fontFamily: 'SF Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
                    wordBreak: 'break-all',
                    minHeight: '16px',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale'
                  }}
                >
                  {appState.exportPath || '未设置（将使用系统默认下载位置）'}
                </div>
                <Button
                  variant="outline"
                  size="small"
                  onClick={async () => {
                    try {
                      // 使用 Electron 的文件对话框选择文件夹
                      if (window.electronAPI) {
                        const result = await window.electronAPI.selectDirectory();
                        if (result && !result.canceled) {
                          setAppState(prev => ({ 
                            ...prev, 
                            exportPath: result.filePaths[0] 
                          }));
                        }
                      } else {
                        // 浏览器环境，提示用户手动输入
                        alert('请手动输入保存路径，或在桌面应用中使用文件夹选择功能');
                      }
                    } catch (error) {
                      console.error('选择文件夹失败:', error);
                      alert('选择文件夹失败，请手动输入路径');
                    }
                  }}
                >
                  选择路径
                </Button>
              </div>
              
              <div style={{ 
                fontSize: '12px',
                color: 'var(--text-secondary, #6B7280)',
                marginTop: '8px',
                fontFamily: 'MiSans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
              }}>
                设置后导出图片时将直接保存到此路径，无需每次选择。快捷键：Ctrl+S
              </div>
            </div>
            
            <div style={{ 
              padding: '16px', 
              background: 'var(--bg-secondary, #F9FAFB)', 
              borderRadius: '8px',
              border: '1px solid var(--border-light, #E5E7EB)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ 
                  fontWeight: '500',
                  fontFamily: 'MiSans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  color: 'var(--text-primary, #111827)'
                }}>程序名称</span>
                <span style={{ 
                  color: 'var(--text-primary, #374151)',
                  fontWeight: '600',
                  fontFamily: 'MiSans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale'
                }}>集领商品部尺码表</span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ 
                  fontWeight: '500',
                  fontFamily: 'MiSans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  color: 'var(--text-primary, #111827)'
                }}>开发者</span>
                <span style={{ 
                  color: 'var(--text-secondary, #6B7280)',
                  fontFamily: 'MiSans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale'
                }}>师兄</span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ 
                  fontWeight: '500',
                  fontFamily: 'MiSans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  color: 'var(--text-primary, #111827)'
                }}>应用版本</span>
                <span style={{ 
                  color: 'var(--text-secondary, #6B7280)',
                  fontFamily: 'SF Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale'
                }}>v2.1.0</span>
              </div>
              
              <div style={{ 
                fontSize: '12px',
                color: 'var(--text-secondary, #6B7280)',
                marginTop: '8px',
                fontStyle: 'italic',
                fontFamily: 'MiSans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
              }}>
                专业的服装尺码表生成工具，为集领商品部量身定制
              </div>
            </div>
            
            <div style={{ 
              marginTop: '20px',
              fontSize: '14px',
              color: 'var(--text-secondary, #6B7280)',
              fontFamily: 'MiSans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}>
              <p>其他设置选项将在后续版本中添加...</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Backdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <PanelContainer
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <PanelHeader>
              <PanelTitle>设置</PanelTitle>
              <Button
                variant="ghost"
                size="small"
                onClick={onClose}
                icon="✕"
              >
              </Button>
            </PanelHeader>

            <TabContainer>
              {tabs.map(tab => (
                <Tab
                  key={tab.id}
                  $active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </Tab>
              ))}
            </TabContainer>

            <PanelContent>
              <TabContent
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderTabContent()}
              </TabContent>
            </PanelContent>
          </PanelContainer>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
