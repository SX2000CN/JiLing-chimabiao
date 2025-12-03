/**
 * 尺码表导出服务
 * 生成600x600白色背景的尺码表图片
 */

// ============================================
// 类型定义
// ============================================

/** 画布配置 */
interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  padding: number;
  superResolutionScale: number;
  outputScale: number;
}

/** 单元格配置 */
interface CellConfig {
  aspectRatio: number;
  minWidth: number;
  minHeight: number;
  borderWidth: number;
  borderColor: string;
}

/** 样式配置 */
interface StyleConfig {
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontWeight: string;
  textAlign: CanvasTextAlign;
}

/** 样式集合 */
interface Styles {
  header: StyleConfig;
  cell: StyleConfig;
  firstColumn: StyleConfig;
  footer: StyleConfig;
}

/** 表格布局 */
export interface TableLayout {
  cellWidth: number;
  cellHeight: number;
  tableWidth: number;
  tableHeight: number;
  startX: number;
  startY: number;
  rows: number;
  cols: number;
}

/** 尺码表数据行 */
export interface SizeTableRow {
  [key: string]: string | number;
}

// ============================================
// 配置常量
// ============================================

const CANVAS_CONFIG: CanvasConfig = {
  width: 800,
  height: 800,
  backgroundColor: '#FFFFFF',
  padding: 20,
  superResolutionScale: 1,
  outputScale: 1,
};

const CELL_CONFIG: CellConfig = {
  aspectRatio: 10 / 6,
  minWidth: 40,
  minHeight: 24,
  borderWidth: 1,
  borderColor: '#000000',
};

const STYLES: Styles = {
  header: {
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  cell: {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    fontSize: 22,
    fontWeight: '400',
    textAlign: 'center',
  },
  firstColumn: {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#f2f2f2',
    textColor: '#000000',
    fontSize: 20,
    fontWeight: '400',
    textAlign: 'center',
  }
};

// ============================================
// 辅助函数
// ============================================

/**
 * 根据单元格尺寸动态计算字体大小
 */
const calculateDynamicFontSize = (
  cellWidth: number, 
  cellHeight: number, 
  baseFontSize: number, 
  baseWidth: number = 120, 
  baseHeight: number = 72
): number => {
  const widthRatio = cellWidth / baseWidth;
  const heightRatio = cellHeight / baseHeight;
  const avgRatio = (widthRatio + heightRatio) / 2;
  
  const scaledSize = baseFontSize * avgRatio;
  const minSize = baseFontSize < 10 ? 1 : 10;
  return Math.max(minSize, Math.min(scaledSize, baseFontSize * 1.5));
};

/**
 * 获取动态样式配置
 */
const getDynamicStyles = (cellWidth: number, cellHeight: number, cols: number = 5): Styles => {
  const getFooterBaseFontSize = (columnCount: number): number => {
    if (columnCount === 2) return 9;
    if (columnCount === 3) return 13;
    if (columnCount === 4) return 17;
    return 20;
  };
  
  const footerBaseFontSize = getFooterBaseFontSize(cols);
  
  return {
    header: {
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
      fontSize: Math.round(calculateDynamicFontSize(cellWidth, cellHeight, 24)),
      fontWeight: '600',
      textAlign: 'center',
    },
    cell: {
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      fontSize: Math.round(calculateDynamicFontSize(cellWidth, cellHeight, 22)),
      fontWeight: '400',
      textAlign: 'center',
    },
    firstColumn: {
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      fontSize: Math.round(calculateDynamicFontSize(cellWidth, cellHeight, 22)),
      fontWeight: '600',
      textAlign: 'center',
    },
    footer: {
      backgroundColor: '#f2f2f2',
      textColor: '#000000',
      fontSize: Math.round(calculateDynamicFontSize(cellWidth, cellHeight, footerBaseFontSize)),
      fontWeight: '400',
      textAlign: 'center',
    }
  };
};

// ============================================
// 表格布局计算
// ============================================

/**
 * 计算表格尺寸和位置（自适应铺满600×600背景，保持10:6比例）
 */
export const calculateTableLayout = (data: SizeTableRow[] | null): TableLayout | null => {
  if (!data || data.length === 0) return null;

  const rows = data.length + 2;
  const cols = Object.keys(data[0]).length;

  const availableWidth = CANVAS_CONFIG.width - (CANVAS_CONFIG.padding * 2);
  const availableHeight = CANVAS_CONFIG.height - (CANVAS_CONFIG.padding * 2);

  let cellWidth: number, cellHeight: number;

  const widthBasedCellWidth = availableWidth / cols;
  const widthBasedCellHeight = widthBasedCellWidth / CELL_CONFIG.aspectRatio;
  const widthBasedTableHeight = widthBasedCellHeight * rows;

  const heightBasedCellHeight = availableHeight / rows;
  const heightBasedCellWidth = heightBasedCellHeight * CELL_CONFIG.aspectRatio;
  const heightBasedTableWidth = heightBasedCellWidth * cols;

  if (widthBasedTableHeight <= availableHeight && heightBasedTableWidth <= availableWidth) {
    const widthBasedArea = widthBasedCellWidth * cols * widthBasedCellHeight * rows;
    const heightBasedArea = heightBasedCellWidth * cols * heightBasedCellHeight * rows;

    if (widthBasedArea >= heightBasedArea) {
      cellWidth = widthBasedCellWidth;
      cellHeight = widthBasedCellHeight;
    } else {
      cellWidth = heightBasedCellWidth;
      cellHeight = heightBasedCellHeight;
    }
  } else if (widthBasedTableHeight <= availableHeight) {
    cellWidth = widthBasedCellWidth;
    cellHeight = widthBasedCellHeight;
  } else if (heightBasedTableWidth <= availableWidth) {
    cellWidth = heightBasedCellWidth;
    cellHeight = heightBasedCellHeight;
  } else {
    cellWidth = Math.min(widthBasedCellWidth, heightBasedCellWidth);
    cellHeight = cellWidth / CELL_CONFIG.aspectRatio;
  }

  cellWidth = Math.max(cellWidth, CELL_CONFIG.minWidth);
  cellHeight = Math.max(cellHeight, CELL_CONFIG.minHeight);

  const finalTableWidth = cellWidth * cols;
  const finalTableHeight = cellHeight * rows;

  if (finalTableWidth < availableWidth && finalTableHeight < availableHeight) {
    const scaleX = availableWidth / finalTableWidth;
    const scaleY = availableHeight / finalTableHeight;
    const scale = Math.min(scaleX, scaleY) * 0.95;

    if (scale > 1) {
      cellWidth *= scale;
      cellHeight *= scale;
    }
  }

  const tableWidth = cellWidth * cols;
  const tableHeight = cellHeight * rows;

  const startX = (CANVAS_CONFIG.width - tableWidth) / 2;
  const startY = (CANVAS_CONFIG.height - tableHeight) / 2;

  return {
    cellWidth,
    cellHeight,
    tableWidth,
    tableHeight,
    startX,
    startY,
    rows,
    cols
  };
};

// ============================================
// 绘制函数
// ============================================

/**
 * 绘制表格边框
 */
const drawTableBorder = (ctx: CanvasRenderingContext2D, layout: TableLayout): void => {
  const { startX, startY, tableWidth, tableHeight, cellWidth, cellHeight, rows, cols } = layout;

  ctx.strokeStyle = CELL_CONFIG.borderColor;
  ctx.lineWidth = CELL_CONFIG.borderWidth;

  ctx.strokeRect(startX, startY, tableWidth, tableHeight);

  for (let i = 1; i < cols; i++) {
    const x = startX + (cellWidth * i);
    const stopY = startY + ((rows - 1) * cellHeight);
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, stopY);
    ctx.stroke();
  }

  for (let i = 1; i < rows; i++) {
    const y = startY + (cellHeight * i);
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(startX + tableWidth, y);
    ctx.stroke();
  }
};

/**
 * 绘制单元格背景
 */
const drawCellBackground = (
  ctx: CanvasRenderingContext2D,
  layout: TableLayout,
  row: number,
  col: number,
  style: StyleConfig
): void => {
  const { startX, startY, cellWidth, cellHeight } = layout;

  const x = startX + (col * cellWidth);
  const y = startY + (row * cellHeight);

  ctx.fillStyle = style.backgroundColor;
  ctx.fillRect(x, y, cellWidth, cellHeight);
};

/**
 * 绘制单元格文字
 */
const drawCellText = (
  ctx: CanvasRenderingContext2D,
  layout: TableLayout,
  row: number,
  col: number,
  text: string,
  style: StyleConfig
): void => {
  const { startX, startY, cellWidth, cellHeight } = layout;

  const x = startX + (col * cellWidth);
  const y = startY + (row * cellHeight);

  ctx.fillStyle = style.textColor;
  ctx.font = `${style.fontWeight} ${style.fontSize}px 'MiSans', 'Microsoft YaHei', '微软雅黑', sans-serif`;
  ctx.textAlign = style.textAlign;
  ctx.textBaseline = 'middle';

  const textX = x + cellWidth / 2;
  const textY = y + cellHeight / 2;

  ctx.fillText(text, textX, textY);
};

// ============================================
// 导出函数
// ============================================

/**
 * 导出尺码表为图片
 */
export const exportSizeTableToImage = (
  data: SizeTableRow[],
  tipText: string = "温馨提示:由于手工测量会存在1-3cm误差，属于正常范围"
): string | null => {
  const canvas = document.createElement('canvas');
  const scale = CANVAS_CONFIG.superResolutionScale;
  canvas.width = CANVAS_CONFIG.width * scale;
  canvas.height = CANVAS_CONFIG.height * scale;
  const ctx = canvas.getContext('2d')!;

  ctx.scale(scale, scale);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  (ctx as any).textRenderingOptimization = 'optimizeQuality';

  if ((ctx as any).textRenderingOptimization !== undefined) {
    (ctx as any).textRenderingOptimization = 'optimizeQuality';
  }
  if ((ctx as any).textDrawingMode !== undefined) {
    (ctx as any).textDrawingMode = 'glyph';
  }

  ctx.fillStyle = CANVAS_CONFIG.backgroundColor;
  ctx.fillRect(0, 0, CANVAS_CONFIG.width, CANVAS_CONFIG.height);

  const layout = calculateTableLayout(data);
  if (!layout) return null;

  const headers = Object.keys(data[0]);
  const dynamicStyles = getDynamicStyles(layout.cellWidth, layout.cellHeight, headers.length);

  // 绘制所有单元格背景
  headers.forEach((_header, col) => {
    drawCellBackground(ctx, layout, 0, col, dynamicStyles.header);
  });

  data.forEach((row, rowIndex) => {
    headers.forEach((_header, col) => {
      const style = col === 0 ? dynamicStyles.firstColumn : dynamicStyles.cell;
      drawCellBackground(ctx, layout, rowIndex + 1, col, style);
    });
  });

  // 温馨提示行背景
  const { startX, startY, tableWidth, cellHeight, rows } = layout;
  const tipY = startY + ((rows - 1) * cellHeight);
  ctx.fillStyle = dynamicStyles.footer.backgroundColor;
  ctx.fillRect(startX, tipY, tableWidth, cellHeight);

  // 绘制表格边框
  drawTableBorder(ctx, layout);

  // 绘制所有文字内容
  headers.forEach((header, col) => {
    drawCellText(ctx, layout, 0, col, header, dynamicStyles.header);
  });

  data.forEach((row, rowIndex) => {
    headers.forEach((header, col) => {
      const value = row[header];
      const style = col === 0 ? dynamicStyles.firstColumn : dynamicStyles.cell;
      drawCellText(ctx, layout, rowIndex + 1, col, String(value), style);
    });
  });

  // 温馨提示行文字
  ctx.fillStyle = dynamicStyles.footer.textColor;
  ctx.font = `${dynamicStyles.footer.fontWeight} ${dynamicStyles.footer.fontSize}px 'MiSans', 'Microsoft YaHei', '微软雅黑', sans-serif`;
  ctx.textAlign = dynamicStyles.footer.textAlign;
  ctx.textBaseline = 'middle';

  const textX = startX + tableWidth / 2;
  const textY = tipY + cellHeight / 2;
  ctx.fillText(tipText, textX, textY);

  // 超分辨率抗锯齿处理
  if (CANVAS_CONFIG.superResolutionScale > 1 && CANVAS_CONFIG.outputScale === 1) {
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = CANVAS_CONFIG.width;
    outputCanvas.height = CANVAS_CONFIG.height;
    const outputCtx = outputCanvas.getContext('2d')!;

    outputCtx.imageSmoothingEnabled = true;
    outputCtx.imageSmoothingQuality = 'high';

    outputCtx.drawImage(
      canvas,
      0, 0, canvas.width, canvas.height,
      0, 0, outputCanvas.width, outputCanvas.height
    );

    return outputCanvas.toDataURL('image/jpeg', 1.0);
  }

  return canvas.toDataURL('image/jpeg', 1.0);
};

/**
 * 生成不重复的文件名
 */
const generateUniqueFileName = async (
  basePath: string,
  baseName: string,
  extension: string
): Promise<string> => {
  if (!basePath) {
    return `${baseName}.${extension}`;
  }

  // Electron 环境
  if ((window as any).electronAPI && (window as any).electronAPI.fileExists) {
    const pathSeparator = window.navigator.platform.indexOf('Win') !== -1 ? '\\' : '/';

    let fileName = `${baseName}.${extension}`;
    let fullPath = `${basePath}${pathSeparator}${fileName}`;

    const initialCheck = await (window as any).electronAPI.fileExists(fullPath);
    if (!initialCheck.success || !initialCheck.exists) {
      return fullPath;
    }

    let counter = 1;
    while (true) {
      fileName = `${baseName}${counter}.${extension}`;
      fullPath = `${basePath}${pathSeparator}${fileName}`;

      const checkResult = await (window as any).electronAPI.fileExists(fullPath);
      if (!checkResult.success || !checkResult.exists) {
        return fullPath;
      }

      counter++;

      if (counter > 9999) {
        throw new Error('无法生成唯一文件名：文件过多');
      }
    }
  }

  return `${baseName}.${extension}`;
};

/**
 * 下载图片（支持路径保存）
 */
export const downloadImage = async (
  dataUrl: string,
  exportPath: string | null = null,
  filename: string = '尺码表'
): Promise<string | null> => {
  try {
    console.log('downloadImage called with:', {
      exportPath,
      filename,
      hasElectronAPI: !!(window as any).electronAPI,
      hasSaveImageToPath: !!((window as any).electronAPI && (window as any).electronAPI.saveImageToPath)
    });

    if (exportPath && (window as any).electronAPI && (window as any).electronAPI.saveImageToPath) {
      console.log('使用Electron API保存到指定路径:', exportPath);
      const fullPath = await generateUniqueFileName(exportPath, filename, 'jpg');
      console.log('生成的完整路径:', fullPath);

      const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, '');

      const result = await (window as any).electronAPI.saveImageToPath(fullPath, base64Data);
      console.log('保存结果:', result);

      if (result.success) {
        if ((window as any).electronAPI.showNotification) {
          (window as any).electronAPI.showNotification({
            title: '导出成功',
            body: `图片已保存到: ${result.path}`
          });
        }
        console.log('图片保存成功:', result.path);
        return result.path;
      } else {
        throw new Error(result.error || '保存失败');
      }
    } else {
      console.log('条件不满足，使用传统下载方式:', {
        hasExportPath: !!exportPath,
        hasElectronAPI: !!(window as any).electronAPI,
        hasSaveImageToPath: !!((window as any).electronAPI && (window as any).electronAPI.saveImageToPath)
      });
      const link = document.createElement('a');
      link.download = `${filename}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return null;
    }
  } catch (error) {
    console.error('下载图片失败:', error);

    if (exportPath) {
      console.log('回退到传统下载方式');
      const link = document.createElement('a');
      link.download = `${filename}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    throw error;
  }
};

/**
 * 示例数据格式
 */
export const sampleData: SizeTableRow[] = [
  { '尺码': 'S', '胸长': '109', '肩宽': '35', '胸围': '78', '袖长': '11' },
  { '尺码': 'M', '胸长': '110', '肩宽': '36', '胸围': '82', '袖长': '12' },
  { '尺码': 'L', '胸长': '111', '肩宽': '37', '胸围': '86', '袖长': '13' },
  { '尺码': 'XL', '胸长': '112', '肩宽': '38', '胸围': '90', '袖长': '14' }
];

