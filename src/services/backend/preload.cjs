/**
 * Electron 预加载脚本
 * 
 * 功能：
 * - 在渲染进程和主进程之间提供安全的通信桥梁
 * - 暴露数据库操作 API
 * - 暴露文件系统操作 API
 * - 暴露导出功能 API
 */

const { contextBridge, ipcRenderer } = require('electron');

// 数据库操作 API
const databaseAPI = {
  // 初始化数据库
  initialize: () => ipcRenderer.invoke('db:initialize'),
  
  // 类别操作
  getCategories: () => ipcRenderer.invoke('db:getCategories'),
  createCategory: (categoryData) => ipcRenderer.invoke('db:createCategory', categoryData),
  updateCategory: (categoryId, updateData) => ipcRenderer.invoke('db:updateCategory', categoryId, updateData),
  deleteCategory: (categoryId) => ipcRenderer.invoke('db:deleteCategory', categoryId),
  
  // 尺码表操作
  getSizeCharts: () => ipcRenderer.invoke('db:getSizeCharts'),
  getSizeChart: (chartId) => ipcRenderer.invoke('db:getSizeChart', chartId),
  createSizeChart: (chartData) => ipcRenderer.invoke('db:createSizeChart', chartData),
  deleteSizeChart: (chartId) => ipcRenderer.invoke('db:deleteSizeChart', chartId),
  
  // 设置操作
  getSetting: (key) => ipcRenderer.invoke('db:getSetting', key),
  updateSetting: (key, value) => ipcRenderer.invoke('db:updateSetting', key, value),
  
  // 统计信息
  getStats: () => ipcRenderer.invoke('db:getStats'),
  
  // 关闭数据库连接
  close: () => ipcRenderer.invoke('db:close')
};

// 导出功能 API
const exportAPI = {
  // 导出单个尺码表到 Excel
  exportSizeChart: (sizeChart, options) => 
    ipcRenderer.invoke('export:sizeChart', sizeChart, options),
  
  // 批量导出多个尺码表
  exportMultipleCharts: (sizeCharts, options) => 
    ipcRenderer.invoke('export:multipleCharts', sizeCharts, options),
  
  // 导出模板文件
  exportTemplate: (categories) => 
    ipcRenderer.invoke('export:template', categories),
  
  // 打开导出文件夹
  openExportFolder: () => ipcRenderer.invoke('export:openFolder')
};

// 数据迁移 API
const migrationAPI = {
  // 从 JSON 文件迁移
  migrateFromJSON: (filePath) => 
    ipcRenderer.invoke('migration:fromJSON', filePath),
  
  // 导出数据到 JSON
  exportToJSON: () => 
    ipcRenderer.invoke('migration:exportJSON'),
  
  // 从应用状态迁移
  migrateFromAppState: (appState) => 
    ipcRenderer.invoke('migration:fromAppState', appState),
  
  // 数据清理和验证
  cleanupAndValidate: () => 
    ipcRenderer.invoke('migration:cleanupValidate'),
  
  // 生成迁移报告
  generateReport: (migrationResult) => 
    ipcRenderer.invoke('migration:generateReport', migrationResult)
};

// 文件系统 API
const fileAPI = {
  // 选择文件
  selectFile: (options) => ipcRenderer.invoke('file:select', options),
  
  // 选择文件夹
  selectDirectory: (options) => ipcRenderer.invoke('file:selectDirectory', options),
  
  // 选择保存位置
  selectSaveLocation: (options) => ipcRenderer.invoke('file:selectSave', options),
  
  // 读取文件
  readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),
  
  // 写入文件
  writeFile: (filePath, content) => ipcRenderer.invoke('file:write', filePath, content),
  
  // 检查文件是否存在
  exists: (filePath) => ipcRenderer.invoke('file:exists', filePath),
  
  // 获取应用数据目录
  getAppDataPath: () => ipcRenderer.invoke('file:getAppDataPath'),
  
  // 打开文件夹
  openFolder: (folderPath) => ipcRenderer.invoke('file:openFolder', folderPath),
  
  // 保存图片到指定路径
  saveImageToPath: (filePath, base64Data) => ipcRenderer.invoke('file:saveImage', filePath, base64Data)
};

// 应用程序 API
const appAPI = {
  // 获取应用版本
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  
  // 获取应用路径
  getPath: (name) => ipcRenderer.invoke('app:getPath', name),
  
  // 退出应用
  quit: () => ipcRenderer.invoke('app:quit'),
  
  // 重启应用
  restart: () => ipcRenderer.invoke('app:restart'),
  
  // 显示消息框
  showMessageBox: (options) => ipcRenderer.invoke('app:showMessageBox', options),
  
  // 显示错误对话框
  showErrorBox: (title, content) => ipcRenderer.invoke('app:showErrorBox', title, content),
  
  // 显示保存对话框
  showSaveDialog: (options) => ipcRenderer.invoke('app:showSaveDialog', options),
  
  // 显示打开对话框
  showOpenDialog: (options) => ipcRenderer.invoke('app:showOpenDialog', options)
};

// 窗口操作 API
const windowAPI = {
  // 最小化窗口
  minimize: () => ipcRenderer.invoke('window:minimize'),
  
  // 最大化/还原窗口
  toggleMaximize: () => ipcRenderer.invoke('window:toggleMaximize'),
  
  // 关闭窗口
  close: () => ipcRenderer.invoke('window:close'),
  
  // 设置窗口标题
  setTitle: (title) => ipcRenderer.invoke('window:setTitle', title),
  
  // 获取窗口状态
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  
  // 检测是否为无边框窗口
  isFrameless: () => ipcRenderer.invoke('window-is-frameless'),
  
  // 设置窗口大小
  setSize: (width, height) => ipcRenderer.invoke('window:setSize', width, height),
  
  // 居中窗口
  center: () => ipcRenderer.invoke('window:center')
};

// 开发工具 API
const devAPI = {
  // 打开开发者工具
  openDevTools: () => ipcRenderer.invoke('dev:openDevTools'),
  
  // 重新加载页面
  reload: () => ipcRenderer.invoke('dev:reload'),
  
  // 强制重新加载页面
  forceReload: () => ipcRenderer.invoke('dev:forceReload'),
  
  // 切换开发者工具
  toggleDevTools: () => ipcRenderer.invoke('dev:toggleDevTools'),
  
  // 获取调试信息
  getDebugInfo: () => ipcRenderer.invoke('dev:getDebugInfo')
};

// 通知 API
const notificationAPI = {
  // 显示系统通知
  show: (options) => ipcRenderer.invoke('notification:show', options),
  
  // 检查通知权限
  checkPermission: () => ipcRenderer.invoke('notification:checkPermission'),
  
  // 请求通知权限
  requestPermission: () => ipcRenderer.invoke('notification:requestPermission')
};

// 主题 API
const themeAPI = {
  // 获取系统主题
  getSystemTheme: () => ipcRenderer.invoke('theme:getSystemTheme'),
  
  // 监听主题变化
  onThemeChanged: (callback) => {
    ipcRenderer.on('theme:changed', callback);
    return () => ipcRenderer.removeListener('theme:changed', callback);
  },
  
  // 设置应用主题
  setTheme: (theme) => ipcRenderer.invoke('theme:setTheme', theme)
};

// 更新检查 API
const updaterAPI = {
  // 检查更新
  checkForUpdates: () => ipcRenderer.invoke('updater:check'),
  
  // 下载更新
  downloadUpdate: () => ipcRenderer.invoke('updater:download'),
  
  // 安装更新
  installUpdate: () => ipcRenderer.invoke('updater:install'),
  
  // 监听更新事件
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('updater:available', callback);
    return () => ipcRenderer.removeListener('updater:available', callback);
  },
  
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('updater:downloaded', callback);
    return () => ipcRenderer.removeListener('updater:downloaded', callback);
  }
};

// 将所有 API 暴露给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 核心功能
  database: databaseAPI,
  export: exportAPI,
  migration: migrationAPI,
  file: fileAPI,
  
  // 应用程序功能
  app: appAPI,
  window: windowAPI,
  notification: notificationAPI,
  theme: themeAPI,
  
  // 开发和更新
  dev: devAPI,
  updater: updaterAPI,
  
  // 向后兼容的顶级文件夹选择方法
  selectDirectory: (options) => ipcRenderer.invoke('file:selectDirectory', options),
  
  // 向后兼容的顶级通知方法
  showNotification: (options) => ipcRenderer.invoke('notification:show', options),
  
  // 向后兼容的顶级文件存在检查方法
  fileExists: (filePath) => ipcRenderer.invoke('file:exists', filePath),
  
  // 向后兼容的顶级图片保存方法
  saveImageToPath: (filePath, base64Data) => ipcRenderer.invoke('file:saveImage', filePath, base64Data),
  
  // 工具函数
  utils: {
    // 生成唯一ID
    generateId: () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    
    // 格式化日期
    formatDate: (date) => new Date(date).toLocaleString('zh-CN'),
    
    // 获取文件扩展名
    getFileExtension: (filename) => filename.split('.').pop(),
    
    // 验证尺码
    validateSize: (size) => /^(XS|S|M|L|XL|2XL|3XL|4XL)$/.test(size),
    
    // 生成文件名
    generateFileName: (name, extension) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const safeName = name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
      return `${safeName}_${timestamp}.${extension}`;
    }
  },
  
  // 常量
  constants: {
    SIZES: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    DEFAULT_CATEGORIES: [
      { id: 'bust', name: '胸围', unit: 'cm' },
      { id: 'waist', name: '腰围', unit: 'cm' },
      { id: 'hip', name: '臀围', unit: 'cm' },
      { id: 'shoulder', name: '肩宽', unit: 'cm' },
      { id: 'sleeve', name: '袖长', unit: 'cm' },
      { id: 'length', name: '衣长', unit: 'cm' }
    ],
    FILE_TYPES: {
      EXCEL: { name: 'Excel 文件', extensions: ['xlsx', 'xls'] },
      JSON: { name: 'JSON 文件', extensions: ['json'] },
      CSV: { name: 'CSV 文件', extensions: ['csv'] }
    }
  }
});

// 错误处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason);
  ipcRenderer.invoke('app:logError', {
    type: 'unhandledrejection',
    error: event.reason,
    timestamp: new Date().toISOString()
  });
});

window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error);
  ipcRenderer.invoke('app:logError', {
    type: 'error',
    error: event.error,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    timestamp: new Date().toISOString()
  });
});

// 页面加载完成后的初始化
window.addEventListener('DOMContentLoaded', () => {
  console.log('尺码表生成器 - 预加载脚本已加载');
  
  // 初始化数据库
  window.electronAPI.database.initialize()
    .then(result => {
      if (result.success) {
        console.log('数据库初始化成功');
      } else {
        console.error('数据库初始化失败:', result.message);
      }
    })
    .catch(error => {
      console.error('数据库初始化异常:', error);
    });
});
