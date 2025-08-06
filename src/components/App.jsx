import React, { useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { presetCategories, storage } from '../services/dataManager';
import { calculateSizeData, formatSizeDataForTable } from '../services/sizeCalculator';
import { exportSizeTableToImage, downloadImage } from '../services/tableExporter';

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

/**
 * 应用主入口组件
 */
const App = () => {
  // 简单的状态管理 - 直接在 App 层级
  const [appState, setAppState] = useState({
    mode: 'normal',
    sizeSettings: { 
      startSize: 'S', 
      count: 4 
    },
    selectedCategories: [],
    categories: [],
    categoryStartValues: {}, // 存储每个类别的自定义起始值
    chartData: null,
    searchQuery: '',
    isGenerating: false,
    isSettingsOpen: false, // 设置面板状态
    exportPath: '', // 导出路径设置
  });

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

  // 初始化数据
  useEffect(() => {
    // 从本地存储加载数据
    const savedCategories = storage.load('customCategories', []);
    const savedSettings = storage.load('sizeSettings', appState.sizeSettings);
    const savedMode = storage.load('mode', appState.mode);
    const savedStartValues = storage.load('categoryStartValues', {});
    const savedExportPath = storage.load('exportPath', '');

    setAppState(prev => ({
      ...prev,
      categories: [...presetCategories, ...savedCategories],
      sizeSettings: savedSettings,
      mode: savedMode,
      categoryStartValues: savedStartValues,
      exportPath: savedExportPath
    }));
  }, []);

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
      // Ctrl + S 导出图片
      if (event.ctrlKey && event.key === 's') {
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

  // 保存数据到本地存储
  useEffect(() => {
    const customCategories = appState.categories.filter(cat => cat.isCustom);
    storage.save('customCategories', customCategories);
    storage.save('sizeSettings', appState.sizeSettings);
    storage.save('categoryStartValues', appState.categoryStartValues);
    storage.save('mode', appState.mode);
    storage.save('exportPath', appState.exportPath);
  }, [appState.categories, appState.sizeSettings, appState.mode, appState.categoryStartValues, appState.exportPath]);

  // 实时更新预览 - 当设置或选择变化时自动生成预览
  useEffect(() => {
    const { sizeSettings, selectedCategories, mode, categoryStartValues } = appState;
    
    // 只有当有选中的类别时才生成预览
    if (selectedCategories.length > 0) {
      try {
        const chartData = calculateSizeData(sizeSettings, selectedCategories, mode, categoryStartValues);
        setAppState(prev => ({
          ...prev,
          chartData
        }));
      } catch (error) {
        console.error('实时预览生成失败:', error);
        // 出错时清空预览
        setAppState(prev => ({
          ...prev,
          chartData: null
        }));
      }
    } else {
      // 没有选中类别时清空预览
      setAppState(prev => ({
        ...prev,
        chartData: null
      }));
    }
  }, [appState.sizeSettings, appState.selectedCategories, appState.mode, appState.categoryStartValues]);


  // 窗口控制事件
  const handleClose = () => {
    if (confirm('确定要关闭应用吗？')) {
      window.close();
    }
  };

  const handleMinimize = () => {
    // Electron 环境下的最小化
    if (window.electronAPI) {
      window.electronAPI.window.minimize();
    }
  };

  const handleMaximize = () => {
    // Electron 环境下的最大化/还原
    if (window.electronAPI) {
      window.electronAPI.window.toggleMaximize();
    }
  };

  const handleSettings = () => {
    setAppState(prev => ({ ...prev, isSettingsOpen: true }));
  };

  const handleCloseSettings = () => {
    setAppState(prev => ({ ...prev, isSettingsOpen: false }));
  };

  // 类别管理方法
  const handleCategoryAdd = (newCategory) => {
    setAppState(prev => ({
      ...prev,
      categories: [...prev.categories, { ...newCategory, isCustom: true }]
    }));
  };

  const handleCategoryEdit = (categoryId, updatedCategory) => {
    setAppState(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === categoryId ? { ...cat, ...updatedCategory } : cat
      )
    }));
  };

  const handleCategoryDelete = (categoryId) => {
    setAppState(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== categoryId),
      selectedCategories: prev.selectedCategories.filter(id => id !== categoryId)
    }));
  };

  const handleHelp = () => {
    // TODO: 打开帮助文档
    alert('帮助功能开发中...');
  };

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <Toolbar
          appState={appState}
          setAppState={setAppState}
          onSettings={handleSettings}
        />
        
        <ContentArea>
          <Sidebar
            appState={appState}
            setAppState={setAppState}
          />
          
          <MainContent
            appState={appState}
            setAppState={setAppState}
          />
        </ContentArea>
        
        <StatusBar
          appState={appState}
          exportStatus={exportStatus}
        />

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
