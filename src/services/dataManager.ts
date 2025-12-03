/**
 * 数据管理服务
 * 提供类别管理、验证、存储等功能
 */

import type { Category, CategoryType, CreateCategoryInput } from '../types';

// ============================================
// 扩展类型定义
// ============================================

/** 带可选字段的完整类别 */
export interface FullCategory extends Category {
  iconUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** 验证结果 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/** 导出的类别数据格式 */
export interface ExportedCategory {
  name: string;
  type: string;
  baseValue: number;
  baseIncrement: number;
  description?: string;
}

// ============================================
// 预设类别数据
// ============================================

export const presetCategories: FullCategory[] = [
  {
    id: 'chest',
    name: '胸围',
    type: '上装',
    baseValue: 88,
    baseIncrement: 4,
    isCustom: false,
    description: '胸部最丰满处的水平围长',
    iconUrl: null
  },
  {
    id: 'waist',
    name: '腰围',
    type: '上装',
    baseValue: 68,
    baseIncrement: 4,
    isCustom: false,
    description: '腰部最细处的水平围长',
    iconUrl: null
  },
  {
    id: 'hip',
    name: '臀围',
    type: '下装',
    baseValue: 92,
    baseIncrement: 4,
    isCustom: false,
    description: '臀部最丰满处的水平围长',
    iconUrl: null
  },
  {
    id: 'hem',
    name: '下摆围',
    type: '上装',
    baseValue: 90,
    baseIncrement: 4,
    isCustom: false,
    description: '下摆处的水平围长',
    iconUrl: null
  },
  {
    id: 'shoulder',
    name: '肩宽',
    type: '上装',
    baseValue: 38,
    baseIncrement: 1,
    isCustom: false,
    description: '两肩点之间的直线距离',
    iconUrl: null
  },
  {
    id: 'sleeve',
    name: '袖长',
    type: '上装',
    baseValue: 58,
    baseIncrement: 1,
    isCustom: false,
    description: '肩点到袖口的长度',
    iconUrl: null
  },
  {
    id: 'shoulderSleeve',
    name: '肩袖长',
    type: '上装',
    baseValue: 22,
    baseIncrement: 1,
    isCustom: false,
    description: '肩缝到袖口的长度',
    iconUrl: null
  },
  {
    id: 'length',
    name: '衣长',
    type: '上装',
    baseValue: 65,
    baseIncrement: 1,
    isCustom: false,
    description: '后中心领窝点到下摆的长度',
    iconUrl: null
  },
  {
    id: 'pantLength',
    name: '裤长',
    type: '下装',
    baseValue: 100,
    baseIncrement: 1,
    isCustom: false,
    description: '裤腰到裤脚的长度',
    iconUrl: null
  },
  {
    id: 'skirtLength',
    name: '裙长',
    type: '下装',
    baseValue: 60,
    baseIncrement: 1,
    isCustom: false,
    description: '裙腰到裙摆的长度',
    iconUrl: null
  },
  {
    id: 'backLength',
    name: '中后长',
    type: '上装',
    baseValue: 38,
    baseIncrement: 1,
    isCustom: false,
    description: '后中心领窝点到腰线的长度',
    iconUrl: null
  },
  {
    id: 'frontLength',
    name: '中前长',
    type: '上装',
    baseValue: 36,
    baseIncrement: 1,
    isCustom: false,
    description: '前中心领窝点到腰线的长度',
    iconUrl: null
  }
];

// ============================================
// 类别管理函数
// ============================================

/**
 * 创建新类别
 * @param categoryData - 类别数据
 * @returns 新类别对象
 */
export const createCategory = (categoryData: CreateCategoryInput): FullCategory => {
  const { name, type, baseValue, baseIncrement, description } = categoryData;

  if (!name || !type || baseValue === undefined || baseIncrement === undefined) {
    throw new Error('缺少必要的类别信息');
  }

  return {
    id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: name.trim(),
    type: type as CategoryType,
    baseValue: Number(baseValue),
    baseIncrement: Number(baseIncrement),
    isCustom: true,
    description: description || '',
    iconUrl: null,
    createdAt: new Date().toISOString()
  };
};

/**
 * 验证类别数据
 * @param categoryData - 类别数据
 * @returns 验证结果
 */
export const validateCategory = (categoryData: Partial<Category>): ValidationResult => {
  const { name, baseValue, baseIncrement } = categoryData;
  const errors: Record<string, string> = {};

  if (!name || name.trim().length === 0) {
    errors.name = '类别名称不能为空';
  } else if (name.trim().length > 20) {
    errors.name = '类别名称不能超过20个字符';
  }

  if (baseValue === undefined || baseValue === ('' as unknown as number)) {
    errors.baseValue = '基础数值不能为空';
  } else if (isNaN(Number(baseValue)) || Number(baseValue) <= 0) {
    errors.baseValue = '基础数值必须是大于0的数字';
  }

  if (baseIncrement === undefined || baseIncrement === ('' as unknown as number)) {
    errors.baseIncrement = '递增数值不能为空';
  } else if (isNaN(Number(baseIncrement)) || Number(baseIncrement) <= 0) {
    errors.baseIncrement = '递增数值必须是大于0的数字';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * 更新类别
 * @param categories - 类别列表
 * @param categoryId - 类别ID
 * @param updates - 更新数据
 * @returns 更新后的类别列表
 */
export const updateCategory = (
  categories: FullCategory[],
  categoryId: string,
  updates: Partial<FullCategory>
): FullCategory[] => {
  return categories.map(category => {
    if (category.id === categoryId) {
      return {
        ...category,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }
    return category;
  });
};

/**
 * 删除类别
 * @param categories - 类别列表
 * @param categoryId - 类别ID
 * @returns 删除后的类别列表
 */
export const deleteCategory = (categories: FullCategory[], categoryId: string): FullCategory[] => {
  return categories.filter(category => category.id !== categoryId);
};

/**
 * 搜索类别
 * @param categories - 类别列表
 * @param query - 搜索关键词
 * @returns 搜索结果
 */
export const searchCategories = (categories: FullCategory[], query: string): FullCategory[] => {
  if (!query || query.trim().length === 0) {
    return categories;
  }

  const searchTerm = query.toLowerCase().trim();

  return categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm) ||
    category.type.toLowerCase().includes(searchTerm) ||
    (category.description && category.description.toLowerCase().includes(searchTerm))
  );
};

/**
 * 按类型分组类别
 * @param categories - 类别列表
 * @returns 分组后的类别
 */
export const groupCategoriesByType = (categories: FullCategory[]): Record<string, FullCategory[]> => {
  return categories.reduce((groups, category) => {
    const type = category.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(category);
    return groups;
  }, {} as Record<string, FullCategory[]>);
};

/**
 * 导入类别数据
 * @param jsonData - JSON格式的类别数据
 * @returns 导入的类别列表
 */
export const importCategories = (jsonData: string): FullCategory[] => {
  try {
    const data = JSON.parse(jsonData);

    if (!Array.isArray(data)) {
      throw new Error('导入数据必须是数组格式');
    }

    return data.map((item: CreateCategoryInput) => {
      const validation = validateCategory(item as unknown as Partial<Category>);
      if (!validation.isValid) {
        throw new Error(`无效的类别数据: ${Object.values(validation.errors).join(', ')}`);
      }

      return createCategory(item);
    });
  } catch (error) {
    throw new Error(`导入失败: ${(error as Error).message}`);
  }
};

/**
 * 导出类别数据
 * @param categories - 类别列表
 * @returns JSON格式的类别数据
 */
export const exportCategories = (categories: FullCategory[]): string => {
  const exportData: ExportedCategory[] = categories.map(category => ({
    name: category.name,
    type: category.type,
    baseValue: category.baseValue,
    baseIncrement: category.baseIncrement,
    description: category.description
  }));

  return JSON.stringify(exportData, null, 2);
};

// ============================================
// 本地存储管理
// ============================================

export const storage = {
  /** 保存数据到本地存储 */
  save: <T>(key: string, data: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('保存数据失败:', error);
      return false;
    }
  },

  /** 从本地存储加载数据 */
  load: <T>(key: string, defaultValue: T | null = null): T | null => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) as T : defaultValue;
    } catch (error) {
      console.error('加载数据失败:', error);
      return defaultValue;
    }
  },

  /** 删除本地存储数据 */
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('删除数据失败:', error);
      return false;
    }
  },

  /** 清空所有本地存储 */
  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('清空数据失败:', error);
      return false;
    }
  }
};

