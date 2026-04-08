/**
 * Canvas 渲染服务
 * 提供尺码表图像渲染、图表生成、导出等功能
 */

import type { Category, SizeCode, SizeSettings, CategorySizeData, ChartOptions, ChartData } from '../types';

// ============================================
// 类型定义
// ============================================

/** 渲染选项 */
export interface RenderOptions extends ChartOptions {
  fontSize?: number;
  headerFontSize?: number;
}

/** 图表渲染选项 */
export interface Chart2DOptions extends ChartOptions {
  fontSize?: number;
}

// 内部尺码映射
const SIZE_MAP: Record<string, number> = {
  'F': 0, 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, '2XL': 6, '3XL': 7, '4XL': 8, '5XL': 9, '6XL': 10
};

const SIZE_ARRAY = Object.keys(SIZE_MAP);

/**
 * 生成尺码序列（内部使用）
 */
const generateSizeSequence = (startSize: string, count: number): string[] => {
  const startIndex = SIZE_MAP[startSize] ?? 2;
  
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const index = startIndex + i;
    if (index < SIZE_ARRAY.length) {
      result.push(SIZE_ARRAY[index]);
    } else {
      result.push(`Size${index + 1}`);
    }
  }
  
  return result;
};

// ============================================
// 主渲染函数
// ============================================

/**
 * 创建尺码表图像
 * @param sizeData - 尺码数据
 * @param options - 渲染选项
 * @returns 图像的 Data URL
 */
export const renderSizeChart = async (
  sizeData: CategorySizeData[] | null, 
  options: RenderOptions = {}
): Promise<string> => {
  const {
    width = 800,
    height = 600,
    backgroundColor = '#ffffff',
    fontFamily = '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif',
    fontSize = 14,
    headerFontSize = 16,
    title = '尺码表',
    showGrid = true,
    showTitle = true
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 设置背景
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  if (!sizeData || sizeData.length === 0) {
    ctx.fillStyle = '#6B7280';
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText('暂无数据', width / 2, height / 2);
    return canvas.toDataURL();
  }

  // 计算布局
  const padding = 40;
  const titleHeight = showTitle ? 40 : 0;
  const tableTop = padding + titleHeight;
  const tableWidth = width - padding * 2;
  const tableHeight = height - tableTop - padding;

  // 绘制标题
  if (showTitle) {
    ctx.fillStyle = '#111827';
    ctx.font = `bold ${headerFontSize + 4}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText(title, width / 2, padding + 20);
  }

  // 获取表格数据
  const sizes = sizeData[0]?.values?.map(v => v.size) || [];
  const headers = ['部位', ...sizes];
  const rows = sizeData.map(category => [
    category.categoryName,
    ...category.values.map(v => `${v.value}`)
  ]);

  // 计算单元格尺寸
  const cellWidth = tableWidth / headers.length;
  const cellHeight = Math.min(40, tableHeight / (rows.length + 1));

  // 绘制表格
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 1;

  // 绘制表头
  ctx.fillStyle = '#F3F4F6';
  ctx.fillRect(padding, tableTop, tableWidth, cellHeight);

  ctx.fillStyle = '#374151';
  ctx.font = `bold ${headerFontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  headers.forEach((header, index) => {
    const x = padding + index * cellWidth + cellWidth / 2;
    const y = tableTop + cellHeight / 2;
    ctx.fillText(header, x, y);

    if (showGrid) {
      ctx.strokeRect(padding + index * cellWidth, tableTop, cellWidth, cellHeight);
    }
  });

  // 绘制数据行
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = '#374151';

  rows.forEach((row, rowIndex) => {
    const y = tableTop + (rowIndex + 1) * cellHeight;

    if (rowIndex % 2 === 1) {
      ctx.fillStyle = '#F9FAFB';
      ctx.fillRect(padding, y, tableWidth, cellHeight);
      ctx.fillStyle = '#374151';
    }

    row.forEach((cell, cellIndex) => {
      const x = padding + cellIndex * cellWidth + cellWidth / 2;
      const cellY = y + cellHeight / 2;

      if (cellIndex === 0) {
        ctx.textAlign = 'left';
        ctx.fillText(cell, padding + cellIndex * cellWidth + 10, cellY);
      } else {
        ctx.textAlign = 'center';
        ctx.fillText(cell, x, cellY);
      }

      if (showGrid) {
        ctx.strokeRect(padding + cellIndex * cellWidth, y, cellWidth, cellHeight);
      }
    });
  });

  return canvas.toDataURL();
};

/**
 * 创建图形化尺码图表
 * @param sizeData - 尺码数据
 * @param options - 渲染选项
 * @returns 图像的 Data URL
 */
export const renderSizeChart2D = async (
  sizeData: CategorySizeData[] | null,
  options: Chart2DOptions = {}
): Promise<string> => {
  const {
    width = 800,
    height = 600,
    backgroundColor = '#ffffff',
    gridColor = '#E5E7EB',
    textColor = '#374151',
    fontFamily = '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif',
    fontSize = 12,
    title = '尺码趋势图'
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  if (!sizeData || sizeData.length === 0) {
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText('暂无数据', width / 2, height / 2);
    return canvas.toDataURL();
  }

  const padding = 60;
  const titleHeight = 40;
  const chartTop = padding + titleHeight;
  const chartWidth = width - padding * 2;
  const chartHeight = height - chartTop - padding;

  // 绘制标题
  ctx.fillStyle = textColor;
  ctx.font = `bold 18px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, padding + 20);

  // 获取数据范围
  const allValues = sizeData.flatMap(category =>
    category.values.map(v => v.value)
  );
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue || 1;

  // 绘制坐标轴
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(padding, chartTop);
  ctx.lineTo(padding, chartTop + chartHeight);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(padding, chartTop + chartHeight);
  ctx.lineTo(padding + chartWidth, chartTop + chartHeight);
  ctx.stroke();

  // 绘制网格线和刻度
  const sizes = sizeData[0]?.values?.map(v => v.size) || [];
  const stepX = chartWidth / Math.max(sizes.length - 1, 1);

  sizes.forEach((size, index) => {
    const x = padding + index * stepX;

    ctx.strokeStyle = gridColor;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(x, chartTop);
    ctx.lineTo(x, chartTop + chartHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText(size, x, chartTop + chartHeight + 20);
  });

  // 绘制Y轴刻度
  const stepCount = 5;
  for (let i = 0; i <= stepCount; i++) {
    const value = minValue + (valueRange / stepCount) * i;
    const y = chartTop + chartHeight - (i / stepCount) * chartHeight;

    ctx.strokeStyle = gridColor;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(padding + chartWidth, y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'right';
    ctx.fillText(String(Math.round(value)), padding - 10, y + 4);
  }

  // 绘制数据线
  const colors = [
    '#007AFF', '#FF3B30', '#34C759', '#FF9500',
    '#5856D6', '#AF52DE', '#FF2D92', '#A2845E'
  ];

  sizeData.forEach((category, categoryIndex) => {
    const color = colors[categoryIndex % colors.length];
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    category.values.forEach((valueData, index) => {
      const x = padding + index * stepX;
      const y = chartTop + chartHeight -
        ((valueData.value - minValue) / valueRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // 绘制数据点
    category.values.forEach((valueData, index) => {
      const x = padding + index * stepX;
      const y = chartTop + chartHeight -
        ((valueData.value - minValue) / valueRange) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  // 绘制图例
  const legendTop = chartTop + chartHeight + 40;
  const legendItemWidth = 100;
  const legendStartX = (width - sizeData.length * legendItemWidth) / 2;

  sizeData.forEach((category, index) => {
    const color = colors[index % colors.length];
    const x = legendStartX + index * legendItemWidth;

    ctx.fillStyle = color;
    ctx.fillRect(x, legendTop, 12, 12);

    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'left';
    ctx.fillText(category.categoryName, x + 20, legendTop + 9);
  });

  return canvas.toDataURL();
};

/**
 * 下载图像
 * @param dataUrl - 图像的 Data URL
 * @param filename - 文件名
 */
export const downloadImage = (dataUrl: string, filename: string = 'size-chart.png'): void => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 复制图像到剪贴板
 * @param dataUrl - 图像的 Data URL
 * @returns 是否成功
 */
export const copyImageToClipboard = async (dataUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ]);

    return true;
  } catch (error) {
    console.error('复制图像失败:', error);
    return false;
  }
};

/**
 * 生成尺码表数据和样式配置
 */
export const generateSizeChart = async (
  categories: Category[],
  settings: SizeSettings
): Promise<ChartData> => {
  const { startSize, count } = settings;

  const sizes = generateSizeSequence(startSize, count) as SizeCode[];

  const headers: (string | number)[] = ['类别', ...sizes];
  const data: (string | number)[][] = [headers];

  categories.forEach(category => {
    const row: (string | number)[] = [category.name];
    sizes.forEach((size, index) => {
      const value = category.baseValue + (index * category.baseIncrement);
      row.push(value);
    });
    data.push(row);
  });

  return {
    title: '尺码表',
    data,
    categories,
    sizes,
    settings,
    dimensions: {
      width: Math.max(800, data[0].length * 100),
      height: Math.max(400, data.length * 50 + 100)
    },
    createdAt: new Date().toISOString()
  };
};

/**
 * 将画布导出为图片
 */
export const exportToImage = async (
  canvas: HTMLCanvasElement,
  format: string = 'png'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const dataUrl = canvas.toDataURL(`image/${format}`, 1.0);
      resolve(dataUrl);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 导出为 Excel 文件
 */
export const exportToExcel = async (
  chartData: ChartData,
  _categories: Category[],
  _settings: SizeSettings
): Promise<void> => {
  const csvContent = chartData.data.map(row =>
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `尺码表_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

