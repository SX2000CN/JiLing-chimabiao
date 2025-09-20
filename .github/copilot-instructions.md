# 集领尺码表生成器 AI 编码指南

## 🎯 项目概述
基于 React 前端的 Electron 桌面应用，专门为服装行业专业人士生成尺码表。界面为中文，面向时尚行业用户。

## 🏗️ 架构与核心模式

### 核心技术栈
- **前端框架**: React 18 + Vite 5 + styled-components
- **桌面应用**: Electron 27 (主进程使用 CommonJS `.cjs`，渲染进程使用 ES 模块)
- **状态管理**: React Context 模式，localStorage 持久化
- **样式系统**: CSS-in-JS 配合双主题（明暗）系统
- **动画效果**: Framer Motion 微交互动画

### 关键文件结构
```
src/
├── components/           # 19个UI组件，遵循styled-components模式
├── contexts/            # ThemeContext提供CSS变量注入
├── services/            # 业务逻辑（纯函数 + Electron后端服务）
│   └── backend/         # Electron主进程服务（.cjs文件）
├── styles/              # theme.js包含createTheme()工厂函数
main.cjs                 # Electron主进程入口
```

### 数据流架构
1. **前端状态**: App.jsx 管理全局 appState 对象，包含类别、设置、导出路径
2. **服务层**: dataManager.js、sizeCalculator.js、tableExporter.js 中的纯函数
3. **后端服务**: backend/ 目录中的 IPC 处理器，负责文件操作、数据库、Excel导出
4. **持久化**: localStorage 存储UI偏好，通过 IPCHandler 可选支持 SQLite

## 🔧 开发命令

```bash
npm run electron-dev      # 并发启动React开发服务器 + Electron
npm run dev              # 仅启动React开发服务器（端口5173->5174如果被占用）
npm run electron         # 仅启动Electron
npm run build-electron   # 生产构建 + 打包
npm run test            # Jest测试，包含模拟的Electron API
```

## 🎨 主题系统（关键模式）

### 双主题实现
- **ThemeContext.jsx**: 管理 isDarkMode 状态，向 :root 注入 CSS 变量
- **theme.js**: `createTheme(isDarkMode)` 工厂函数返回完整主题对象
- **CSS变量**: 使用 `var(--text-primary, #111827)` 模式实现主题感知样式
- **集成方式**: App.jsx 同时使用 styled-components ThemeProvider + 自定义 ThemeContext

### 主题使用模式
```jsx
// Styled components - 使用主题属性
const Component = styled.div`
  color: ${props => props.theme.colors.text.primary};
`;

// 内联样式 - 使用CSS变量进行主题切换
<div style={{ color: 'var(--text-primary, #111827)' }}>
```

## 📊 尺码表逻辑（领域专用）

### 类别系统
- **预设类别**: dataManager.js 中的12个预定义类别
- **毛衣模式**: 增量≥4cm的类别会减半（弹性面料补偿）
- **起始值**: 每个类别的自定义起始值存储在 categoryStartValues

### 尺码计算流水线
1. **sizeCalculator.js**: `calculateSizeData()` 生成尺码矩阵
2. **canvasRenderer.js**: 渲染到 HTML5 Canvas 进行预览
3. **tableExporter.js**: 通过 Canvas.toBlob() 导出3000px PNG

## 🖼️ Canvas渲染模式
高质量渲染，包含抗锯齿、自定义字体（MiSans）、精确表格布局。预览面板使用实时Canvas更新。

## 🔌 Electron IPC 架构

### 主进程服务
- **ipcHandler.cjs**: 中央IPC路由器，处理50+个通道
- **localDatabase.cjs**: 可选的SQLite操作
- **excelExporter.cjs**: Excel文件生成
- **preload.cjs**: 安全的API暴露给渲染进程

### 常见IPC模式
```javascript
// 渲染进程到主进程
window.electronAPI.selectDirectory()
window.electronAPI.exportToExcel(data)

// 主进程处理器
ipcMain.handle('select-directory', async () => {
  return dialog.showOpenDialog({ properties: ['openDirectory'] });
});
```

## 🧪 测试策略

### 模拟模式
- **setupTests.js**: 模拟所有Electron API、Canvas操作
- **验证脚本**: test/中的自定义功能验证脚本
- **组件测试**: Jest + React Testing Library 用于UI组件

### 测试文件命名
- `*.test.js` - Jest单元测试
- `verify-*.js` - 功能验证脚本
- `test-*.js` - 手动测试工具

## 🎯 组件模式

### Styled Components 约定
```jsx
// 文件结构：导入 → styled组件 → 主组件
const StyledContainer = styled.div`
  // 颜色使用主题属性
`;

const Component = ({ prop1, prop2 }) => {
  // 业务逻辑
  return <StyledContainer>...</StyledContainer>;
};
```

### 状态管理
- App.jsx 中的全局状态作为单一 `appState` 对象
- Context 仅用于主题，避免用于业务状态
- 使用 `storage.save()` / `storage.load()` 助手进行 localStorage 持久化

## 🚀 构建与打包

### 图标生成
- `npm run create-icon` 从源文件生成多分辨率图标
- 使用图标：16x16、32x32、48x48、64x64、128x128、256x256

### Electron Builder 配置
- Windows 便携版 + 安装包构建
- package.json 中的自动更新配置
- 分发代码签名

## ⚠️ 常见陷阱

1. **模块系统**: 主进程使用 CommonJS (.cjs)，渲染进程使用 ES 模块
2. **端口冲突**: Vite 会自动从5173切换到5174如果端口被占用
3. **主题变量**: 内联样式中必须使用CSS变量才能支持主题切换
4. **IPC安全**: 所有API通过 contextIsolated preload 脚本暴露
5. **中文文本**: UTF-8编码至关重要，必须使用 MiSans 字体系列

## 🔍 理解架构的关键文件

- `src/components/App.jsx` - 主应用程序状态和布局
- `src/contexts/ThemeContext.jsx` - 主题系统实现
- `src/services/dataManager.js` - 核心业务逻辑和数据结构
- `main.cjs` - Electron应用程序生命周期和安全设置
- `src/services/backend/ipcHandler.cjs` - 主进程-渲染进程通信枢纽