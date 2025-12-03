/**
 * 尺码计算服务
 * 提供尺码序列生成、数据计算、验证等纯函数
 */

import type { 
  Category, 
  SizeCode, 
  SizeSettings, 
  SizeDataPoint,
  CategorySizeData 
} from '../types';

// 标准尺码序列
const STANDARD_SIZES: SizeCode[] = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'];

/** 计算模式 */
export type CalculationMode = 'normal' | 'sweater';

/** 验证结果 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/** 表格格式数据 */
export interface TableFormatData {
  headers: string[];
  rows: (string | number)[][];
}

/** 统计信息 */
export interface SizeStatistics {
  totalCategories: number;
  totalSizes: number;
  averageIncrement: number;
  sizeRange: string;
}

/** 类别起始值映射 */
export type CategoryStartValues = Record<string, number | string>;

/**
 * 生成尺码序列
 * @param startSize - 起始尺码
 * @param count - 尺码数量
 * @returns 尺码序列
 */
export const generateSizeSequence = (startSize: SizeCode, count: number): SizeCode[] => {
  const sizes = STANDARD_SIZES;
  const startIndex = sizes.indexOf(startSize);
  
  if (startIndex === -1) {
    throw new Error(`无效的起始尺码: ${startSize}`);
  }
  
  if (startIndex + count > sizes.length) {
    return sizes.slice(startIndex);
  }
  
  return sizes.slice(startIndex, startIndex + count);
};

/**
 * 计算尺码数据
 * @param sizeSettings - 尺码设置
 * @param selectedCategories - 选中的类别
 * @param mode - 计算模式 (normal, sweater)
 * @param categoryStartValues - 类别自定义起始值
 * @returns 计算后的尺码数据
 */
export const calculateSizeData = (
  sizeSettings: SizeSettings, 
  selectedCategories: Category[], 
  mode: CalculationMode = 'normal', 
  categoryStartValues: CategoryStartValues = {}
): CategorySizeData[] => {
  const { startSize, count } = sizeSettings;
  const sizeSequence = generateSizeSequence(startSize, count);
  
  return selectedCategories.map(category => {
    // 根据模式调整递增值
    let increment = category.baseIncrement;
    
    if (mode === 'sweater' && category.baseIncrement >= 4) {
      // 毛衣模式下，递增值≥4cm的类别进行减半处理
      increment = category.baseIncrement / 2;
    }
    
    // 使用自定义起始值或默认基础值
    const savedStartValue = categoryStartValues[category.id];
    let startValue = category.baseValue;
    
    if (savedStartValue !== undefined) {
      const numValue = typeof savedStartValue === 'string' ? parseFloat(savedStartValue) : savedStartValue;
      if (!isNaN(numValue) && numValue > 0) {
        startValue = numValue;
      }
    }
    
    // 计算每个尺码的数值
    const values: (SizeDataPoint & { category: string })[] = sizeSequence.map((size, index) => ({
      size,
      value: Math.round((startValue + increment * index) * 10) / 10,
      category: category.name
    }));
    
    return {
      categoryId: category.id,
      categoryName: category.name,
      categoryType: category.type,
      values
    };
  });
};

/**
 * 验证尺码设置
 * @param sizeSettings - 尺码设置
 * @returns 验证结果
 */
export const validateSizeSettings = (sizeSettings: SizeSettings): ValidationResult => {
  const { startSize, count } = sizeSettings;
  const errors: Record<string, string> = {};
  
  if (!startSize) {
    errors.startSize = '请选择起始尺码';
  }
  
  if (!count || count < 1) {
    errors.count = '尺码数量必须大于0';
  } else if (count > 8) {
    errors.count = '尺码数量不能超过8个';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * 格式化尺码表数据为表格格式（第一行是类别，第一列是尺码）
 * @param sizeData - 尺码数据
 * @returns 表格格式数据
 */
export const formatSizeDataForTable = (sizeData: CategorySizeData[]): TableFormatData => {
  if (!sizeData || sizeData.length === 0) {
    return { headers: [], rows: [] };
  }
  
  const sizes = sizeData[0]?.values?.map(v => v.size) || [];
  const categories = sizeData.map(category => category.categoryName);
  const headers = ['尺码', ...categories];
  
  const rows = sizes.map(size => {
    const row: (string | number)[] = [size];
    
    categories.forEach(categoryName => {
      const category = sizeData.find(cat => cat.categoryName === categoryName);
      const valueObj = category?.values?.find(v => v.size === size);
      row.push(valueObj ? `${valueObj.value}` : '');
    });
    
    return row;
  });
  
  return { headers, rows };
};

/**
 * 导出尺码表数据为CSV格式
 * @param sizeData - 尺码数据
 * @param title - 表格标题
 * @returns CSV格式字符串
 */
export const exportToCSV = (sizeData: CategorySizeData[], title: string = '尺码表'): string => {
  const { headers, rows } = formatSizeDataForTable(sizeData);

  let csv = `${title}\n`;
  csv += headers.join(',') + '\n';
  csv += rows.map(row => row.join(',')).join('\n');

  return csv;
};

/**
 * 计算尺码表统计信息
 * @param sizeData - 尺码数据
 * @returns 统计信息
 */
export const calculateStatistics = (sizeData: CategorySizeData[]): SizeStatistics => {
  if (!sizeData || sizeData.length === 0) {
    return {
      totalCategories: 0,
      totalSizes: 0,
      averageIncrement: 0,
      sizeRange: ''
    };
  }

  const totalCategories = sizeData.length;
  const totalSizes = sizeData[0]?.values?.length || 0;
  const sizeRange = totalSizes > 0
    ? `${sizeData[0].values[0].size} - ${sizeData[0].values[totalSizes - 1].size}`
    : '';

  // 计算平均递增值
  let totalIncrement = 0;
  let count = 0;

  sizeData.forEach(category => {
    if (category.values.length > 1) {
      const increment = category.values[1].value - category.values[0].value;
      totalIncrement += increment;
      count++;
    }
  });

  const averageIncrement = count > 0 ? Math.round((totalIncrement / count) * 10) / 10 : 0;

  return {
    totalCategories,
    totalSizes,
    averageIncrement,
    sizeRange
  };
};

