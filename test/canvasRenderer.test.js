/**
 * canvasRenderer.js 单元测试
 * 测试图表生成、配置验证、渲染逻辑
 * 
 * 注意：这些测试在 jsdom 环境中运行，需要 canvas mock
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
  renderSizeChart,
  renderSizeChart2D,
  downloadImage,
  copyImageToClipboard,
  generateSizeChart,
  exportToImage,
  exportToExcel
} from '../src/services/canvasRenderer.ts';

// Mock canvas context
const mockContext = {
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  font: '',
  textAlign: '',
  textBaseline: '',
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  fillText: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  setLineDash: jest.fn()
};

// Mock canvas element
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: jest.fn(() => mockContext),
  toDataURL: jest.fn(() => 'data:image/png;base64,mockdata')
};

// Mock document.createElement
const originalCreateElement = document.createElement.bind(document);
document.createElement = (tagName) => {
  if (tagName === 'canvas') {
    return mockCanvas;
  }
  return originalCreateElement(tagName);
};

// ============================================
// renderSizeChart 测试
// ============================================
describe('renderSizeChart - 尺码表渲染', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('空数据返回带"暂无数据"的图像', async () => {
    const result = await renderSizeChart([]);
    
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    expect(mockContext.fillText).toHaveBeenCalledWith('暂无数据', expect.any(Number), expect.any(Number));
    expect(result).toBe('data:image/png;base64,mockdata');
  });

  test('null 数据返回带"暂无数据"的图像', async () => {
    const result = await renderSizeChart(null);
    
    expect(mockContext.fillText).toHaveBeenCalledWith('暂无数据', expect.any(Number), expect.any(Number));
  });

  test('使用默认配置渲染', async () => {
    const sizeData = [
      {
        categoryName: '胸围',
        values: [
          { size: 'S', value: 88 },
          { size: 'M', value: 92 }
        ]
      }
    ];
    
    await renderSizeChart(sizeData);
    
    expect(mockCanvas.width).toBe(800);
    expect(mockCanvas.height).toBe(600);
  });

  test('使用自定义配置渲染', async () => {
    const sizeData = [
      {
        categoryName: '胸围',
        values: [{ size: 'S', value: 88 }]
      }
    ];
    
    await renderSizeChart(sizeData, {
      width: 1000,
      height: 800,
      backgroundColor: '#f0f0f0',
      title: '自定义标题'
    });
    
    expect(mockCanvas.width).toBe(1000);
    expect(mockCanvas.height).toBe(800);
  });

  test('showTitle=false 时不绘制标题', async () => {
    const sizeData = [
      { categoryName: '胸围', values: [{ size: 'S', value: 88 }] }
    ];
    
    jest.clearAllMocks();
    await renderSizeChart(sizeData, { showTitle: false });
    
    // 检查 fillText 调用中不包含标题
    const fillTextCalls = mockContext.fillText.mock.calls;
    const titleCall = fillTextCalls.find(call => call[0] === '尺码表');
    expect(titleCall).toBeUndefined();
  });
});

// ============================================
// renderSizeChart2D 测试
// ============================================
describe('renderSizeChart2D - 2D 趋势图渲染', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('空数据返回带"暂无数据"的图像', async () => {
    const result = await renderSizeChart2D([]);
    
    expect(mockContext.fillText).toHaveBeenCalledWith('暂无数据', expect.any(Number), expect.any(Number));
    expect(result).toBe('data:image/png;base64,mockdata');
  });

  test('正确渲染多类别数据', async () => {
    const sizeData = [
      {
        categoryName: '胸围',
        values: [
          { size: 'S', value: 88 },
          { size: 'M', value: 92 },
          { size: 'L', value: 96 }
        ]
      },
      {
        categoryName: '腰围',
        values: [
          { size: 'S', value: 68 },
          { size: 'M', value: 72 },
          { size: 'L', value: 76 }
        ]
      }
    ];
    
    await renderSizeChart2D(sizeData);

    // 验证绑定了坐标轴
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  test('使用自定义颜色配置', async () => {
    const sizeData = [
      { categoryName: '胸围', values: [{ size: 'S', value: 88 }] }
    ];

    await renderSizeChart2D(sizeData, {
      primaryColor: '#FF0000',
      gridColor: '#CCCCCC',
      textColor: '#333333'
    });

    expect(mockCanvas.toDataURL).toHaveBeenCalled();
  });
});

// ============================================
// generateSizeChart 测试
// ============================================
describe('generateSizeChart - 尺码表数据生成', () => {
  test('生成正确的尺码表数据结构', async () => {
    const categories = [
      { name: '胸围', baseValue: 88, baseIncrement: 4 },
      { name: '腰围', baseValue: 68, baseIncrement: 4 }
    ];
    const settings = { startSize: 'S', count: 3 };

    const result = await generateSizeChart(categories, settings);

    expect(result).toHaveProperty('title', '尺码表');
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('categories');
    expect(result).toHaveProperty('sizes');
    expect(result).toHaveProperty('settings');
    expect(result).toHaveProperty('dimensions');
    expect(result).toHaveProperty('createdAt');
  });

  test('数据行数正确（表头 + 类别数）', async () => {
    const categories = [
      { name: '胸围', baseValue: 88, baseIncrement: 4 }
    ];
    const settings = { startSize: 'S', count: 3 };

    const result = await generateSizeChart(categories, settings);

    // 1 行表头 + 1 行类别数据
    expect(result.data).toHaveLength(2);
  });

  test('尺码序列正确生成', async () => {
    const categories = [{ name: '胸围', baseValue: 88, baseIncrement: 4 }];
    const settings = { startSize: 'M', count: 4 };

    const result = await generateSizeChart(categories, settings);

    expect(result.sizes).toContain('M');
    expect(result.sizes).toContain('L');
    expect(result.sizes).toContain('XL');
  });

  test('尺寸值正确计算', async () => {
    const categories = [
      { name: '胸围', baseValue: 100, baseIncrement: 5 }
    ];
    const settings = { startSize: 'S', count: 3 };

    const result = await generateSizeChart(categories, settings);

    // 第一行是表头，第二行是胸围数据
    const chestRow = result.data[1];
    expect(chestRow[0]).toBe('胸围');
    expect(chestRow[1]).toBe(100);      // S: baseValue
    expect(chestRow[2]).toBe(105);      // M: baseValue + increment
    expect(chestRow[3]).toBe(110);      // L: baseValue + 2*increment
  });

  test('dimensions 根据数据量自动计算', async () => {
    const categories = [
      { name: '胸围', baseValue: 88, baseIncrement: 4 },
      { name: '腰围', baseValue: 68, baseIncrement: 4 },
      { name: '臀围', baseValue: 90, baseIncrement: 4 }
    ];
    const settings = { startSize: 'S', count: 5 };

    const result = await generateSizeChart(categories, settings);

    expect(result.dimensions.width).toBeGreaterThanOrEqual(800);
    expect(result.dimensions.height).toBeGreaterThanOrEqual(400);
  });
});

// ============================================
// exportToImage 测试
// ============================================
describe('exportToImage - 图片导出', () => {
  test('导出 PNG 格式', async () => {
    const result = await exportToImage(mockCanvas, 'png');
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png', 1.0);
  });

  test('导出 JPEG 格式', async () => {
    await exportToImage(mockCanvas, 'jpeg');
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 1.0);
  });

  test('默认导出 PNG 格式', async () => {
    await exportToImage(mockCanvas);
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png', 1.0);
  });
});

// ============================================
// downloadImage 测试
// ============================================
describe('downloadImage - 图片下载', () => {
  let mockLink;
  let appendChildSpy;
  let removeChildSpy;

  beforeEach(() => {
    mockLink = {
      download: '',
      href: '',
      click: jest.fn()
    };

    document.createElement = (tagName) => {
      if (tagName === 'a') {
        return mockLink;
      }
      if (tagName === 'canvas') {
        return mockCanvas;
      }
      return originalCreateElement(tagName);
    };

    appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});
  });

  afterEach(() => {
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  test('使用正确的文件名下载', () => {
    downloadImage('data:image/png;base64,test', 'test-chart.png');

    expect(mockLink.download).toBe('test-chart.png');
    expect(mockLink.href).toBe('data:image/png;base64,test');
    expect(mockLink.click).toHaveBeenCalled();
  });

  test('使用默认文件名', () => {
    downloadImage('data:image/png;base64,test');

    expect(mockLink.download).toBe('size-chart.png');
  });
});

