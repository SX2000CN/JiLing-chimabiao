/**
 * 集领尺码表生成器 - Zustand 状态管理
 * @module stores/useAppStore
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Category, SizeCode } from '../types';

// ============================================
// 类型定义
// ============================================

/** 窗口控件样式 */
export type WindowControlStyle = 'macos' | 'windows' | 'linux' | 'custom';

/** 尺码表样式模板 */
export type TableStyleTemplate = 'default' | 'minimal' | 'business' | 'fashion';

/** 尺码设置 */
export interface SizeSettings {
  startSize: SizeCode;
  count: number;
}

/** UI 偏好设置 */
export interface UIPreferences {
  windowControlStyle: WindowControlStyle;
  tableStyleTemplate: TableStyleTemplate;
  // 未来扩展：自定义样式配置
  customTableStyles?: {
    primaryColor?: string;
    headerColor?: string;
    borderColor?: string;
    fontFamily?: string;
  };
}

/** 应用状态 */
export interface AppState {
  // 业务数据
  mode: 'normal' | 'sweater';
  sizeSettings: SizeSettings;
  categories: Category[];
  selectedCategories: Category[];
  categoryStartValues: Record<string, number>;
  exportPath: string;
  
  // UI 状态
  isSettingsOpen: boolean;
  
  // UI 偏好（持久化）
  uiPreferences: UIPreferences;
}

/** Store Actions */
export interface AppActions {
  // 模式操作
  setMode: (mode: 'normal' | 'sweater') => void;
  
  // 尺码设置操作
  setSizeSettings: (settings: Partial<SizeSettings>) => void;
  
  // 类别操作
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // 选中类别操作
  setSelectedCategories: (categories: Category[]) => void;
  toggleCategorySelection: (category: Category) => void;
  clearSelection: () => void;
  
  // 类别起始值操作
  setCategoryStartValue: (categoryId: string, value: number) => void;
  setCategoryStartValues: (values: Record<string, number>) => void;
  
  // 导出路径操作
  setExportPath: (path: string) => void;
  
  // UI 状态操作
  setSettingsOpen: (isOpen: boolean) => void;
  
  // UI 偏好操作
  setWindowControlStyle: (style: WindowControlStyle) => void;
  setTableStyleTemplate: (template: TableStyleTemplate) => void;
  setCustomTableStyles: (styles: UIPreferences['customTableStyles']) => void;
  
  // 批量更新
  updateState: (updates: Partial<AppState>) => void;
  
  // 重置
  resetToDefaults: () => void;
}

// ============================================
// 默认值
// ============================================

const defaultUIPreferences: UIPreferences = {
  windowControlStyle: 'macos',
  tableStyleTemplate: 'default',
};

const defaultState: AppState = {
  mode: 'normal',
  sizeSettings: { startSize: 'S', count: 4 },
  categories: [],
  selectedCategories: [],
  categoryStartValues: {},
  exportPath: '',
  isSettingsOpen: false,
  uiPreferences: defaultUIPreferences,
};

// ============================================
// Store 创建
// ============================================

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      // 初始状态
      ...defaultState,

      // 模式操作
      setMode: (mode) => set({ mode }),

      // 尺码设置操作
      setSizeSettings: (settings) => set((state) => ({
        sizeSettings: { ...state.sizeSettings, ...settings }
      })),

      // 类别操作
      setCategories: (categories) => set({ categories }),
      
      addCategory: (category) => set((state) => ({
        categories: [...state.categories, category]
      })),
      
      updateCategory: (id, updates) => set((state) => ({
        categories: state.categories.map((cat) =>
          cat.id === id ? { ...cat, ...updates } : cat
        )
      })),
      
      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== id),
        selectedCategories: state.selectedCategories.filter((cat) => cat.id !== id)
      })),

      // 选中类别操作
      setSelectedCategories: (categories) => set({ selectedCategories: categories }),
      
      toggleCategorySelection: (category) => set((state) => {
        const isSelected = state.selectedCategories.some((c) => c.id === category.id);
        return {
          selectedCategories: isSelected
            ? state.selectedCategories.filter((c) => c.id !== category.id)
            : [...state.selectedCategories, category]
        };
      }),
      
      clearSelection: () => set({ selectedCategories: [] }),

      // 类别起始值操作
      setCategoryStartValue: (categoryId, value) => set((state) => ({
        categoryStartValues: { ...state.categoryStartValues, [categoryId]: value }
      })),

      setCategoryStartValues: (values) => set({ categoryStartValues: values }),

      // 导出路径操作
      setExportPath: (path) => set({ exportPath: path }),

      // UI 状态操作
      setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),

      // UI 偏好操作
      setWindowControlStyle: (style) => set((state) => ({
        uiPreferences: { ...state.uiPreferences, windowControlStyle: style }
      })),

      setTableStyleTemplate: (template) => set((state) => ({
        uiPreferences: { ...state.uiPreferences, tableStyleTemplate: template }
      })),

      setCustomTableStyles: (styles) => set((state) => ({
        uiPreferences: { ...state.uiPreferences, customTableStyles: styles }
      })),

      // 批量更新
      updateState: (updates) => set((state) => ({ ...state, ...updates })),

      // 重置
      resetToDefaults: () => set(defaultState),
    }),
    {
      name: 'jiling-app-storage',
      storage: createJSONStorage(() => localStorage),
      // 只持久化需要保存的字段
      partialize: (state) => ({
        mode: state.mode,
        sizeSettings: state.sizeSettings,
        categoryStartValues: state.categoryStartValues,
        exportPath: state.exportPath,
        uiPreferences: state.uiPreferences,
        // 注意：categories 和 selectedCategories 单独处理（presetCategories 不需要持久化）
      }),
    }
  )
);

// ============================================
// 选择器 Hooks（细粒度订阅，优化性能）
// ============================================

/** 获取模式 */
export const useMode = () => useAppStore((state) => state.mode);

/** 获取尺码设置 */
export const useSizeSettings = () => useAppStore((state) => state.sizeSettings);

/** 获取选中的类别 */
export const useSelectedCategories = () => useAppStore((state) => state.selectedCategories);

/** 获取所有类别 */
export const useCategories = () => useAppStore((state) => state.categories);

/** 获取 UI 偏好 */
export const useUIPreferences = () => useAppStore((state) => state.uiPreferences);

/** 获取窗口控件样式 */
export const useWindowControlStyle = () => useAppStore((state) => state.uiPreferences.windowControlStyle);

/** 获取尺码表样式模板 */
export const useTableStyleTemplate = () => useAppStore((state) => state.uiPreferences.tableStyleTemplate);

/** 获取设置面板状态 */
export const useSettingsOpen = () => useAppStore((state) => state.isSettingsOpen);

/** 获取导出路径 */
export const useExportPath = () => useAppStore((state) => state.exportPath);

export default useAppStore;

