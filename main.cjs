/**
 * Electron 主进程
 * 
 * 功能：
 * - 创建和管理应用窗口
 * - 初始化后端服务
 * - 处理应用生命周期
 * - 设置安全策略
 */

const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// 检测开发环境
const isDev = process.env.NODE_ENV === 'development' || 
             process.defaultApp || 
             /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || 
             /[\\/]electron[\\/]/.test(process.execPath);

// 导入后端服务
const IPCHandler = require('./src/services/backend/ipcHandler.cjs');

class Application {
  constructor() {
    this.mainWindow = null;
    this.ipcHandler = null;
    this.isQuitting = false;
    
    this.setupApp();
  }

  /**
   * 设置应用程序
   */
  setupApp() {
    // 设置应用程序名称
    app.setName('集领商品部尺码表');

    // 禁用硬件加速（解决GPU相关问题）
    app.disableHardwareAcceleration();

    // 设置应用程序图标路径
    if (process.platform === 'win32') {
      app.setAppUserModelId('com.jilingsizetable.app');
    }

    // 监听应用程序事件
    this.setupAppEvents();
  }

  /**
   * 设置应用程序事件监听
   */
  setupAppEvents() {
    // 应用准备就绪
    app.whenReady().then(() => {
      this.createWindow();
      this.initializeBackend();
      console.log('应用程序启动成功');
    });

    // 所有窗口关闭
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // 应用激活
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });

    // 应用即将退出
    app.on('before-quit', () => {
      this.isQuitting = true;
      this.cleanup();
    });

    // 处理证书错误
    app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
      if (isDev) {
        event.preventDefault();
        callback(true);
      } else {
        callback(false);
      }
    });
  }

  /**
   * 创建主窗口
   */
  createWindow() {
    // 创建浏览器窗口
    this.mainWindow = new BrowserWindow({
      width: 800,               // 改为最小宽度
      height: 600,              // 改为最小高度
      minWidth: 800,
      minHeight: 600,
      show: false, // 初始不显示，等加载完成后显示
      backgroundColor: '#F9FAFB',
      icon: path.join(__dirname, 'build', 'icon.ico'), // 使用ICO格式图标
      frame: false,              // 移除系统标题栏和边框
      titleBarStyle: 'hidden',   // macOS 兼容
      titleBarOverlay: false,    // 禁用标题栏覆盖
      transparent: false,        // 保持非透明（避免性能问题）
      resizable: true,           // 确保窗口可调整大小
      maximizable: true,         // 确保窗口可最大化
      minimizable: true,         // 确保窗口可最小化
      webPreferences: {
        nodeIntegration: false, // 禁用 Node.js 集成
        contextIsolation: true, // 启用上下文隔离
        enableRemoteModule: false, // 禁用远程模块
        preload: path.join(__dirname, 'src', 'services', 'backend', 'preload.cjs'), // 预加载脚本
        webSecurity: !isDev, // 开发环境禁用 Web 安全
        allowRunningInsecureContent: isDev,
        experimentalFeatures: true
      }
    });

    // 重要：设置无边框标志供后续检测使用
    this.mainWindow.isFrameless = true;

    // 添加窗口状态事件监听
    this.mainWindow.on('maximize', () => {
      this.mainWindow.webContents.send('window-state-changed', { maximized: true });
    });

    this.mainWindow.on('unmaximize', () => {
      this.mainWindow.webContents.send('window-state-changed', { maximized: false });
    });

    this.mainWindow.on('minimize', () => {
      this.mainWindow.webContents.send('window-state-changed', { minimized: true });
    });

    this.mainWindow.on('restore', () => {
      this.mainWindow.webContents.send('window-state-changed', { minimized: false });
    });

    // 加载应用
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:5173');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }

    // 窗口准备好显示时
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
      
      // 聚焦窗口
      if (isDev) {
        this.mainWindow.focus();
      }
    });

    // 窗口关闭
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // 设置菜单
    this.setupMenu();

    console.log('主窗口创建成功');
  }

  /**
   * 设置应用菜单
   */
  setupMenu() {
    if (process.platform === 'darwin') {
      // macOS 菜单
      const template = [
        {
          label: app.getName(),
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        },
        {
          label: '编辑',
          submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' }
          ]
        },
        {
          label: '窗口',
          submenu: [
            { role: 'minimize' },
            { role: 'close' }
          ]
        }
      ];
      
      const menu = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(menu);
    } else {
      // 其他平台隐藏菜单
      Menu.setApplicationMenu(null);
    }
  }

  /**
   * 初始化后端服务
   */
  initializeBackend() {
    try {
      // 传递主窗口引用给IPCHandler
      this.ipcHandler = new IPCHandler(this.mainWindow);
      console.log('后端服务初始化成功');
    } catch (error) {
      console.error('后端服务初始化失败:', error);
      
      // 显示错误对话框，但不阻止应用启动
      const { dialog } = require('electron');
      dialog.showErrorBox(
        '初始化警告', 
        '后端服务初始化失败，某些功能可能不可用。\n\n' + 
        '错误详情: ' + error.message
      );
    }
  }

  /**
   * 清理资源
   */
  cleanup() {
    if (this.ipcHandler) {
      this.ipcHandler.cleanup();
      this.ipcHandler = null;
    }
  }

  /**
   * 获取主窗口
   */
  getMainWindow() {
    return this.mainWindow;
  }

  /**
   * 重启应用
   */
  restart() {
    app.relaunch();
    app.exit(0);
  }
}

// 创建应用实例
const application = new Application();

// 导出应用实例（用于测试）
module.exports = application;
