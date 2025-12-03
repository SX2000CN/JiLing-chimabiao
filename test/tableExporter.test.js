/**
 * tableExporter.js 单元测试
 * 测试表格布局计算、导出功能、格式转换
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
  calculateTableLayout,
  exportSizeTableToImage,
  downloadImage,
  sampleData
} from '../src/services/tableExporter.ts';

// Mock canvas context
const mockContext = {
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  font: '',
  textAlign: '',
  textBaseline: '',
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'high',
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  fillText: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  scale: jest.fn(),
  drawImage: jest.fn()
};

// Mock canvas element
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: jest.fn(() => mockContext),
  toDataURL: jest.fn(() => 'data:image/jpeg;base64,mockdata')
};

// Mock document.createElement
const originalCreateElement = document.createElement.bind(document);
document.createElement = (tagName) => {
  if (tagName === 'canvas') {
    return { ...mockCanvas };
  }
  return originalCreateElement(tagName);
};

// ============================================
// calculateTableLayout 测试
// ============================================
describe('calculateTableLayout - 表格布局计算', () => {
  test('正确计算表格布局', () => {
    const data = [
      { '尺码': 'S', '胸围': '88' },
      { '尺码': 'M', '胸围': '92' },
      { '尺码': 'L', '胸围': '96' }
    ];
    
    const layout = calculateTableLayout(data);
    
    expect(layout).not.toBeNull();
    expect(layout).toHaveProperty('cellWidth');
    expect(layout).toHaveProperty('cellHeight');
    expect(layout).toHaveProperty('tableWidth');
    expect(layout).toHaveProperty('tableHeight');
    expect(layout).toHaveProperty('startX');
    expect(layout).toHaveProperty('startY');
    expect(layout).toHaveProperty('rows');
    expect(layout).toHaveProperty('cols');
  });

  test('行数 = 数据行 + 表头 + 温馨提示', () => {
    const data = [
      { '尺码': 'S', '胸围': '88' },
      { '尺码': 'M', '胸围': '92' }
    ];
    
    const layout = calculateTableLayout(data);
    
    // 2 数据行 + 1 表头 + 1 温馨提示 = 4 行
    expect(layout.rows).toBe(4);
  });

  test('列数等于数据对象的键数', () => {
    const data = [
      { '尺码': 'S', '胸围': '88', '腰围': '68', '臀围': '90' }
    ];
    
    const layout = calculateTableLayout(data);
    
    expect(layout.cols).toBe(4);
  });

  test('空数据返回 null', () => {
    const layout = calculateTableLayout([]);
    expect(layout).toBeNull();
  });

  test('null 数据返回 null', () => {
    const layout = calculateTableLayout(null);
    expect(layout).toBeNull();
  });

  test('单元格保持 10:6 宽高比', () => {
    const data = [
      { '尺码': 'S', '胸围': '88' }
    ];
    
    const layout = calculateTableLayout(data);
    const ratio = layout.cellWidth / layout.cellHeight;
    
    // 允许一定误差
    expect(ratio).toBeCloseTo(10 / 6, 1);
  });

  test('表格居中显示', () => {
    const data = [
      { '尺码': 'S', '胸围': '88' }
    ];
    
    const layout = calculateTableLayout(data);
    
    // 验证 startX 和 startY 使表格居中
    const expectedStartX = (800 - layout.tableWidth) / 2;
    const expectedStartY = (800 - layout.tableHeight) / 2;
    
    expect(layout.startX).toBeCloseTo(expectedStartX, 0);
    expect(layout.startY).toBeCloseTo(expectedStartY, 0);
  });
});

// ============================================
// sampleData 测试
// ============================================
describe('sampleData - 示例数据', () => {
  test('示例数据格式正确', () => {
    expect(Array.isArray(sampleData)).toBe(true);
    expect(sampleData.length).toBeGreaterThan(0);
  });

  test('每行数据包含尺码列', () => {
    sampleData.forEach(row => {
      expect(row).toHaveProperty('尺码');
    });
  });

  test('示例数据包含多个尺码', () => {
    const sizes = sampleData.map(row => row['尺码']);
    expect(sizes).toContain('S');
    expect(sizes).toContain('M');
    expect(sizes).toContain('L');
    expect(sizes).toContain('XL');
  });
});

// ============================================
// exportSizeTableToImage 测试
// ============================================
describe('exportSizeTableToImage - 导出尺码表图片', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('返回 JPEG 格式的 base64 数据', () => {
    const data = [
      { '尺码': 'S', '胸围': '88' },
      { '尺码': 'M', '胸围': '92' }
    ];

    const result = exportSizeTableToImage(data);

    expect(result).toBe('data:image/jpeg;base64,mockdata');
  });

  test('空数据返回 null', () => {
    const result = exportSizeTableToImage([]);
    expect(result).toBeNull();
  });

  test('使用默认温馨提示文字', () => {
    const data = [{ '尺码': 'S', '胸围': '88' }];

    exportSizeTableToImage(data);

    // 验证 fillText 被调用并包含温馨提示
    expect(mockContext.fillText).toHaveBeenCalled();
  });

  test('使用自定义温馨提示文字', () => {
    const data = [{ '尺码': 'S', '胸围': '88' }];
    const customTip = '自定义提示信息';

    exportSizeTableToImage(data, customTip);

    expect(mockContext.fillText).toHaveBeenCalled();
  });

  test('多列数据正确渲染', () => {
    const data = [
      { '尺码': 'S', '胸围': '88', '腰围': '68', '臀围': '90' },
      { '尺码': 'M', '胸围': '92', '腰围': '72', '臀围': '94' }
    ];

    const result = exportSizeTableToImage(data);

    expect(result).not.toBeNull();
    expect(mockContext.fillRect).toHaveBeenCalled();
    expect(mockContext.fillText).toHaveBeenCalled();
  });
});

// ============================================
// downloadImage 测试（tableExporter 版本）
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
        return { ...mockCanvas };
      }
      return originalCreateElement(tagName);
    };

    appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});

    // Mock window.electronAPI 为 undefined（浏览器环境）
    delete window.electronAPI;
  });

  afterEach(() => {
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  test('浏览器环境下使用传统下载方式', async () => {
    await downloadImage('data:image/jpeg;base64,test', null, '测试文件');

    expect(mockLink.download).toBe('测试文件.jpg');
    expect(mockLink.href).toBe('data:image/jpeg;base64,test');
    expect(mockLink.click).toHaveBeenCalled();
  });

  test('默认文件名为"尺码表"', async () => {
    await downloadImage('data:image/jpeg;base64,test');

    expect(mockLink.download).toBe('尺码表.jpg');
  });
});

// ============================================
// 布局边界条件测试
// ============================================
describe('布局边界条件', () => {
  test('大量列数时布局仍然有效', () => {
    const data = [
      {
        '尺码': 'S',
        '胸围': '88',
        '腰围': '68',
        '臀围': '90',
        '肩宽': '38',
        '袖长': '58',
        '衣长': '65',
        '下摆': '92'
      }
    ];

    const layout = calculateTableLayout(data);

    expect(layout).not.toBeNull();
    expect(layout.cellWidth).toBeGreaterThan(0);
    expect(layout.cellHeight).toBeGreaterThan(0);
  });

  test('大量行数时布局仍然有效', () => {
    const data = [];
    for (let i = 0; i < 10; i++) {
      data.push({ '尺码': `Size${i}`, '胸围': `${88 + i * 4}` });
    }

    const layout = calculateTableLayout(data);

    expect(layout).not.toBeNull();
    expect(layout.rows).toBe(12); // 10 数据行 + 1 表头 + 1 温馨提示
  });

  test('单行单列数据布局有效', () => {
    const data = [{ '尺码': 'S' }];

    const layout = calculateTableLayout(data);

    expect(layout).not.toBeNull();
    expect(layout.cols).toBe(1);
    expect(layout.rows).toBe(3); // 1 数据行 + 1 表头 + 1 温馨提示
  });
});

