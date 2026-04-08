# 集领尺码表生成器

基于 Electron + React + Vite 的桌面应用，用于配置服装尺码类别、生成尺码数据并导出图片/表格。

## 当前功能

- 类别管理：预设类别 + 自定义类别增删改
- 尺码设置：起始尺码、数量、类别起始值
- 预览与导出：画布预览、图片导出、Electron 环境下导出能力
- 桌面能力：无边框窗口控制、目录选择、通知、日志上报

## 技术栈

- 桌面框架：Electron 27
- 前端：React 18、Zustand、styled-components、Framer Motion
- 构建：Vite 5
- 测试：Jest
- 代码质量：ESLint + TypeScript

## 快速开始

```bash
npm install
npm run electron-dev
```

开发模式会同时启动前端开发服务器与 Electron 主进程。

## 常用命令

```bash
# 开发
npm run dev
npm run electron-dev

# 质量检查
npm run lint:check
npm run type-check
npm test
npm run verify
npm run verify:docs

# 构建
npm run build
npm run build-electron

# 打包
npm run dist:win
npm run dist:portable
```

## 实际目录结构

```text
.
├─ main.cjs
├─ src/
│  ├─ main.jsx
│  ├─ assets/
│  ├─ app/
│  │  └─ components/
│  ├─ features/
│  │  ├─ size-chart/
│  │  ├─ settings/
│  │  └─ categories/
│  ├─ shared/
│  │  ├─ ui/
│  │  ├─ hooks/
│  │  ├─ utils/
│  │  └─ types/
│  ├─ electron/
│  │  ├─ backend/
│  │  └─ contract/
│  ├─ contexts/
│  ├─ services/
│  │  ├─ backend/
│  │  ├─ canvasRenderer.ts
│  │  ├─ dataManager.ts
│  │  ├─ imageExport.ts
│  │  ├─ sizeCalculator.ts
│  │  └─ tableExporter.ts
│  ├─ stores/
│  ├─ styles/
│  └─ types/
├─ test/
├─ docs/
├─ scripts/
├─ build/
├─ icons/
└─ public/
```

## 架构说明

- Electron 主进程入口：`main.cjs`
- IPC 与桥接：`src/services/backend/ipcHandler.cjs` + `src/services/backend/preload.cjs`
- 渲染层状态管理：`src/stores/useAppStore.ts`
- 导出主链路：`src/features/size-chart/services/imageExport.ts` + `src/services/tableExporter.ts`

## 文档索引

- 文档入口：`docs/README.md`
- 项目结构：`docs/PROJECT_STRUCTURE.md`
- 重构执行计划：`docs/REMEDIATION_REORG_PLAN.md`

## 说明

- 构建/打包产物默认输出到 `artifacts/`（如 `artifacts/dist`、`artifacts/dist-electron`），不作为源码目录使用。
- 如需执行完整回归，建议按顺序运行：`lint:check` -> `type-check` -> `test` -> `build`。
