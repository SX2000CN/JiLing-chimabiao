# JiLing 项目修复与重构执行计划（2026-04-08）

## 1. 目标与范围

本计划用于一次性解决以下四类问题：

1. 运行时契约问题（Electron API 调用不一致）
2. 工程门禁问题（Lint 无法运行）
3. 文档失真问题（README 与 docs 内容和仓库现状不一致）
4. 文件结构与仓库整洁度问题（构建产物、目录职责混杂、发布文件散落）

## 2. 现状问题（基于代码与目录现状）

### 2.1 高优先级问题

- 前端直接调用顶层 `window.electronAPI.exportSizeChart`，但预加载层暴露在 `electronAPI.export.exportSizeChart`。
- ErrorBoundary 调用顶层 `window.electronAPI.logError` / `window.electronAPI.restart`，但预加载层只暴露 `app.restart`，且无顶层 `logError` 兼容别名。
- ESLint 配置依赖 `@typescript-eslint/*`，但 `package.json` 未声明对应依赖，导致 `lint:check` 失败。

### 2.2 文档失真问题

- 根 README 中项目目录名、脚本、目录结构与当前仓库不一致。
- `docs/PROJECT_STRUCTURE.md` 和 `docs/README.md` 内容包含大量不存在文件与历史状态。

### 2.3 文件组织问题

- 仓库根目录存在构建产物目录与发布目录（`dist/`, `dist-electron/`, `release/`）并长期保留。
- 发布产物（`*.exe`, `win-unpacked/`）与源码共存，缺少统一归档策略。
- 文档缺少“单一真实入口”和“版本化维护规范”。

## 3. 目标文件结构（重规划）

> 原则：先“低风险收口”，再“中风险迁移”；避免一次性大搬迁。

```text
.
├─ src/
│  ├─ app/                      # 应用壳层（入口、布局、路由、全局装配）
│  ├─ features/                 # 业务功能域（按功能拆分）
│  │  ├─ size-chart/
│  │  │  ├─ components/
│  │  │  ├─ services/
│  │  │  └─ model/
│  │  ├─ settings/
│  │  └─ categories/
│  ├─ shared/                   # 可复用组件与基础能力
│  │  ├─ ui/
│  │  ├─ hooks/
│  │  ├─ utils/
│  │  └─ types/
│  ├─ electron/                 # 渲染侧与主进程桥接相关（类型+桥接协议）
│  │  ├─ contract/
│  │  └─ backend/
│  └─ styles/
├─ test/                        # 单元/集成测试（与 src 功能域对齐）
├─ docs/
│  ├─ architecture/             # 架构类文档（长期）
│  ├─ guides/                   # 使用/开发指南（长期）
│  ├─ decisions/                # 关键决策记录 ADR（长期）
│  ├─ release/                  # 发布流程与版本说明（长期）
│  └─ archive/                  # 历史文档归档（只读）
├─ scripts/
├─ build/
└─ artifacts/                   # 本地产物输出目录（不入库）
```

## 4. 分阶段执行计划

## Phase 0：基线冻结（0.5 天）

### 动作

1. 建立“当前基线”检查：`lint:check`、`type-check`、`test`、`build`。
2. 将当前问题登记为 issue 清单（可在 docs 里先留表）。
3. 确认不再将构建产物作为源码资产提交。

### 验收

- 基线报告可复现，包含失败项和通过项。

---

## Phase 1：高优先级修复（1 天）

### 1.1 Electron API 契约收口

#### 动作

1. 在预加载层增加向后兼容顶层别名：
   - `exportSizeChart` -> 转发至 `export.exportSizeChart`
   - `logError` -> 转发至 `app:logError`
   - `restart` -> 转发至 `app.restart`
2. 或统一改调用端为嵌套命名（推荐二选一：建议同时保留短期兼容）。
3. 新增桥接契约类型定义文件（例如 `src/electron/contract/electron-api.d.ts`），替代 `window as any`。

#### 验收

- 导出 Excel 功能在 Electron 环境可用。
- ErrorBoundary 的重启和日志上报可调用。
- 与旧调用路径兼容（至少一版）。

### 1.2 Lint 门禁修复

#### 动作

1. 安装并锁定：
   - `@typescript-eslint/parser`
   - `@typescript-eslint/eslint-plugin`
2. 运行 `lint:check`，清理新增的报错（必要时分批处理）。
3. CI/本地 pre-commit 保证 lint 可执行。

#### 验收

- `npm run lint:check` 成功。

---

## Phase 2：文档真实性重建（1 天）

### 2.1 根 README 重写（真实化）

#### 动作

1. 替换失真内容：
   - 正确项目目录名
   - 正确脚本清单（以 `package.json` 为准）
   - 正确目录结构（以当前仓库为准）
2. 删除不存在命令与目录引用。
3. 增加“已知限制”和“当前架构现状”章节（例如 Zustand 兼容层仍存在）。

#### 验收

- README 中所有命令可执行。
- README 中所有文件链接均存在。

### 2.2 docs 目录重整

#### 动作

1. 将 `docs/README.md` 变为单一索引入口（仅列真实存在文档）。
2. `docs/PROJECT_STRUCTURE.md` 只保留真实目录，不再写历史虚构组件。
3. 不存在的文档引用全部移除。
4. 历史文档统一移动到 `docs/archive/` 并标注“历史状态”。

#### 验收

- docs 索引零断链。
- docs 中不再出现不存在文件名。

---

## Phase 3：项目结构重构（2~3 天，分批）

### 动作

1. 先建立新目录骨架（`src/app`, `src/features`, `src/shared`, `src/electron`）。
2. 先迁移低耦合文件：
   - 通用 UI 组件 -> `shared/ui`
   - 通用工具/类型 -> `shared/utils`, `shared/types`
3. 再迁移高耦合功能模块：
   - 预览/导出/类别管理按功能域迁移到 `features/*`
4. 添加路径别名与导入规范（`tsconfig` + ESLint import 规则）。
5. 每批迁移后跑完整验证。

### 执行进度（2026-04-08｜第一批 + 第二批 + 第三批 + 第四批 + 第五批 + 第六批 + 第七批 + 第八批 + 第九批 + 第十批）

- [x] 已建立目录骨架：`src/app`、`src/features/*`、`src/shared/*`、`src/electron/*`
- [x] 已迁移低耦合基础 UI 组件至 `src/shared/ui`：
   - `Button.jsx`
   - `Input.jsx`
   - `Modal.jsx`
   - `Select.jsx`
   - `SegmentedControl.jsx`
- [x] 已修正业务组件导入路径并通过回归：`lint:check`、`type-check`、`test`、`build`
- [x] 已补充路径别名：`@app/*`、`@features/*`、`@shared/*`、`@electron/*`
- [x] 已迁移通用类型到 `src/shared/types/index.ts`，并保留 `src/types/index.ts` 兼容转发
- [x] 已迁移 `imageExport.ts` 到 `src/features/size-chart/services`，并保留旧路径兼容转发
- [x] 已迁移 `electron-api.d.ts` 到 `src/electron/contract`，并保留旧路径兼容引用
- [x] 已启动高耦合迁移：`PreviewPanel.jsx`、`SizeSettings.jsx` 已迁入 `src/features/size-chart/components`
- [x] 已为上述组件保留 `src/components` 下兼容转发层
- [x] 已完成 `settings`/`categories` 相关模块迁移：
   - `SettingsPanel.jsx` -> `src/features/settings/components/SettingsPanel.jsx`
   - `CategoryManager.jsx` -> `src/features/categories/components/CategoryManager.jsx`
- [x] 已为上述组件保留 `src/components` 下兼容转发层
- [x] 已完成高耦合 UI 迁移第五批：
   - `Sidebar.jsx` -> `src/features/categories/components/Sidebar.jsx`
   - `StatusBar.jsx` -> `src/app/components/StatusBar.jsx`
- [x] 已为上述组件保留 `src/components` 下兼容转发层
- [x] 第五批回归通过：`lint:check`、`type-check`、`test`、`build`
- [x] 已完成高耦合 UI 迁移第六批：
   - `MainContent.jsx` -> `src/features/size-chart/components/MainContent.jsx`
   - `Table.jsx` -> `src/features/size-chart/components/Table.jsx`
   - `ExportDialog.js` -> `src/features/size-chart/components/ExportDialog.js`
- [x] 已为上述组件保留 `src/components` 下兼容转发层
- [x] 已完成 app 壳层组件迁移第七批：
   - `Toolbar.jsx` -> `src/app/components/Toolbar.jsx`
   - `TitleBar.jsx` -> `src/app/components/TitleBar.jsx`
   - `WindowControls.jsx` -> `src/app/components/WindowControls.jsx`
   - `WindowControlsWindows.jsx` -> `src/app/components/WindowControlsWindows.jsx`
- [x] 已为上述组件保留 `src/components` 下兼容转发层
- [x] 第七批回归通过：`lint:check`、`type-check`、`test`、`build`
- [x] 已完成 app 壳层/横切组件迁移第八批：
   - `ErrorBoundary.jsx` -> `src/app/components/ErrorBoundary.jsx`
- [x] 已为上述组件保留 `src/components` 下兼容转发层
- [x] 第八批回归通过：`lint:check`、`type-check`、`test`、`build`
- [x] 已完成兼容转发层收敛第九批：
   - 已删除 `src/components` 下 14 个无引用转发文件（CategoryManager / ErrorBoundary / ExportDialog / MainContent / PreviewPanel / SettingsPanel / Sidebar / SizeSettings / StatusBar / Table / TitleBar / Toolbar / WindowControls / WindowControlsWindows）
- [x] 第九批回归通过：`lint:check`、`type-check`、`test`、`build`
- [x] 已完成入口收敛第十批：
   - `App.jsx` -> `src/app/components/App.jsx`
   - `src/main.jsx` 入口导入已切换到 `./app/components/App`
- [x] 第十批回归通过：`lint:check`、`type-check`、`test`、`build`
- [x] 已进入 Phase 4 第一批：
   - 已校正 `.gitignore`（移除 `package-lock.json` 忽略，新增 `artifacts/` 与 `**/win-unpacked/` 忽略）
   - 已将根目录临时诊断文档归档到 `docs/archive/`
- [x] 已完成本地产物目录清理（`dist/`、`dist-electron/`、`release/`）
- [x] 已确认上述目录当前无 Git 跟踪文件（无需本轮执行历史回写清理）
- [x] 已完成构建输出统一重定向到 `artifacts/`：
   - Vite 输出目录：`artifacts/dist`
   - Electron Builder 输出目录：`artifacts/dist-electron`
   - 生产加载路径已切换：`main.cjs` -> `artifacts/dist/index.html`
- [x] 已进入 Phase 5 第一批：
   - 已新增统一校验命令：`npm run verify`
   - 已新增 PR 模板并加入“文档一致性检查”条款
- [x] 已落地发布前文档链接扫描与命令抽检：`npm run verify:docs`
- [x] 已完成 Phase 5 最终验收：`npm run verify` 与 `npm run verify:docs` 已通过
- [x] 已确认进入持续维护阶段（后续按 PR 模板与 `verify` 流程执行）

### 验收

- 迁移后构建与测试通过。
- 目录职责清晰，新增代码按 feature 落位。

---

## Phase 4：文件整理与仓库瘦身（0.5~1 天）

### 动作

1. 统一产物目录策略：
   - 本地产物输出到 `artifacts/`（不入库）
   - `dist*`, `release`, `win-unpacked` 一律忽略并清理历史提交（必要时）
2. 清理根目录杂项说明文档（如临时 issue md）到 `docs/archive/` 或删除。
3. 校正 `.gitignore`（保留 lockfile 版本管理策略，不建议忽略 `package-lock.json`）。

### 执行进度（2026-04-08｜第一批）

- [x] 已校正 `.gitignore`（移除 `package-lock.json` 忽略；新增 `artifacts/` 与 `**/win-unpacked/` 忽略）
- [x] 已将根目录 `STATUSBAR_DIVIDER_ISSUE.md` 归档到 `docs/archive/STATUSBAR_DIVIDER_ISSUE.md`
- [x] 已清理本地产物目录：`dist/`、`dist-electron/`、`release/`
- [x] 已确认产物目录当前无 Git 跟踪文件
- [x] 已完成构建输出目录统一重定向到 `artifacts/`
- [x] 已完成：进入 Phase 5 并落地统一 `verify` 命令与发布前文档抽检流程

### 验收

- 根目录仅保留源码与必要配置。
- 产物目录不再污染版本库。

---

## Phase 5：质量守门与发布（0.5 天）

### 动作

1. 新增统一校验命令：`npm run verify`（lint + type-check + test + build）。
2. PR 模板加入“文档一致性检查”条款。
3. 发布前执行文档链接扫描与命令抽检。

### 执行进度（2026-04-08｜第一批）

- [x] 已新增统一校验命令：`npm run verify`（lint + type-check + test + build）
- [x] 已新增 PR 模板：`.github/pull_request_template.md`（含文档一致性检查条款）
- [x] 已新增 `npm run verify:docs`：执行文档引用检查、脚本抽检、产物路径配置校验
- [x] 已完成最终验收：`npm run verify` 与 `npm run verify:docs` 全通过
- [x] 已完成流程固化：PR 模板与文档校验脚本已纳入默认流程

### 验收

- `verify` 全通过。
- 文档与代码状态保持一致。

## 5. 文档真实化检查清单（执行标准）

- 每个命令都可在当前仓库执行。
- 每个目录树节点都真实存在。
- 每个文档链接都可打开。
- 每个“功能已实现”声明都能在界面或代码中找到对应入口。
- 每个版本号与脚本名与 `package.json` 一致。

## 6. 风险与回滚

### 风险

1. 大规模移动文件导致导入路径断裂。
2. Electron 桥接改动导致渲染端运行时异常。
3. 文档重写过程中漏掉发布流程关键信息。

### 回滚策略

1. 每一阶段独立提交，失败只回滚当前阶段。
2. 结构迁移按“目录批次”进行，单批不超过 20 个文件。
3. 桥接层先保留兼容别名至少一个版本。

## 7. 建议执行顺序（必须遵守）

1. 先修 Phase 1（功能与门禁）
2. 再做 Phase 2（文档真实化）
3. 再做 Phase 3（结构迁移）
4. 最后做 Phase 4（瘦身与归档）

---

如果按该计划执行，项目会从“可运行但信息失真+结构混乱”升级为“可验证、可维护、可扩展”的工程状态。