/**
 * 集领尺码表生成器 - 核心类型定义
 * @module types
 */

// ============================================
// 类别相关类型
// ============================================

/** 类别类型 */
export type CategoryType = '上装' | '下装' | '连体装' | '配饰' | '其他';

/** 类别接口 */
export interface Category {
  /** 唯一标识符 */
  id: string;
  /** 类别名称 */
  name: string;
  /** 类别类型 */
  type: CategoryType;
  /** 基础值 */
  baseValue: number;
  /** 基础增量 */
  baseIncrement: number;
  /** 是否为自定义类别 */
  isCustom: boolean;
  /** 类别描述 */
  description?: string;
}

/** 创建类别的输入参数 */
export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  baseValue: number | string;
  baseIncrement: number | string;
  description?: string;
}

// ============================================
// 尺码相关类型
// ============================================

/** 标准尺码列表 */
export type SizeCode = 'F' | 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL' | '4XL' | '5XL' | '6XL';

/** 尺码设置 */
export interface SizeSettings {
  /** 起始尺码 */
  startSize: SizeCode;
  /** 生成数量 */
  count: number;
  /** 是否为毛衣模式（增量减半） */
  sweaterMode?: boolean;
  /** 自定义起始值（可选） */
  customStartValue?: number;
}

/** 尺码数据点 */
export interface SizeDataPoint {
  /** 尺码标识 */
  size: SizeCode;
  /** 数值 */
  value: number;
}

/** 类别尺码数据 */
export interface CategorySizeData {
  /** 类别名称 */
  categoryName: string;
  /** 类别 ID */
  categoryId?: string;
  /** 各尺码的值 */
  values: SizeDataPoint[];
}

// ============================================
// 图表和渲染相关类型
// ============================================

/** 图表配置 */
export interface ChartOptions {
  /** 画布宽度 */
  width?: number;
  /** 画布高度 */
  height?: number;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 主题色 */
  primaryColor?: string;
  /** 网格颜色 */
  gridColor?: string;
  /** 文字颜色 */
  textColor?: string;
  /** 标题 */
  title?: string;
  /** 是否显示标题 */
  showTitle?: boolean;
  /** 是否显示网格 */
  showGrid?: boolean;
  /** 字体 */
  fontFamily?: string;
}

/** 图表数据 */
export interface ChartData {
  /** 图表标题 */
  title: string;
  /** 二维数据数组（表格形式） */
  data: (string | number)[][];
  /** 类别列表 */
  categories: Category[];
  /** 尺码列表 */
  sizes: SizeCode[];
  /** 尺码设置 */
  settings: SizeSettings;
  /** 尺寸信息 */
  dimensions: {
    width: number;
    height: number;
  };
  /** 创建时间 */
  createdAt: string;
}

// ============================================
// 表格布局相关类型
// ============================================

/** 表格行数据 */
export interface TableRowData {
  [key: string]: string | number;
}

/** 表格布局信息 */
export interface TableLayout {
  /** 单元格宽度 */
  cellWidth: number;
  /** 单元格高度 */
  cellHeight: number;
  /** 表格总宽度 */
  tableWidth: number;
  /** 表格总高度 */
  tableHeight: number;
  /** 起始 X 坐标 */
  startX: number;
  /** 起始 Y 坐标 */
  startY: number;
  /** 行数 */
  rows: number;
  /** 列数 */
  cols: number;
}

// ============================================
// 导出相关类型
// ============================================

/** 图片格式 */
export type ImageFormat = 'png' | 'jpeg' | 'webp';

/** 导出选项 */
export interface ExportOptions {
  /** 图片格式 */
  format?: ImageFormat;
  /** 图片质量 (0-1) */
  quality?: number;
  /** 缩放倍数 */
  scale?: number;
  /** 文件名 */
  filename?: string;
}

