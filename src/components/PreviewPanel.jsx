import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Button from './Button';
import { exportSizeTableToImage, downloadImage } from '../services/tableExporter';
import { formatSizeDataForTable } from '../services/sizeCalculator';

const PanelContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
`;

const Title = styled.h2`
  color: ${props => props.theme.colors.gray[900]};
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  flex-shrink: 0;
  min-width: 120px;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: flex-end;
  max-width: 400px;
`;

const ZoomControls = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${props => props.theme.colors.gray[50]};
  border-radius: 6px;
  border: 1px solid ${props => props.theme.colors.gray[200]};
  min-width: 120px;
`;

const ZoomButton = styled(Button)`
  padding: 4px 8px;
  min-width: 28px;
  font-size: 12px;
`;

const ZoomLevel = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.gray[600]};
  min-width: 50px;
  text-align: center;
  font-weight: 500;
`;

const CanvasContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow: auto;
  background: 
    linear-gradient(45deg, #f8f9fa 25%, transparent 25%), 
    linear-gradient(-45deg, #f8f9fa 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, #f8f9fa 75%), 
    linear-gradient(-45deg, transparent 75%, #f8f9fa 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  min-height: 400px;
`;

const Canvas = styled.canvas`
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: white;
  transform: scale(${props => props.zoom / 100});
  transform-origin: center;
  transition: transform 0.2s ease;
  max-width: 100%;
  max-height: 100%;
`;

const EmptyState = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.gray[500]};
  font-size: 16px;
  padding: 60px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

/**
 * 预览面板组件
 */
const PreviewPanel = ({ appState }) => {
  const { selectedCategories, sizeSettings, chartData, mode, categories, categoryStartValues } = appState;
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(100);
  const [isGenerating, setIsGenerating] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 800 });

  // 计算Canvas适应容器的最佳尺寸
  const calculateCanvasSize = useCallback(() => {
    if (!containerRef.current) return { width: 800, height: 800 };
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // 减去padding和一些安全间距
    const availableWidth = containerRect.width - 48; // 24px padding * 2
    const availableHeight = containerRect.height - 48;
    
    // 保持正方形比例，选择较小的尺寸
    const maxSize = Math.min(availableWidth, availableHeight);
    
    // 设置最小和最大尺寸限制
    const minSize = 300;
    const maxSize_limit = 1000;
    
    const finalSize = Math.max(minSize, Math.min(maxSize, maxSize_limit));
    
    return { width: finalSize, height: finalSize };
  }, []);

  // 监听容器尺寸变化
  useEffect(() => {
    const updateCanvasSize = () => {
      const newSize = calculateCanvasSize();
      setCanvasSize(newSize);
    };

    // 初始设置
    updateCanvasSize();

    // 监听窗口大小变化
    const handleResize = () => {
      // 使用 setTimeout 来延迟执行，确保容器尺寸已经更新
      setTimeout(updateCanvasSize, 100);
    };

    window.addEventListener('resize', handleResize);
    
    // 使用 ResizeObserver 监听容器大小变化（如果支持）
    let resizeObserver;
    if (window.ResizeObserver && containerRef.current) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver && containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [calculateCanvasSize]);

  // 格式化图表数据为表格导出器期望的格式（正确格式：第一列是尺码）
  const formatChartDataForExport = useCallback((chartData) => {
    if (!chartData || chartData.length === 0) return [];
    
    const { headers, rows } = formatSizeDataForTable(chartData);
    
    // 转换为对象数组格式，确保第一列是尺码
    return rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
  }, []);

  // 渲染Canvas预览
  const renderCanvasPreview = useCallback(() => {
    if (!canvasRef.current || !chartData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 使用动态计算的Canvas尺寸
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    try {
      // 将chartData转换为tableExporter期望的格式
      const tableData = formatChartDataForExport(chartData);
      const tipText = mode === 'sweater' ? '温馨提示:由于手工测量会存在1-3cm误差，属于正常范围' : '温馨提示:由于手工测量会存在1-3cm误差，属于正常范围';
      
      // 生成图片数据
      const imageDataUrl = exportSizeTableToImage(tableData, tipText);
      
      // 在Canvas上显示图片
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
        ctx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height);
      };
      img.src = imageDataUrl;
    } catch (error) {
      console.error('渲染预览失败:', error);
      
      // 降级到简单文本渲染
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      
      ctx.fillStyle = '#333333';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('预览生成失败', canvasSize.width / 2, canvasSize.height / 2 - 15);
      ctx.fillText('请检查数据格式', canvasSize.width / 2, canvasSize.height / 2 + 15);
    }
  }, [chartData, mode, canvasSize, formatChartDataForExport]);

  // 当数据或画布尺寸变化时重新渲染预览
  useEffect(() => {
    if (chartData && chartData.length > 0) {
      renderCanvasPreview();
    }
  }, [chartData, mode, canvasSize, renderCanvasPreview]);

  // 当选择变化时清空预览
  useEffect(() => {
    if (selectedCategories.length === 0 && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    }
  }, [selectedCategories, canvasSize]);

  // 监听快捷键导出事件
  useEffect(() => {
    const handleExportShortcut = (event) => {
      console.log('Export shortcut event received:', event.detail);
      const { format, chartData: eventChartData } = event.detail;
      
      // 使用传递的 chartData 或组件的 chartData
      const dataToUse = eventChartData || chartData;
      handleExportImage(format, dataToUse);
    };

    window.addEventListener('export-shortcut', handleExportShortcut);
    return () => window.removeEventListener('export-shortcut', handleExportShortcut);
  }, [chartData, appState.exportPath]);

  // 导出为图片
  const handleExportImage = async (format = 'jpeg', dataToUse = null) => {
    const chartDataToUse = dataToUse || chartData;
    
    if (!chartDataToUse || chartDataToUse.length === 0) {
      alert('请先生成尺码表数据');
      return;
    }

    try {
      const tableData = formatChartDataForExport(chartDataToUse);
      const tipText = mode === 'sweater' ? '温馨提示:由于手工测量会存在1-3cm误差，属于正常范围' : '温馨提示:由于手工测量会存在1-3cm误差，属于正常范围';
      
      const imageDataUrl = exportSizeTableToImage(tableData, tipText);
      
      // 如果设置了导出路径，直接保存；否则弹出下载对话框
      if (appState.exportPath) {
        console.log('使用设置的导出路径:', appState.exportPath);
        await downloadImage(imageDataUrl, appState.exportPath, '尺码表');
      } else {
        console.log('未设置导出路径，使用传统下载方式');
        const filename = `尺码表_${new Date().toISOString().slice(0, 10)}`;
        downloadImage(imageDataUrl, null, filename);
      }
    } catch (error) {
      console.error('导出图片失败:', error);
      alert('导出失败，请重试');
    }
  };

  // 导出为Excel文件
  const handleExportExcel = async () => {
    if (!chartData || chartData.length === 0) {
      alert('请先生成尺码表数据');
      return;
    }

    try {
      if (window.electronAPI && window.electronAPI.exportSizeChart) {
        // 准备导出数据
        const exportData = {
          name: '尺码表',
          items: chartData.flatMap(category => 
            category.values.map(v => ({
              categoryId: category.categoryId,
              categoryName: category.categoryName,
              size: v.size,
              value: v.value,
              unit: 'cm'
            }))
          )
        };

        const result = await window.electronAPI.exportSizeChart(exportData);
        if (result.success) {
          alert('导出成功！');
        } else {
          alert(result.error || '导出失败');
        }
      } else {
        alert('Excel导出功能需要在Electron环境下运行');
      }
    } catch (error) {
      console.error('导出Excel失败:', error);
      alert('导出失败，请重试');
    }
  };

  // 缩放控制
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleZoomReset = () => setZoom(100);

  const hasData = chartData && chartData.length > 0;

  return (
    <PanelContainer>
      <PanelHeader>
        <Title>尺码表预览</Title>
        <Controls>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            paddingRight: '12px',
            borderRight: '1px solid #e5e7eb'
          }}>
            <span style={{ 
              fontSize: '12px', 
              color: '#6b7280',
              fontWeight: '500'
            }}>
              缩放
            </span>
            <ZoomControls>
              <ZoomButton 
                variant="outline" 
                size="small" 
                onClick={handleZoomOut}
                disabled={zoom <= 50}
              >
                -
              </ZoomButton>
              <ZoomLevel>{zoom}%</ZoomLevel>
              <ZoomButton 
                variant="outline" 
                size="small" 
                onClick={handleZoomIn}
                disabled={zoom >= 200}
              >
                +
              </ZoomButton>
              <ZoomButton 
                variant="outline" 
                size="small" 
                onClick={handleZoomReset}
              >
                重置
              </ZoomButton>
            </ZoomControls>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px'
          }}>
            <span style={{ 
              fontSize: '12px', 
              color: '#6b7280',
              fontWeight: '500'
            }}>
              操作
            </span>
            <Button
              variant="outline"
              size="small"
              onClick={() => handleExportImage('jpeg')}
              disabled={!hasData}
              data-export="image"
              style={{ minWidth: '80px' }}
            >
              导出图片
            </Button>
          </div>
        </Controls>
      </PanelHeader>

      <CanvasContainer ref={containerRef}>
        {hasData ? (
          <Canvas
            ref={canvasRef}
            zoom={zoom}
            width={canvasSize.width}
            height={canvasSize.height}
            style={{
              width: `${canvasSize.width}px`,
              height: `${canvasSize.height}px`
            }}
          />
        ) : (
          <EmptyState>
            <EmptyIcon>📊</EmptyIcon>
            <div>请先配置尺码设置并选择类别</div>
            <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
              在左侧选择类别，配置尺码设置，然后点击"应用设置"生成预览
            </div>
          </EmptyState>
        )}
      </CanvasContainer>
    </PanelContainer>
  );
};

export default PreviewPanel;
