# 项目结构说明（当前仓库）

本文档描述当前仓库的真实目录结构与职责边界，用于开发与维护时快速定位。

## 根目录结构

```text
.
src/
├─ main.jsx
├─ app/
│  ├─ components/
│  │  ├─ App.jsx
│  │  ├─ ErrorBoundary.jsx
│  │  ├─ StatusBar.jsx
│  │  ├─ Toolbar.jsx
│  │  ├─ TitleBar.jsx
│  │  ├─ WindowControls.jsx
│  │  └─ WindowControlsWindows.jsx
│  └─ .gitkeep
├─ features/
│  ├─ size-chart/
│  │  ├─ components/
│  │  │  ├─ MainContent.jsx
│  │  │  ├─ PreviewPanel.jsx
│  │  │  ├─ SizeSettings.jsx
│  │  │  ├─ Table.jsx
│  │  │  ├─ ExportDialog.js
│  │  │  └─ .gitkeep
│  │  ├─ services/
│  │  │  ├─ imageExport.ts
│  │  │  └─ .gitkeep
│  │  └─ model/
│  │    └─ .gitkeep
│  ├─ settings/
│  │  ├─ components/
│  │  │  └─ SettingsPanel.jsx
│  │  └─ .gitkeep
│  └─ categories/
│    ├─ components/
│    │  ├─ CategoryManager.jsx
│    │  └─ Sidebar.jsx
│    └─ .gitkeep
├─ electron/
│  ├─ backend/
│  │  └─ .gitkeep
│  └─ contract/
│    ├─ electron-api.d.ts
│    └─ .gitkeep
├─ shared/
│  ├─ ui/
│  │  ├─ Button.jsx
│  │  ├─ Input.jsx
│  │  ├─ Modal.jsx
│  │  ├─ Select.jsx
│  │  └─ SegmentedControl.jsx
│  ├─ hooks/
│  │  └─ .gitkeep
│  ├─ utils/
│  │  └─ .gitkeep
│  └─ types/
│    ├─ index.ts
│    └─ .gitkeep
├─ assets/
│  └─ fonts/
├─ contexts/
│  └─ ThemeContext.jsx
├─ services/
│  ├─ backend/
│  │  ├─ preload.cjs
│  │  ├─ ipcHandler.cjs
│  │  ├─ localDatabase.cjs
│  │  ├─ excelExporter.cjs
│  │  └─ dataMigration.cjs
│  ├─ dataManager.ts
│  ├─ sizeCalculator.ts
│  ├─ canvasRenderer.ts
│  ├─ tableExporter.ts
│  └─ imageExport.ts
├─ stores/
│  └─ useAppStore.ts
├─ styles/
│  ├─ globals.css
│  ├─ animations.js
│  ├─ highQuality.js
│  ├─ theme.js
│  └─ theme-variables.css
└─ types/
  ├─ index.ts
  └─ electron-api.d.ts
```

## 关键模块职责

- `main.cjs`
  - Electron 主进程入口。
  - 创建窗口、管理生命周期、初始化 IPC 服务。

- `src/services/backend/preload.cjs`
  - 通过 `contextBridge` 向渲染进程暴露安全 API。
  - 包含窗口控制、导出、日志上报、目录选择等桥接能力。

- `src/services/backend/ipcHandler.cjs`
  - 主进程 IPC 处理中心。
  - 对接数据库、Excel 导出、文件系统等桌面能力。

- `src/stores/useAppStore.ts`
  - 前端应用状态中心（Zustand）。
  - 管理尺码配置、类别选择、UI 偏好等状态。

- `src/shared/ui/*`
  - 首批抽离的通用 UI 组件（Button/Input/Modal/Select/SegmentedControl）。
  - 供 `src/app` 与 `src/features` 下业务组件复用。

- `src/shared/types/index.ts`
  - 通用类型定义新位置（第二批迁移）。
  - `src/types/index.ts` 当前保留兼容转发层。

- `src/features/size-chart/services/imageExport.ts`
  - 图表图片导出流程已迁入 `size-chart` 功能域（第二批迁移）。
  - `src/services/imageExport.ts` 当前保留兼容转发层。

- `src/features/size-chart/components/*`
  - `PreviewPanel`、`SizeSettings` 已迁入 `size-chart` 功能域（第三批迁移）。
  - `MainContent`、`Table`、`ExportDialog` 已迁入 `size-chart` 功能域（第六批迁移）。
  - 第九批已清理 `src/components` 下对应兼容转发层。

- `src/features/settings/components/SettingsPanel.jsx`
  - 设置面板已迁入 `settings` 功能域（第四批迁移）。
  - 第九批已清理 `src/components/SettingsPanel.jsx` 兼容转发层。

- `src/features/categories/components/CategoryManager.jsx`
  - 类别管理已迁入 `categories` 功能域（第四批迁移）。
  - 第九批已清理 `src/components/CategoryManager.jsx` 兼容转发层。

- `src/features/categories/components/Sidebar.jsx`
  - 侧边栏已迁入 `categories` 功能域（第五批迁移）。
  - 第九批已清理 `src/components/Sidebar.jsx` 兼容转发层。

- `src/app/components/StatusBar.jsx`
  - 状态栏已迁入 `app` 壳层组件目录（第五批迁移）。
  - 第九批已清理 `src/components/StatusBar.jsx` 兼容转发层。

- `src/app/components/ErrorBoundary.jsx`
  - 全局错误边界已迁入 `app` 壳层组件目录（第八批迁移）。
  - 第九批已清理 `src/components/ErrorBoundary.jsx` 兼容转发层。

- `src/app/components/Toolbar.jsx`
  - 顶部工具栏已迁入 `app` 壳层组件目录（第七批迁移）。
  - 第九批已清理 `src/components/Toolbar.jsx` 兼容转发层。

- `src/app/components/TitleBar.jsx`
  - 标题栏已迁入 `app` 壳层组件目录（第七批迁移）。
  - 第九批已清理 `src/components/TitleBar.jsx` 兼容转发层。

- `src/app/components/WindowControls.jsx` 与 `src/app/components/WindowControlsWindows.jsx`
  - macOS/Windows 窗口控制组件已迁入 `app` 壳层组件目录（第七批迁移）。
  - 第九批已清理 `src/components/WindowControls.jsx` 与 `src/components/WindowControlsWindows.jsx` 兼容转发层。

- `src/app/components/App.jsx`
  - 应用装配入口组件已迁入 `app` 壳层目录（第十批迁移）。
  - 历史 `src/components` 目录中的组件层已完成收敛。

- `src/electron/contract/electron-api.d.ts`
  - Electron 渲染层 API 契约声明新位置（第二批迁移）。
  - `src/types/electron-api.d.ts` 当前保留兼容引用层。

- `src/app`、`src/features`、`src/electron`、`src/shared`
  - Phase 3 目标目录骨架已建立并持续按批次迁移。
  - 当前已完成基础 UI、types、size-chart、settings/categories 及 app 壳层核心组件与入口迁移。

- `src/services/imageExport.ts`
  - 兼容导出入口（转发到 `src/features/size-chart/services/imageExport.ts`）。

## 测试与脚本

- `test/`
  - 当前包含 `dataManager`、`sizeCalculator`、`canvasRenderer`、`tableExporter`、`app` 的测试文件。

- `scripts/`
  - 当前包含图标生成脚本 `create-icon-advanced.js`。

## 文档目录

- `docs/README.md`：文档索引入口。
- `docs/REMEDIATION_REORG_PLAN.md`：修复与重构执行计划。
- 其余文档为专题说明或发布说明。
