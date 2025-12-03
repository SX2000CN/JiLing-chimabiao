# 📁 项目文件结构说明

## 🎯 项目概述

**尺码表生成器** - 一个采用Finder风格设计的现代化桌面应用，专为服装行业提供专业的尺码表生成、预览和导出功能。

### 🔧 技术选型

- **架构模式**: MVC架构，清晰的分层设计
- **前端框架**: React 18 + Hooks + 函数式组件
- **构建工具**: Vite 5 (快速热重载，模块化打包)
- **桌面框架**: Electron 27 (跨平台原生体验)
- **样式方案**: Styled-components (CSS-in-JS)
- **动画库**: Framer Motion (流畅微交互)
- **测试框架**: Jest + 自定义验证脚本

## 📂 目录结构详解

```
chi-ma-biao-7.16/                    # 项目根目录
├── 📂 src/                          # 源代码目录
│   ├── 📂 components/               # React组件层 (19个组件)
│   │   ├── 🏠 App.jsx              # 主应用组件 - 全局状态管理
│   │   ├── 🖥️ MainContent.jsx      # 主内容区域 - 布局容器
│   │   ├── 👁️ PreviewPanel.jsx     # 预览面板 - 尺码表实时显示
│   │   ├── ⚙️ SettingsPanel.jsx    # 设置面板 - 配置管理
│   │   ├── 📋 CategoryManager.jsx  # 类别管理器 - CRUD操作
│   │   ├── 📏 SizeSettings.jsx     # 尺码设置 - 尺码范围配置
│   │   ├── 🎛️ Sidebar.jsx          # 侧边栏 - 导航和搜索
│   │   ├── 📊 StatusBar.jsx        # 状态栏 - 应用状态显示
│   │   ├── 🧩 Select.jsx           # 下拉选择组件 - Portal优化
│   │   ├── 🔘 Button.jsx           # 按钮组件 - 统一样式
│   │   ├── ✏️ Input.jsx            # 输入框组件 - 表单控件
│   │   ├── 🪟 Modal.jsx            # 模态框组件 - 弹窗管理
│   │   ├── 📑 Table.jsx            # 表格组件 - 数据展示
│   │   ├── 🎯 TitleBar.jsx         # 标题栏 - 窗口控制
│   │   ├── 🔧 Toolbar.jsx          # 工具栏 - 快速操作
│   │   ├── 🕹️ WindowControls.jsx   # 窗口控制 - 最小化/关闭
│   │   ├── 📶 SegmentedControl.jsx # 分段控制器 - 模式切换
│   │   ├── 🛡️ ErrorBoundary.jsx    # 错误边界 - 异常处理
│   │   └── 📤 ExportDialog.js      # 导出对话框 - 文件保存
│   ├── 📂 services/                # 业务逻辑服务层
│   │   ├── 📊 dataManager.js       # 数据管理 - 类别CRUD、本地存储
│   │   ├── 🧮 sizeCalculator.js    # 尺码计算 - 算法核心、序列生成
│   │   ├── 🎨 canvasRenderer.js    # Canvas渲染 - 图表绘制、样式控制
│   │   ├── 📤 tableExporter.js     # 表格导出 - 高质量PNG导出
│   │   └── 📂 backend/             # Electron后端服务
│   │       ├── 🔌 ipcHandler.cjs   # IPC通信处理 - 主进程通信
│   │       ├── 📋 excelExporter.cjs # Excel导出服务 - 数据导出
│   │       ├── 🗄️ localDatabase.cjs # 本地数据库 - SQLite操作
│   │       ├── 🔄 dataMigration.cjs # 数据迁移 - 版本升级支持
│   │       └── 🔧 preload.cjs      # 预加载脚本 - 安全通信桥梁
│   ├── 📂 styles/                  # 样式文件目录
│   │   ├── 🎨 globals.css         # 全局样式 - 基础重置、公共样式
│   │   ├── 🎬 animations.js       # 动画定义 - Framer Motion配置
│   │   ├── 🎯 theme.js           # 主题配置 - 颜色、字体、间距
│   │   └── 🔍 highQuality.js     # 高质量渲染 - Canvas优化配置
│   ├── 📂 assets/                 # 静态资源目录
│   │   └── 📂 fonts/             # 字体文件目录
│   │       ├── 🔤 MiSans.css     # MiSans字体样式定义
│   │       └── 📂 MiSans/        # MiSans字体文件 (5个字重)
│   │           ├── MiSans-Light.ttf     # 轻量字重
│   │           ├── MiSans-Regular.ttf   # 常规字重
│   │           ├── MiSans-Medium.ttf    # 中等字重
│   │           ├── MiSans-Semibold.ttf  # 半粗字重
│   │           └── MiSans-Bold.ttf      # 粗体字重
│   ├── 📂 hooks/                  # React Hooks目录
│   │   └── 🪟 useFramelessDetection.js # 无边框窗口检测Hook
│   ├── 📂 utils/                  # 工具函数目录
│   │   └── ⚡ performance.js      # 性能优化工具
│   ├── 📂 examples/               # 示例文件目录
│   │   └── 🔗 ExportIntegration.js # 导出功能集成示例
│   └── 🚀 main.jsx               # 应用入口文件 - React渲染入口
├── 📂 test/                       # 测试文件目录 (10个测试)
│   ├── 🧪 app.test.js            # 主测试套件 - Jest集成测试
│   ├── ⚙️ setupTests.js          # 测试环境配置 - jsdom设置
│   ├── 🌐 border-test.html       # 边框样式测试页面
│   ├── 📊 format-test.js         # 格式化功能测试
│   ├── 🧶 test-sweater-mode.js   # 毛衣模式测试
│   ├── 🔍 verify-auto-type.js    # 自动类型检测验证
│   ├── 📤 verify-export-function.js # 导出功能验证
│   ├── 🔄 verify-mode-removal.js # 模式移除验证
│   └── 📏 verify-start-values.js # 起始值验证
├── 📂 docs/                      # 项目文档目录
│   ├── 📋 功能文档.md            # 详细功能说明
│   ├── 🎨 前端开发清单.md        # UI设计规范
│   ├── 🔧 后端实现指南.md        # 技术实现细节
│   ├── 📝 开发日志.md           # 开发过程记录
│   ├── 🔤 MiSans字体集成报告.md # 字体系统文档
│   └── 📂 archive/              # 历史文档归档
├── 📄 main.cjs                  # Electron主进程文件
├── 📄 package.json              # 项目配置和依赖
├── 📄 package-lock.json         # 依赖锁定文件
├── 📄 vite.config.js           # Vite构建配置
├── 📄 jest.config.cjs          # Jest测试配置
├── 📄 babel.config.json        # Babel转换配置
├── 📄 .eslintrc.json           # ESLint代码规范
├── 📄 .prettierrc.json         # Prettier格式化配置
├── 📄 .gitignore               # Git忽略文件配置
├── 📄 index.html               # HTML模板文件
└── 📄 README.md                # 项目说明文档
```

## 🔧 核心功能模块详解

### 1. 组件系统 (src/components/)

**架构设计**: 采用原子设计理念，组件按功能职责分层

- **App.jsx**: 主应用组件，管理全局状态和路由
- **MainContent.jsx**: 主内容区域，响应式布局容器
- **PreviewPanel.jsx**: 预览面板，实时Canvas渲染和导出
- **SettingsPanel.jsx**: 设置面板，尺码配置和类别管理
- **CategoryManager.jsx**: 类别管理器，CRUD操作和数据验证
- **SizeSettings.jsx**: 尺码设置，范围选择和毛衣模式切换
- **Select.jsx**: 下拉选择组件，Portal渲染解决层级问题

### 2. 服务层 (src/services/)

**设计模式**: 纯函数式服务，单一职责原则

- **dataManager.js**: 数据管理核心，类别CRUD和本地存储
- **sizeCalculator.js**: 尺码计算引擎，算法实现和数据格式化
- **canvasRenderer.js**: Canvas渲染服务，高质量图表生成
- **tableExporter.js**: 导出服务，3000像素PNG生成

### 3. Electron集成 (src/services/backend/)

**进程通信**: IPC安全通信，主进程服务分离

- **ipcHandler.cjs**: 主进程IPC通信处理和事件分发
- **excelExporter.cjs**: Excel文件导出，ExcelJS集成
- **localDatabase.cjs**: SQLite本地数据库，数据持久化
- **dataMigration.cjs**: 数据迁移服务，版本兼容性保证

## 🎨 技术栈详解

### 前端技术选型

```bash
React 18.x           # 前端框架 - Hooks + 函数式组件
Vite 5.x            # 构建工具 - 快速热重载，ES模块优化
Styled Components   # CSS-in-JS - 组件级样式封装
Framer Motion      # 动画库 - 声明式动画，性能优化
```

### 桌面应用集成

```bash
Electron 27.x       # 桌面框架 - 跨平台原生体验
electron-builder   # 打包工具 - 自动化构建和分发
better-sqlite3     # 数据库 - 高性能本地存储
ExcelJS            # Excel处理 - 数据导入导出
```

### 开发工具链

```bash
Jest 29.x          # 测试框架 - 单元测试和集成测试
ESLint 8.x         # 代码规范 - 静态分析和风格统一
Prettier 3.x       # 代码格式化 - 自动化代码美化
Babel 7.x          # JS编译器 - ES6+语法转换
```

## ⚡ 关键特性实现

### 1. 高质量渲染系统

**Canvas优化策略**:

- **分辨率**: 3000×3000像素画布，确保印刷质量
- **字体渲染**: MiSans字体系统，5个字重覆盖所有场景
- **反锯齿**: 亚像素渲染，边缘平滑处理
- **内存管理**: Canvas对象池，避免内存泄漏

### 2. 智能导出系统

**文件管理功能**:

- **智能命名**: 自动递增文件名，避免覆盖
- **路径记忆**: 用户选择的导出路径持久化保存
- **快捷键**: Ctrl+S快速导出，提升操作效率
- **进度反馈**: 导出进度条，大文件处理体验优化

### 3. Portal下拉菜单

**技术实现**:

- **层级管理**: Portal渲染，突破容器overflow限制
- **定位算法**: 智能计算下拉位置，避免超出视口
- **事件处理**: 外部点击关闭，ESC键盘操作支持
- **无障碍**: ARIA标签支持，键盘导航友好

### 4. 毛衣模式算法

**业务逻辑**:

```javascript
// 大围度类别智能检测
if (category.baseIncrement >= 4) {
  // 毛衣模式下递增值减半
  const sweaterIncrement = category.baseIncrement / 2;
  return calculateWithSweaterMode(baseValue, sweaterIncrement);
}
```

## 📊 性能优化策略

### 1. 组件层面优化

- **React.memo**: 防止不必要的重渲染
- **useCallback**: 事件处理函数缓存
- **useMemo**: 计算结果缓存，避免重复计算
- **懒加载**: 大组件按需加载，减少初始包体积

### 2. 渲染性能优化

- **虚拟化**: 大数据列表虚拟滚动
- **防抖**: 用户输入防抖处理，减少API调用
- **Canvas缓存**: 渲染结果缓存，避免重复绘制
- **Web Workers**: 大数据计算后台处理

### 3. 打包优化

- **代码分割**: 按路由和功能模块分割
- **Tree Shaking**: 自动移除未使用代码
- **资源压缩**: 图片、字体文件压缩优化
- **CDN集成**: 静态资源CDN加速(预留)

## 🧪 测试体系架构

### 1. 单元测试覆盖

- **组件测试**: React Testing Library组件渲染测试
- **服务测试**: 纯函数逻辑测试，边界条件验证
- **工具函数**: 数学计算、数据格式化准确性测试

### 2. 集成测试

- **端到端流程**: 用户操作完整流程测试
- **数据流**: 状态管理和数据传递测试
- **导出功能**: 文件生成和质量验证测试

### 3. 性能测试

- **渲染性能**: 组件渲染时间测量
- **内存使用**: 内存泄漏检测和优化
- **文件大小**: 构建产物体积监控

## 🚀 部署和分发

### 1. 开发环境

```bash
npm run dev          # 前端开发服务器
npm run electron-dev # 完整开发环境
npm run test         # 测试套件运行
npm run lint         # 代码质量检查
```

### 2. 生产构建

```bash
npm run build           # 前端资源构建
npm run build-electron  # Electron应用打包
npm run dist           # 生成安装包
```

### 3. 平台支持

- **Windows**: NSIS安装包，自动更新支持
- **macOS**: DMG镜像，苹果签名认证
- **Linux**: AppImage格式，兼容性保证

## 📈 未来扩展规划

### 1. 功能扩展

- **云端同步**: 数据备份和多设备同步
- **团队协作**: 模板共享和权限管理
- **批量处理**: 多个尺码表批量生成
- **数据分析**: 使用统计和趋势分析

### 2. 技术升级

- **React 19**: 新特性集成和性能提升
- **Electron 新版本**: 安全性和性能改进
- **WebAssembly**: 计算密集型任务优化
- **PWA支持**: 渐进式Web应用功能

### 3. 平台适配

- **移动端**: React Native版本开发
- **Web版**: 在线版本，轻量化功能
- **插件系统**: 第三方扩展支持
- **API接口**: 开放API，集成其他系统
5. **动态缩放**: 根据数据量自动调整字体大小
6. **数据持久化**: 本地数据库存储用户设置

## 开发命令

```bash
npm run dev          # 开发模式
npm run build        # 构建生产版本
npm run electron-dev # Electron开发模式
npm run build-electron # 构建Electron应用
npm run test         # 运行测试
npm run lint         # 代码检查
npm run format       # 代码格式化
```

## 文件清理记录

2025-07-19 整理：
- 删除测试组件：TestApp.jsx, FontTest.jsx, QualityDemo.jsx等
- 删除重复文件：PreviewPanel_new.jsx
- 删除空的主文件：main-simple.cjs, main-standard.cjs, main.js
- 移动开发文档到docs/archive/目录
- 优化项目结构，保留核心功能文件
