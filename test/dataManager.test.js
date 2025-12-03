/**
 * dataManager.js 单元测试
 * 测试类别验证、创建、预设数据、CRUD 操作
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  presetCategories,
  createCategory,
  validateCategory,
  updateCategory,
  deleteCategory,
  searchCategories,
  groupCategoriesByType,
  importCategories,
  exportCategories
} from '../src/services/dataManager.ts';

// ============================================
// presetCategories 测试
// ============================================
describe('presetCategories - 预设类别', () => {
  test('应有 12 个预设类别', () => {
    expect(presetCategories).toHaveLength(12);
  });

  test('每个预设类别都有必要属性', () => {
    presetCategories.forEach(category => {
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('type');
      expect(category).toHaveProperty('baseValue');
      expect(category).toHaveProperty('baseIncrement');
      expect(category).toHaveProperty('isCustom');
      expect(category.isCustom).toBe(false);
    });
  });

  test('预设类别包含胸围、腰围、臀围', () => {
    const names = presetCategories.map(c => c.name);
    expect(names).toContain('胸围');
    expect(names).toContain('腰围');
    expect(names).toContain('臀围');
  });

  test('胸围类别的默认值正确', () => {
    const chest = presetCategories.find(c => c.name === '胸围');
    expect(chest.baseValue).toBe(88);
    expect(chest.baseIncrement).toBe(4);
  });

  test('肩宽类别的默认值正确', () => {
    const shoulder = presetCategories.find(c => c.name === '肩宽');
    expect(shoulder.baseValue).toBe(38);
    expect(shoulder.baseIncrement).toBe(1);
  });
});

// ============================================
// validateCategory 测试
// ============================================
describe('validateCategory - 类别验证', () => {
  test('有效类别数据返回 isValid: true', () => {
    const result = validateCategory({
      name: '胸围',
      type: 'chest',
      baseValue: '88',
      baseIncrement: '4'
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  test('空名称返回错误', () => {
    const result = validateCategory({
      name: '',
      baseValue: '88',
      baseIncrement: '4'
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe('类别名称不能为空');
  });

  test('名称超过 20 字符返回错误', () => {
    const result = validateCategory({
      name: '这是一个非常非常非常非常非常非常非常非常非常长的类别名称',
      baseValue: '88',
      baseIncrement: '4'
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe('类别名称不能超过20个字符');
  });

  test('空基础值返回错误', () => {
    const result = validateCategory({
      name: '胸围',
      baseValue: '',
      baseIncrement: '4'
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.baseValue).toBe('基础数值不能为空');
  });

  test('负数基础值返回错误', () => {
    const result = validateCategory({
      name: '胸围',
      baseValue: '-10',
      baseIncrement: '4'
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.baseValue).toBe('基础数值必须是大于0的数字');
  });

  test('非数字基础值返回错误', () => {
    const result = validateCategory({
      name: '胸围',
      baseValue: 'abc',
      baseIncrement: '4'
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.baseValue).toBe('基础数值必须是大于0的数字');
  });

  test('空递增值返回错误', () => {
    const result = validateCategory({
      name: '胸围',
      baseValue: '88',
      baseIncrement: ''
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.baseIncrement).toBe('递增数值不能为空');
  });

  test('0 递增值返回错误', () => {
    const result = validateCategory({
      name: '胸围',
      baseValue: '88',
      baseIncrement: '0'
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.baseIncrement).toBe('递增数值必须是大于0的数字');
  });

  test('多个错误同时返回', () => {
    const result = validateCategory({
      name: '',
      baseValue: '',
      baseIncrement: ''
    });
    expect(result.isValid).toBe(false);
    expect(Object.keys(result.errors).length).toBe(3);
  });
});

// ============================================
// createCategory 测试
// ============================================
describe('createCategory - 创建类别', () => {
  test('成功创建新类别', () => {
    const category = createCategory({
      name: '测试类别',
      type: 'test',
      baseValue: '100',
      baseIncrement: '2',
      description: '测试描述'
    });

    expect(category.id).toMatch(/^custom_\d+_/);
    expect(category.name).toBe('测试类别');
    expect(category.type).toBe('test');
    expect(category.baseValue).toBe(100);
    expect(category.baseIncrement).toBe(2);
    expect(category.isCustom).toBe(true);
    expect(category.description).toBe('测试描述');
    expect(category.createdAt).toBeDefined();
  });

  test('字符串数值被正确转换为数字', () => {
    const category = createCategory({
      name: '测试',
      type: 'test',
      baseValue: '50.5',
      baseIncrement: '1.5'
    });

    expect(typeof category.baseValue).toBe('number');
    expect(typeof category.baseIncrement).toBe('number');
    expect(category.baseValue).toBe(50.5);
    expect(category.baseIncrement).toBe(1.5);
  });

  test('type 是必需的参数', () => {
    expect(() => createCategory({
      name: '测试',
      baseValue: '50',
      baseIncrement: '1'
    })).toThrow('缺少必要的类别信息');
  });
});

// ============================================
// updateCategory 测试
// ============================================
describe('updateCategory - 更新类别', () => {
  const testCategories = [
    { id: 'cat1', name: '类别1', baseValue: 100, baseIncrement: 2 },
    { id: 'cat2', name: '类别2', baseValue: 200, baseIncrement: 4 }
  ];

  test('成功更新类别属性', () => {
    const updated = updateCategory(testCategories, 'cat1', { name: '新名称' });

    expect(updated.find(c => c.id === 'cat1').name).toBe('新名称');
    expect(updated.find(c => c.id === 'cat2').name).toBe('类别2'); // 其他类别不变
  });

  test('更新多个属性', () => {
    const updated = updateCategory(testCategories, 'cat1', {
      name: '新名称',
      baseValue: 150,
      baseIncrement: 3
    });

    const cat1 = updated.find(c => c.id === 'cat1');
    expect(cat1.name).toBe('新名称');
    expect(cat1.baseValue).toBe(150);
    expect(cat1.baseIncrement).toBe(3);
  });

  test('更新不存在的类别返回原数组', () => {
    const updated = updateCategory(testCategories, 'nonexistent', { name: '新名称' });
    expect(updated).toEqual(testCategories);
  });

  test('不修改原数组（不可变性）', () => {
    const original = [...testCategories];
    updateCategory(testCategories, 'cat1', { name: '新名称' });
    expect(testCategories).toEqual(original);
  });
});

// ============================================
// deleteCategory 测试
// ============================================
describe('deleteCategory - 删除类别', () => {
  const testCategories = [
    { id: 'cat1', name: '类别1' },
    { id: 'cat2', name: '类别2' },
    { id: 'cat3', name: '类别3' }
  ];

  test('成功删除类别', () => {
    const result = deleteCategory(testCategories, 'cat2');

    expect(result).toHaveLength(2);
    expect(result.find(c => c.id === 'cat2')).toBeUndefined();
    expect(result.find(c => c.id === 'cat1')).toBeDefined();
    expect(result.find(c => c.id === 'cat3')).toBeDefined();
  });

  test('删除不存在的类别返回原数组', () => {
    const result = deleteCategory(testCategories, 'nonexistent');
    expect(result).toHaveLength(3);
  });

  test('不修改原数组（不可变性）', () => {
    const original = [...testCategories];
    deleteCategory(testCategories, 'cat1');
    expect(testCategories).toEqual(original);
  });
});

// ============================================
// searchCategories 测试
// ============================================
describe('searchCategories - 搜索类别', () => {
  const testCategories = [
    { id: '1', name: '胸围', type: 'chest' },
    { id: '2', name: '腰围', type: 'waist' },
    { id: '3', name: '臀围', type: 'hip' },
    { id: '4', name: '肩宽', type: 'shoulder' }
  ];

  test('按名称搜索', () => {
    const result = searchCategories(testCategories, '围');
    expect(result).toHaveLength(3);
  });

  test('按类型搜索', () => {
    const result = searchCategories(testCategories, 'chest');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('胸围');
  });

  test('空查询返回所有类别', () => {
    const result = searchCategories(testCategories, '');
    expect(result).toHaveLength(4);
  });

  test('无匹配返回空数组', () => {
    const result = searchCategories(testCategories, '不存在');
    expect(result).toHaveLength(0);
  });

  test('搜索不区分大小写', () => {
    const result = searchCategories(testCategories, 'CHEST');
    expect(result).toHaveLength(1);
  });
});

// ============================================
// groupCategoriesByType 测试
// ============================================
describe('groupCategoriesByType - 按类型分组', () => {
  const testCategories = [
    { id: '1', name: '胸围', type: 'chest' },
    { id: '2', name: '腰围', type: 'waist' },
    { id: '3', name: '胸长', type: 'chest' },
    { id: '4', name: '自定义', type: 'custom' }
  ];

  test('正确分组类别', () => {
    const groups = groupCategoriesByType(testCategories);

    expect(groups.chest).toHaveLength(2);
    expect(groups.waist).toHaveLength(1);
    expect(groups.custom).toHaveLength(1);
  });

  test('空数组返回空对象', () => {
    const groups = groupCategoriesByType([]);
    expect(groups).toEqual({});
  });
});

// ============================================
// importCategories / exportCategories 测试
// ============================================
describe('importCategories / exportCategories - 导入导出', () => {
  const testCategories = [
    { id: '1', name: '胸围', type: 'chest', baseValue: 88, baseIncrement: 4, description: '胸部围度' },
    { id: '2', name: '腰围', type: 'waist', baseValue: 68, baseIncrement: 4, description: '腰部围度' }
  ];

  test('导出生成有效 JSON', () => {
    const json = exportCategories(testCategories);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  test('导出包含所有类别数据', () => {
    const json = exportCategories(testCategories);
    const parsed = JSON.parse(json);
    // exportCategories 返回的是数组格式
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].name).toBe('胸围');
    expect(parsed[1].name).toBe('腰围');
  });

  test('导出的数据包含必要字段', () => {
    const json = exportCategories(testCategories);
    const parsed = JSON.parse(json);
    expect(parsed[0]).toHaveProperty('name');
    expect(parsed[0]).toHaveProperty('type');
    expect(parsed[0]).toHaveProperty('baseValue');
    expect(parsed[0]).toHaveProperty('baseIncrement');
  });

  test('导入有效 JSON 数组成功', () => {
    // importCategories 期望的是数组格式的 JSON
    const validData = JSON.stringify([
      { name: '胸围', type: 'chest', baseValue: 88, baseIncrement: 4 }
    ]);
    const result = importCategories(validData);

    // importCategories 返回的是类别数组
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('胸围');
    expect(result[0].isCustom).toBe(true); // 导入的类别被标记为自定义
  });

  test('导入无效 JSON 抛出错误', () => {
    expect(() => importCategories('invalid json')).toThrow('导入失败');
  });

  test('导入非数组格式抛出错误', () => {
    expect(() => importCategories('{"name": "test"}')).toThrow('导入数据必须是数组格式');
  });

  test('导入包含无效类别数据时抛出错误', () => {
    const invalidData = JSON.stringify([
      { name: '', type: 'test', baseValue: 88, baseIncrement: 4 } // 空名称
    ]);
    expect(() => importCategories(invalidData)).toThrow('无效的类别数据');
  });
});

