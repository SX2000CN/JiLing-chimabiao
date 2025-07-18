# 尺码表生成器

一个基于 Electron + React + Vite 的桌面应用程序，用于生成服装尺码表。

## 功能特性

- 🎯 支持普通和毛衣两种模式
- 📊 实时预览尺码表
- 📋 支持多种尺码类别（上衣、裤子、内衣等）
- 📁 Finder 风格的用户界面
- 💾 本地数据库存储
- 📤 支持导出功能

## 技术栈

- **前端**: React 18 + Vite 5
- **桌面框架**: Electron 27
- **样式**: Styled-components + Framer Motion
- **数据库**: SQLite (better-sqlite3)
- **构建工具**: electron-builder

## 开发环境

### 系统要求

- Node.js 16+
- npm 或 yarn

### 安装依赖

\`\`\`bash
npm install
\`\`\`

### 开发模式

\`\`\`bash
# 启动开发服务器和 Electron
npm run electron-dev

# 仅启动前端开发服务器
npm run dev

# 仅启动 Electron
npm run electron
\`\`\`

### 构建应用

\`\`\`bash
# 构建前端
npm run build

# 构建并打包 Electron 应用
npm run build-electron
\`\`\`

## 项目结构

\`\`\`
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   ├── hooks/             # 自定义 Hooks
│   ├── services/          # 服务层
│   ├── styles/            # 样式文件
│   └── utils/             # 工具函数
├── main.cjs               # Electron 主进程
├── preload.cjs            # Electron 预加载脚本
├── docs/                  # 项目文档
├── test/                  # 测试文件
└── dist/                  # 构建输出
\`\`\`

## 开发说明

### 主要组件

- `App.jsx` - 主应用组件
- `Toolbar.jsx` - 工具栏组件
- `CategorySelector.jsx` - 类别选择器
- `SizeChart.jsx` - 尺码表组件
- `PreviewPanel.jsx` - 预览面板

### 数据模型

应用支持两种模式：
- **普通模式**: 标准服装尺码
- **毛衣模式**: 毛衣专用尺码

### 本地存储

使用 SQLite 数据库存储：
- 尺码设置
- 用户偏好
- 历史记录

## 许可证

MIT License

## 更新日志

详见 `docs/` 目录中的相关文档。
