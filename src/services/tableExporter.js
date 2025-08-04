/**
 * 尺码表导出服务
 * 生成600x600白色背景的尺码表图片
 */

// 画布配置
const CANVAS_CONFIG = {
  width: 800,
  height: 800,
  backgroundColor: '#FFFFFF',
  padding: 20, // 进一步减小边距，最大化表格空间
  superResolutionScale: 1, // 原生分辨率渲染，输出800x800像素
  outputScale: 1, // 输出缩放比例，保持800x800输出
};

// 单元格配置
const CELL_CONFIG = {
  aspectRatio: 10 / 6, // 宽高比 10:6
  minWidth: 40,        // 进一步降低最小宽度要求
  minHeight: 24,       // 进一步降低最小高度要求
  borderWidth: 1,
  borderColor: '#000000', // 改为黑色边框，更符合标准尺码表
};

// 样式配置
const STYLES = {
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

/**
 * 根据单元格尺寸动态计算字体大小
 * @param {number} cellWidth - 单元格宽度
 * @param {number} cellHeight - 单元格高度
 * @param {number} baseFontSize - 基础字体大小
 * @param {number} baseWidth - 基础单元格宽度（用于计算比例）
 * @param {number} baseHeight - 基础单元格高度（用于计算比例）
 * @returns {number} 动态调整后的字体大小
 */
const calculateDynamicFontSize = (cellWidth, cellHeight, baseFontSize, baseWidth = 120, baseHeight = 72) => {
  // 计算宽高比例的平均值
  const widthRatio = cellWidth / baseWidth;
  const heightRatio = cellHeight / baseHeight;
  const avgRatio = (widthRatio + heightRatio) / 2;
  
  // 应用比例缩放，但限制最小和最大值
  const scaledSize = baseFontSize * avgRatio;
  // 对于很小的基础字号（如温馨提示），允许更小的最小值
  const minSize = baseFontSize < 10 ? 1 : 10;
  return Math.max(minSize, Math.min(scaledSize, baseFontSize * 1.5));
};

/**
 * 获取动态样式配置
 * @param {number} cellWidth - 单元格宽度
 * @param {number} cellHeight - 单元格高度
 * @param {number} cols - 列数（用于计算温馨提示字号）
 * @returns {Object} 动态调整后的样式配置
 */
const getDynamicStyles = (cellWidth, cellHeight, cols = 5) => {
  // 根据列数计算温馨提示基础字号
  const getFooterBaseFontSize = (columnCount) => {
    if (columnCount === 2) return 9; // 当类别为1时，表格是2列（尺码列 + 1个类别列）
    if (columnCount === 3) return 13; // 当类别为2时，表格是3列（尺码列 + 2个类别列）
    if (columnCount === 4) return 17; // 当类别为3时，表格是4列（尺码列 + 3个类别列）
    // 可以根据需要添加更多列数的字号设置
    return 20; // 默认字号
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

/**
 * 计算表格尺寸和位置（自适应铺满600×600背景，保持10:6比例）
 * @param {Array} data - 尺码表数据
 * @returns {Object} 表格布局信息
 */
export const calculateTableLayout = (data) => {
  if (!data || data.length === 0) return null;

  const rows = data.length + 2; // 数据行 + 表头 + 温馨提示
  const cols = Object.keys(data[0]).length; // 列数
  
  // 计算可用空间（留出边距）
  const availableWidth = CANVAS_CONFIG.width - (CANVAS_CONFIG.padding * 2);
  const availableHeight = CANVAS_CONFIG.height - (CANVAS_CONFIG.padding * 2);
  
  // 计算单元格尺寸以铺满可用空间
  let cellWidth, cellHeight;
  
  // 按宽度优先计算
  const widthBasedCellWidth = availableWidth / cols;
  const widthBasedCellHeight = widthBasedCellWidth / CELL_CONFIG.aspectRatio;
  const widthBasedTableHeight = widthBasedCellHeight * rows;
  
  // 按高度优先计算
  const heightBasedCellHeight = availableHeight / rows;
  const heightBasedCellWidth = heightBasedCellHeight * CELL_CONFIG.aspectRatio;
  const heightBasedTableWidth = heightBasedCellWidth * cols;
  
  // 优化：选择能最大化利用空间的方案
  if (widthBasedTableHeight <= availableHeight && heightBasedTableWidth <= availableWidth) {
    // 两种方案都可行，选择占用空间更大的方案
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
    // 宽度铺满方案可行
    cellWidth = widthBasedCellWidth;
    cellHeight = widthBasedCellHeight;
  } else if (heightBasedTableWidth <= availableWidth) {
    // 高度铺满方案可行
    cellWidth = heightBasedCellWidth;
    cellHeight = heightBasedCellHeight;
  } else {
    // 都超出了，取较小值但尽量大
    cellWidth = Math.min(widthBasedCellWidth, heightBasedCellWidth);
    cellHeight = cellWidth / CELL_CONFIG.aspectRatio;
  }
  
  // 放宽最小尺寸限制，但确保基本可读性
  cellWidth = Math.max(cellWidth, CELL_CONFIG.minWidth);
  cellHeight = Math.max(cellHeight, CELL_CONFIG.minHeight);
  
  // 如果应用最小尺寸后仍有空间，尝试放大以更好利用空间
  const finalTableWidth = cellWidth * cols;
  const finalTableHeight = cellHeight * rows;
  
  if (finalTableWidth < availableWidth && finalTableHeight < availableHeight) {
    // 还有剩余空间，尝试放大
    const scaleX = availableWidth / finalTableWidth;
    const scaleY = availableHeight / finalTableHeight;
    const scale = Math.min(scaleX, scaleY) * 0.95; // 留5%余量
    
    if (scale > 1) {
      cellWidth *= scale;
      cellHeight *= scale;
    }
  }  // 重新计算表格总尺寸
  const tableWidth = cellWidth * cols;
  const tableHeight = cellHeight * rows;
  
  // 计算居中位置
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

/**
 * 绘制表格边框
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Object} layout 
 */
const drawTableBorder = (ctx, layout) => {
  const { startX, startY, tableWidth, tableHeight, cellWidth, cellHeight, rows, cols } = layout;
  
  ctx.strokeStyle = CELL_CONFIG.borderColor;
  ctx.lineWidth = CELL_CONFIG.borderWidth;
  
  // 绘制外边框
  ctx.strokeRect(startX, startY, tableWidth, tableHeight);
  
  // 绘制垂直线（不延伸到最后一行温馨提示行）
  for (let i = 1; i < cols; i++) {
    const x = startX + (cellWidth * i);
    const stopY = startY + ((rows - 1) * cellHeight); // 停止在倒数第二行的底部
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, stopY);
    ctx.stroke();
  }
  
  // 绘制水平线
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
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Object} layout 
 * @param {number} row 
 * @param {number} col 
 * @param {Object} style 
 */
const drawCellBackground = (ctx, layout, row, col, style) => {
  const { startX, startY, cellWidth, cellHeight } = layout;
  
  const x = startX + (col * cellWidth);
  const y = startY + (row * cellHeight);
  
  // 绘制背景
  ctx.fillStyle = style.backgroundColor;
  ctx.fillRect(x, y, cellWidth, cellHeight);
};

/**
 * 绘制单元格文字
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Object} layout 
 * @param {number} row 
 * @param {number} col 
 * @param {string} text 
 * @param {Object} style 
 */
const drawCellText = (ctx, layout, row, col, text, style) => {
  const { startX, startY, cellWidth, cellHeight } = layout;
  
  const x = startX + (col * cellWidth);
  const y = startY + (row * cellHeight);
  
  // 绘制文字
  ctx.fillStyle = style.textColor;
  ctx.font = `${style.fontWeight} ${style.fontSize}px 'MiSans', 'Microsoft YaHei', '微软雅黑', sans-serif`;
  ctx.textAlign = style.textAlign;
  ctx.textBaseline = 'middle';
  
  const textX = x + cellWidth / 2;
  const textY = y + cellHeight / 2;
  
  ctx.fillText(text, textX, textY);
};

/**
 * 绘制单元格（保持向后兼容，但建议分别调用背景和文字方法）
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Object} layout 
 * @param {number} row 
 * @param {number} col 
 * @param {string} text 
 * @param {Object} style 
 */
const drawCell = (ctx, layout, row, col, text, style) => {
  drawCellBackground(ctx, layout, row, col, style);
  drawCellText(ctx, layout, row, col, text, style);
};

/**
 * 绘制温馨提示行背景（合并整行）
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Object} layout 
 */
const drawTipRowBackground = (ctx, layout) => {
  const { startX, startY, tableWidth, cellHeight, rows } = layout;
  
  const y = startY + ((rows - 1) * cellHeight); // 最后一行
  
  // 绘制背景
  ctx.fillStyle = STYLES.footer.backgroundColor;
  ctx.fillRect(startX, y, tableWidth, cellHeight);
};

/**
 * 绘制温馨提示行文字（合并整行）
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Object} layout 
 * @param {string} tipText 
 */
const drawTipRowText = (ctx, layout, tipText) => {
  const { startX, startY, tableWidth, cellHeight, rows } = layout;
  
  const y = startY + ((rows - 1) * cellHeight); // 最后一行
  
  // 绘制文字
  ctx.fillStyle = STYLES.footer.textColor;
  ctx.font = `${STYLES.footer.fontWeight} ${STYLES.footer.fontSize}px 'MiSans', 'Microsoft YaHei', '微软雅黑', sans-serif`;
  ctx.textAlign = STYLES.footer.textAlign;
  ctx.textBaseline = 'middle';
  
  const textX = startX + tableWidth / 2;
  const textY = y + cellHeight / 2;
  
  ctx.fillText(tipText, textX, textY);
};

/**
 * 绘制温馨提示行（保持向后兼容）
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Object} layout 
 * @param {string} tipText 
 */
const drawTipRow = (ctx, layout, tipText) => {
  drawTipRowBackground(ctx, layout);
  drawTipRowText(ctx, layout, tipText);
};

/**
 * 导出尺码表为图片
 * @param {Array} data - 尺码表数据
 * @param {string} tipText - 温馨提示文字
 * @returns {string} 图片的 base64 数据
 */
export const exportSizeTableToImage = (data, tipText = "温馨提示:由于手工测量会存在1-3cm误差，属于正常范围") => {
  // 创建高分辨率画布
  const canvas = document.createElement('canvas');
  const scale = CANVAS_CONFIG.superResolutionScale;
  canvas.width = CANVAS_CONFIG.width * scale;
  canvas.height = CANVAS_CONFIG.height * scale;
  const ctx = canvas.getContext('2d');
  
  // 设置高DPI渲染
  ctx.scale(scale, scale);
  
  // 启用最高质量渲染设置
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.textRenderingOptimization = 'optimizeQuality';
  
  // 额外的高质量渲染设置
  if (ctx.textRenderingOptimization !== undefined) {
    ctx.textRenderingOptimization = 'optimizeQuality';
  }
  if (ctx.textDrawingMode !== undefined) {
    ctx.textDrawingMode = 'glyph';
  }
  
  // 绘制白色背景
  ctx.fillStyle = CANVAS_CONFIG.backgroundColor;
  ctx.fillRect(0, 0, CANVAS_CONFIG.width, CANVAS_CONFIG.height);
  
  // 计算布局
  const layout = calculateTableLayout(data);
  if (!layout) return null;
  
  // 获取动态样式配置，传递列数参数
  const headers = Object.keys(data[0]);
  const dynamicStyles = getDynamicStyles(layout.cellWidth, layout.cellHeight, headers.length);
  
  // 第一步：绘制所有单元格背景
  // 表头背景
  headers.forEach((header, col) => {
    drawCellBackground(ctx, layout, 0, col, dynamicStyles.header);
  });
  
  // 数据行背景
  data.forEach((row, rowIndex) => {
    headers.forEach((header, col) => {
      // 第一列和其他列都使用白色背景，只是字体大小不同
      const style = col === 0 ? dynamicStyles.firstColumn : dynamicStyles.cell;
      drawCellBackground(ctx, layout, rowIndex + 1, col, style);
    });
  });
  
  // 温馨提示行背景
  const drawTipRowBackgroundDynamic = (ctx, layout, style) => {
    const { startX, startY, tableWidth, cellHeight, rows } = layout;
    const y = startY + ((rows - 1) * cellHeight);
    ctx.fillStyle = style.backgroundColor;
    ctx.fillRect(startX, y, tableWidth, cellHeight);
  };
  drawTipRowBackgroundDynamic(ctx, layout, dynamicStyles.footer);
  
  // 第二步：绘制表格边框（这样边框就不会被背景覆盖）
  drawTableBorder(ctx, layout);
  
  // 第三步：绘制所有文字内容
  // 表头文字
  headers.forEach((header, col) => {
    drawCellText(ctx, layout, 0, col, header, dynamicStyles.header);
  });
  
  // 数据行文字
  data.forEach((row, rowIndex) => {
    headers.forEach((header, col) => {
      const value = row[header];
      // 第一列（除了第一行）使用动态字体
      const style = col === 0 ? dynamicStyles.firstColumn : dynamicStyles.cell;
      drawCellText(ctx, layout, rowIndex + 1, col, String(value), style);
    });
  });
  
  // 温馨提示行文字
  const drawTipRowTextDynamic = (ctx, layout, tipText, style) => {
    const { startX, startY, tableWidth, cellHeight, rows } = layout;
    const y = startY + ((rows - 1) * cellHeight);
    
    ctx.fillStyle = style.textColor;
    ctx.font = `${style.fontWeight} ${style.fontSize}px 'MiSans', 'Microsoft YaHei', '微软雅黑', sans-serif`;
    ctx.textAlign = style.textAlign;
    ctx.textBaseline = 'middle';
    
    const textX = startX + tableWidth / 2;
    const textY = y + cellHeight / 2;
    
    ctx.fillText(tipText, textX, textY);
  };
  drawTipRowTextDynamic(ctx, layout, tipText, dynamicStyles.footer);
  
  // 超分辨率抗锯齿处理
  if (CANVAS_CONFIG.superResolutionScale > 1 && CANVAS_CONFIG.outputScale === 1) {
    // 创建最终输出的Canvas（800x800）
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = CANVAS_CONFIG.width;  // 800
    outputCanvas.height = CANVAS_CONFIG.height; // 800
    const outputCtx = outputCanvas.getContext('2d');
    
    // 关键：启用最高质量的抗锯齿设置
    outputCtx.imageSmoothingEnabled = true;
    outputCtx.imageSmoothingQuality = 'high';
    
    // 使用高质量双线性插值缩放
    // 从4000x4000缩放到800x800（5:1比例）
    outputCtx.drawImage(
      canvas, 
      0, 0, canvas.width, canvas.height,    // 源：4000x4000
      0, 0, outputCanvas.width, outputCanvas.height  // 目标：800x800
    );
    
    // 返回抗锯齿后的800x800图片
    return outputCanvas.toDataURL('image/jpeg', 1.0);
  }
  
  // 如果是其他缩放情况或原生分辨率，直接返回
  return canvas.toDataURL('image/jpeg', 1.0);
};

/**
 * 生成不重复的文件名
 * @param {string} basePath - 基础路径
 * @param {string} baseName - 基础文件名（不含扩展名）
 * @param {string} extension - 文件扩展名
 * @returns {string} 完整的文件路径
 */
const generateUniqueFileName = async (basePath, baseName, extension) => {
  if (!basePath) {
    return `${baseName}.${extension}`;
  }

  // 如果是 Electron 环境，使用 fs 检查文件是否存在
  if (window.electronAPI && window.electronAPI.fileExists) {
    // 使用正确的路径分隔符
    const pathSeparator = window.navigator.platform.indexOf('Win') !== -1 ? '\\' : '/';
    
    // 首先检查基础文件名
    let fileName = `${baseName}.${extension}`;
    let fullPath = `${basePath}${pathSeparator}${fileName}`;
    
    const initialCheck = await window.electronAPI.fileExists(fullPath);
    if (!initialCheck.success || !initialCheck.exists) {
      return fullPath;
    }
    
    // 如果基础文件名已存在，开始递增
    let counter = 1;
    while (true) {
      fileName = `${baseName}${counter}.${extension}`;
      fullPath = `${basePath}${pathSeparator}${fileName}`;
      
      const checkResult = await window.electronAPI.fileExists(fullPath);
      if (!checkResult.success || !checkResult.exists) {
        return fullPath;
      }
      
      counter++;
      
      // 安全限制，避免无限循环
      if (counter > 9999) {
        throw new Error('无法生成唯一文件名：文件过多');
      }
    }
  }

  // 浏览器环境，返回基础文件名
  return `${baseName}.${extension}`;
};

/**
 * 下载图片（支持路径保存）
 * @param {string} dataUrl - 图片的 base64 数据
 * @param {string} exportPath - 导出路径（可选）
 * @param {string} filename - 文件名（可选，默认为'尺码表'）
 */
export const downloadImage = async (dataUrl, exportPath = null, filename = '尺码表') => {
  try {
    console.log('downloadImage called with:', { exportPath, filename, hasElectronAPI: !!window.electronAPI, hasSaveImageToPath: !!(window.electronAPI && window.electronAPI.saveImageToPath) });
    
    if (exportPath && window.electronAPI && window.electronAPI.saveImageToPath) {
      console.log('使用Electron API保存到指定路径:', exportPath);
      // 使用 Electron API 直接保存到指定路径
      const fullPath = await generateUniqueFileName(exportPath, filename, 'jpg');
      console.log('生成的完整路径:', fullPath);
      
      // 将 base64 数据转换为 Buffer
      const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
      
      const result = await window.electronAPI.saveImageToPath(fullPath, base64Data);
      console.log('保存结果:', result);
      
      if (result.success) {
        // 显示保存成功提示
        if (window.electronAPI.showNotification) {
          window.electronAPI.showNotification({
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
        hasElectronAPI: !!window.electronAPI, 
        hasSaveImageToPath: !!(window.electronAPI && window.electronAPI.saveImageToPath) 
      });
      // 使用传统的下载方式
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
    
    // 如果路径保存失败，回退到传统下载方式
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
 * 示例数据格式（正确格式：第一列是尺码，其他列是各个测量类别）
 */
export const sampleData = [
  { '尺码': 'S', '胸长': '109', '肩宽': '35', '胸围': '78', '袖长': '11' },
  { '尺码': 'M', '胸长': '110', '肩宽': '36', '胸围': '82', '袖长': '12' },
  { '尺码': 'L', '胸长': '111', '肩宽': '37', '胸围': '86', '袖长': '13' },
  { '尺码': 'XL', '胸长': '112', '肩宽': '38', '胸围': '90', '袖长': '14' }
];
