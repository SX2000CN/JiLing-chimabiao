import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { presetCategories, storage } from '../services/dataManager';
import { calculateSizeData, formatSizeDataForTable } from '../services/sizeCalculator';
import { exportSizeTableToImage, downloadImage } from '../services/tableExporter';
import { useAppStore } from '../stores/useAppStore';

// 组件导入
import Toolbar from './Toolbar';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import StatusBar from './StatusBar';
import SettingsPanel from './SettingsPanel';

// 全局样式导入
import '../styles/globals.css';
import { highQualityStyles } from '../styles/highQuality';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background.secondary};
  font-family: ${props => props.theme.typography.fontFamily.sans.join(', ')};
  
  /* 应用高质量渲染基础 */
  ${highQualityStyles.base}
  ${highQualityStyles.highDPI}
  
  /* 确保整体布局精度 */
  contain: layout style paint;
  isolation: isolate;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  overflow-x: hidden;
  overflow-y: auto;
  width: 100%;
`;

/* 状态栏容器 - 分割线已移至 StatusBar.jsx 使用 box-shadow 实现 */
const StatusBarSection = styled.div`
  width: 100%;
  flex-shrink: 0;
`;

/**
 * 应用主入口组件
 */
const App = () => {
  // 获取主题上下文
  const { theme } = useTheme();

  // 从 Zustand store 获取状态和操作
  const {
    mode,
    sizeSettings,
    categories,
    selectedCategories,
    categoryStartValues,
    isSettingsOpen,
    exportPath,
    setCategories,
    setMode,
    setSizeSettings,
    setSelectedCategories,
    setCategoryStartValues,
    setSettingsOpen,
    setExportPath,
    addCategory,
    updateCategory: storeUpdateCategory,
    deleteCategory: storeDeleteCategory,
  } = useAppStore();

  // 为了兼容现有组件，创建 appState 对象和 setAppState 函数
  // 这样可以渐进式迁移，不需要一次性修改所有组件
  const [chartData, setChartData] = useState(null);

  const appState = useMemo(() => ({
    mode,
    sizeSettings,
    categories,
    selectedCategories,
    categoryStartValues,
    chartData,
    isSettingsOpen,
    exportPath,
  }), [mode, sizeSettings, categories, selectedCategories, categoryStartValues, chartData, isSettingsOpen, exportPath]);

  // 兼容旧的 setAppState 接口
  const setAppState = (updater) => {
    const updates = typeof updater === 'function' ? updater(appState) : updater;

    if ('mode' in updates) setMode(updates.mode);
    if ('sizeSettings' in updates) setSizeSettings(updates.sizeSettings);
    if ('categories' in updates) setCategories(updates.categories);
    if ('selectedCategories' in updates) setSelectedCategories(updates.selectedCategories);
    if ('categoryStartValues' in updates) setCategoryStartValues(updates.categoryStartValues);
    if ('chartData' in updates) setChartData(updates.chartData);
    if ('isSettingsOpen' in updates) setSettingsOpen(updates.isSettingsOpen);
    if ('exportPath' in updates) setExportPath(updates.exportPath);
  };

  // 导出状态管理
  const [exportStatus, setExportStatus] = useState({
    show: false,
    message: '',
    type: 'success' // 'success', 'error', 'loading'
  });

  // 显示导出状态提示
  const showExportStatus = (message, type = 'success') => {
    setExportStatus({
      show: true,
      message,
      type
    });

    // 2秒后自动隐藏
    setTimeout(() => {
      setExportStatus(prev => ({
        ...prev,
        show: false
      }));
    }, 2000);
  };

  // 初始化数据 - 加载预设类别和自定义类别
  useEffect(() => {
    const savedCategories = storage.load('customCategories', []);
    setCategories([...presetCategories, ...savedCategories]);
  }, [setCategories]);

  // 添加键盘快捷键监听
  useEffect(() => {
    // 格式化数据用于导出
    const formatChartDataForExport = (chartData) => {
      if (!chartData || chartData.length === 0) return [];
      
      // 使用正确的格式化函数 - 与 PreviewPanel 保持一致
      const { headers, rows } = formatSizeDataForTable(chartData);
      
      // 转换为对象数组格式，确保第一列是尺码
      return rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });
    };

    const handleKeyDown = async (event) => {
      // Ctrl + S 导出图片 - 支持大小写锁定
      if (event.ctrlKey && (event.key === 's' || event.key === 'S')) {
        event.preventDefault();
        console.log('Ctrl+S pressed, selectedCategories:', appState.selectedCategories.length, 'chartData:', !!appState.chartData);
        
        // 改进逻辑：如果有选中的类别但没有 chartData，先尝试生成
        if (appState.selectedCategories.length > 0) {
          let chartDataToUse = appState.chartData;
          
          // 如果没有 chartData，立即生成
          if (!chartDataToUse) {
            try {
              chartDataToUse = calculateSizeData(
                appState.sizeSettings, 
                appState.selectedCategories, 
                appState.mode, 
                appState.categoryStartValues
              );
              console.log('临时生成尺码数据成功');
            } catch (error) {
              console.error('生成尺码数据失败:', error);
              showExportStatus('❌ 生成尺码数据失败', 'error');
              return;
            }
          }
          
          // 直接在这里处理导出，不再依赖 PreviewPanel
          try {
            const tableData = formatChartDataForExport(chartDataToUse);
            const tipText = appState.mode === 'sweater' ? 
              '温馨提示:由于手工测量会存在1-3cm误差，属于正常范围' : 
              '温馨提示:由于手工测量会存在1-3cm误差，属于正常范围';
            
            const imageDataUrl = exportSizeTableToImage(tableData, tipText);
            
            // 如果设置了导出路径，直接保存；否则弹出下载对话框
            if (appState.exportPath) {
              console.log('使用设置的导出路径:', appState.exportPath);
              await downloadImage(imageDataUrl, appState.exportPath, '尺码表');
              showExportStatus('📁 图片已保存到指定路径', 'success');
            } else {
              console.log('未设置导出路径，使用传统下载方式');
              const filename = `尺码表_${new Date().toISOString().slice(0, 10)}`;
              downloadImage(imageDataUrl, null, filename);
              showExportStatus('💾 图片导出成功', 'success');
            }
            
            console.log('图片导出成功');
          } catch (error) {
            console.error('导出图片失败:', error);
            showExportStatus('❌ 导出失败: ' + error.message, 'error');
          }
        } else {
          console.log('No categories selected');
          showExportStatus('⚠️ 请先选择尺码类别', 'error');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState.selectedCategories, appState.sizeSettings, appState.mode, appState.categoryStartValues, appState.chartData, appState.exportPath]);

  // 保存自定义类别到本地存储（Zustand 已处理其他持久化）
  useEffect(() => {
    const customCategories = categories.filter(cat => cat.isCustom);
    storage.save('customCategories', customCategories);
  }, [categories]);

  // 实时更新预览 - 当设置或选择变化时自动生成预览
  useEffect(() => {
    // 只有当有选中的类别时才生成预览
    if (selectedCategories.length > 0) {
      try {
        const newChartData = calculateSizeData(sizeSettings, selectedCategories, mode, categoryStartValues);
        setChartData(newChartData);
      } catch (error) {
        console.error('实时预览生成失败:', error);
        setChartData(null);
      }
    } else {
      setChartData(null);
    }
  }, [sizeSettings, selectedCategories, mode, categoryStartValues]);

  // 窗口控制事件
  const handleSettings = () => {
    setSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };

  // 类别管理方法
  const handleCategoryAdd = (newCategory) => {
    addCategory({ ...newCategory, isCustom: true });
  };

  const handleCategoryEdit = (categoryId, updatedCategory) => {
    storeUpdateCategory(categoryId, updatedCategory);
  };

  const handleCategoryDelete = (categoryId) => {
    storeDeleteCategory(categoryId);
  };

  return (
    <ThemeProvider theme={theme}>
      <AppContainer data-theme={theme.mode}>
        {/* 工具栏 - 仅包含窗口控件 */}
        <Toolbar />

        <ContentArea>
          {/* 侧边栏 - 包含模式选择器和设置按钮 */}
          <Sidebar
            appState={appState}
            setAppState={setAppState}
            onSettings={handleSettings}
          />

          <MainContent
            appState={appState}
            setAppState={setAppState}
          />
        </ContentArea>

        {/* 状态栏区域 */}
        <StatusBarSection>
          <StatusBar
            appState={appState}
            exportStatus={exportStatus}
          />
        </StatusBarSection>

        <SettingsPanel
          isOpen={appState.isSettingsOpen}
          onClose={handleCloseSettings}
          appState={appState}
          setAppState={setAppState}
          onCategoryAdd={handleCategoryAdd}
          onCategoryEdit={handleCategoryEdit}
          onCategoryDelete={handleCategoryDelete}
        />
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;
