/**
 * sizeCalculator.js 单元测试
 * 测试尺码序列生成、数据计算、边界条件、异常处理
 */

import { describe, test, expect } from '@jest/globals';
import {
  generateSizeSequence,
  calculateSizeData,
  validateSizeSettings,
  formatSizeDataForTable,
  exportToCSV,
  calculateStatistics
} from '../src/services/sizeCalculator.ts';

// ============================================
// generateSizeSequence 测试
// ============================================
describe('generateSizeSequence - 尺码序列生成', () => {
  test('从 S 开始生成 4 个尺码', () => {
    const result = generateSizeSequence('S', 4);
    expect(result).toEqual(['S', 'M', 'L', 'XL']);
  });

  test('从 XS 开始生成 3 个尺码', () => {
    const result = generateSizeSequence('XS', 3);
    expect(result).toEqual(['XS', 'S', 'M']);
  });

  test('从 M 开始生成 5 个尺码', () => {
    const result = generateSizeSequence('M', 5);
    expect(result).toEqual(['M', 'L', 'XL', '2XL', '3XL']);
  });

  test('从 2XL 开始生成尺码（接近边界）', () => {
    const result = generateSizeSequence('2XL', 3);
    expect(result).toEqual(['2XL', '3XL', '4XL']);
  });

  test('请求数量超出可用尺码时，返回剩余所有尺码', () => {
    const result = generateSizeSequence('4XL', 5);
    expect(result).toEqual(['4XL', '5XL', '6XL']);
  });

  test('无效起始尺码抛出错误', () => {
    expect(() => generateSizeSequence('XXXL', 3)).toThrow('无效的起始尺码');
    expect(() => generateSizeSequence('', 3)).toThrow('无效的起始尺码');
    expect(() => generateSizeSequence('invalid', 3)).toThrow('无效的起始尺码');
  });
});

// ============================================
// validateSizeSettings 测试
// ============================================
describe('validateSizeSettings - 尺码设置验证', () => {
  test('有效设置返回 isValid: true', () => {
    const result = validateSizeSettings({ startSize: 'M', count: 5 });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  test('缺少 startSize 返回错误', () => {
    const result = validateSizeSettings({ count: 5 });
    expect(result.isValid).toBe(false);
    expect(result.errors.startSize).toBe('请选择起始尺码');
  });

  test('空字符串 startSize 返回错误', () => {
    const result = validateSizeSettings({ startSize: '', count: 5 });
    expect(result.isValid).toBe(false);
    expect(result.errors.startSize).toBe('请选择起始尺码');
  });

  test('count 为 0 返回错误', () => {
    const result = validateSizeSettings({ startSize: 'M', count: 0 });
    expect(result.isValid).toBe(false);
    expect(result.errors.count).toBe('尺码数量必须大于0');
  });

  test('count 为负数返回错误', () => {
    const result = validateSizeSettings({ startSize: 'M', count: -1 });
    expect(result.isValid).toBe(false);
    expect(result.errors.count).toBe('尺码数量必须大于0');
  });

  test('count 超过 8 返回错误', () => {
    const result = validateSizeSettings({ startSize: 'M', count: 9 });
    expect(result.isValid).toBe(false);
    expect(result.errors.count).toBe('尺码数量不能超过8个');
  });

  test('count 为 8 是有效的（边界值）', () => {
    const result = validateSizeSettings({ startSize: 'XS', count: 8 });
    expect(result.isValid).toBe(true);
  });

  test('多个错误同时返回', () => {
    const result = validateSizeSettings({ startSize: '', count: 0 });
    expect(result.isValid).toBe(false);
    expect(result.errors.startSize).toBeDefined();
    expect(result.errors.count).toBeDefined();
  });
});

// ============================================
// calculateSizeData 测试
// ============================================
describe('calculateSizeData - 尺码数据计算', () => {
  const testCategories = [
    { id: 'chest', name: '胸围', type: 'chest', baseValue: 88, baseIncrement: 4 },
    { id: 'waist', name: '腰围', type: 'waist', baseValue: 68, baseIncrement: 4 }
  ];

  test('正常模式计算尺码数据', () => {
    const result = calculateSizeData({ startSize: 'S', count: 3 }, testCategories);
    
    expect(result).toHaveLength(2);
    expect(result[0].categoryName).toBe('胸围');
    expect(result[0].values).toHaveLength(3);
    expect(result[0].values[0]).toEqual({ size: 'S', value: 88, category: '胸围' });
    expect(result[0].values[1]).toEqual({ size: 'M', value: 92, category: '胸围' });
    expect(result[0].values[2]).toEqual({ size: 'L', value: 96, category: '胸围' });
  });

  test('毛衣模式下递增值≥4的类别减半', () => {
    const result = calculateSizeData({ startSize: 'S', count: 3 }, testCategories, 'sweater');
    
    // 递增值 4cm 在毛衣模式下变为 2cm
    expect(result[0].values[0].value).toBe(88);
    expect(result[0].values[1].value).toBe(90); // 88 + 2
    expect(result[0].values[2].value).toBe(92); // 88 + 4
  });

  test('毛衣模式下递增值<4的类别不变', () => {
    const smallIncrementCategory = [
      { id: 'shoulder', name: '肩宽', type: 'shoulder', baseValue: 38, baseIncrement: 1 }
    ];

    const result = calculateSizeData({ startSize: 'S', count: 3 }, smallIncrementCategory, 'sweater');

    // 递增值 1cm 保持不变
    expect(result[0].values[0].value).toBe(38);
    expect(result[0].values[1].value).toBe(39);
    expect(result[0].values[2].value).toBe(40);
  });

  test('使用自定义起始值覆盖默认值', () => {
    const categories = [
      { id: 'chest', name: '胸围', type: 'chest', baseValue: 88, baseIncrement: 4 }
    ];
    const categoryStartValues = { 'chest': 100 };

    const result = calculateSizeData({ startSize: 'S', count: 3 }, categories, 'normal', categoryStartValues);

    expect(result[0].values[0].value).toBe(100);
    expect(result[0].values[1].value).toBe(104);
    expect(result[0].values[2].value).toBe(108);
  });

  test('自定义起始值为字符串时正确解析', () => {
    const categories = [
      { id: 'chest', name: '胸围', type: 'chest', baseValue: 88, baseIncrement: 4 }
    ];
    const categoryStartValues = { 'chest': '95' };

    const result = calculateSizeData({ startSize: 'S', count: 2 }, categories, 'normal', categoryStartValues);

    expect(result[0].values[0].value).toBe(95);
    expect(result[0].values[1].value).toBe(99);
  });

  test('无效自定义起始值时使用默认值', () => {
    const categories = [
      { id: 'chest', name: '胸围', type: 'chest', baseValue: 88, baseIncrement: 4 }
    ];
    const categoryStartValues = { 'chest': 'invalid' };

    const result = calculateSizeData({ startSize: 'S', count: 2 }, categories, 'normal', categoryStartValues);

    expect(result[0].values[0].value).toBe(88); // 使用默认值
  });

  test('空类别数组返回空数组', () => {
    const result = calculateSizeData({ startSize: 'S', count: 3 }, []);
    expect(result).toEqual([]);
  });
});

// ============================================
// formatSizeDataForTable 测试
// ============================================
describe('formatSizeDataForTable - 表格格式转换', () => {
  test('正确转换尺码数据为表格格式', () => {
    const sizeData = [
      {
        categoryName: '胸围',
        values: [
          { size: 'S', value: 88 },
          { size: 'M', value: 92 }
        ]
      },
      {
        categoryName: '腰围',
        values: [
          { size: 'S', value: 68 },
          { size: 'M', value: 72 }
        ]
      }
    ];

    const result = formatSizeDataForTable(sizeData);

    expect(result.headers).toEqual(['尺码', '胸围', '腰围']);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual(['S', '88', '68']);
    expect(result.rows[1]).toEqual(['M', '92', '72']);
  });

  test('空数据返回空表格', () => {
    const result = formatSizeDataForTable([]);
    expect(result.headers).toEqual([]);
    expect(result.rows).toEqual([]);
  });

  test('null 数据返回空表格', () => {
    const result = formatSizeDataForTable(null);
    expect(result.headers).toEqual([]);
    expect(result.rows).toEqual([]);
  });
});

// ============================================
// exportToCSV 测试
// ============================================
describe('exportToCSV - CSV 导出', () => {
  test('生成正确的 CSV 格式', () => {
    const sizeData = [
      {
        categoryName: '胸围',
        values: [{ size: 'S', value: 88 }, { size: 'M', value: 92 }]
      }
    ];

    const csv = exportToCSV(sizeData, '测试尺码表');

    expect(csv).toContain('测试尺码表');
    expect(csv).toContain('尺码,胸围');
    expect(csv).toContain('S,88');
    expect(csv).toContain('M,92');
  });

  test('默认标题为"尺码表"', () => {
    const sizeData = [
      { categoryName: '胸围', values: [{ size: 'S', value: 88 }] }
    ];

    const csv = exportToCSV(sizeData);
    expect(csv).toContain('尺码表');
  });
});

// ============================================
// calculateStatistics 测试
// ============================================
describe('calculateStatistics - 统计信息计算', () => {
  test('计算正确的统计信息', () => {
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
        categoryName: '肩宽',
        values: [
          { size: 'S', value: 38 },
          { size: 'M', value: 39 },
          { size: 'L', value: 40 }
        ]
      }
    ];

    const stats = calculateStatistics(sizeData);

    expect(stats.totalCategories).toBe(2);
    expect(stats.totalSizes).toBe(3);
    expect(stats.sizeRange).toBe('S - L');
    expect(stats.averageIncrement).toBe(2.5); // (4 + 1) / 2
  });

  test('空数据返回零值统计', () => {
    const stats = calculateStatistics([]);

    expect(stats.totalCategories).toBe(0);
    expect(stats.totalSizes).toBe(0);
    expect(stats.averageIncrement).toBe(0);
    expect(stats.sizeRange).toBe('');
  });

  test('null 数据返回零值统计', () => {
    const stats = calculateStatistics(null);

    expect(stats.totalCategories).toBe(0);
    expect(stats.totalSizes).toBe(0);
  });

  test('单个尺码时平均递增值为 0', () => {
    const sizeData = [
      { categoryName: '胸围', values: [{ size: 'S', value: 88 }] }
    ];

    const stats = calculateStatistics(sizeData);
    expect(stats.averageIncrement).toBe(0);
  });
});

