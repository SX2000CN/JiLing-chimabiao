# 🚀 SQLite 数据库集成实施

> 详细实施步骤请参考：[后端实现指南.md](./后端实现指南.md)

## 核心目标
将 localStorage 数据存储升级为 SQLite 本地数据库，提供可靠的数据持久化。

## 快速开始

1. **安装依赖**
```bash
npm install better-sqlite3 exceljs --save
```

2. **创建核心文件**
- `src/services/localDatabase.js` - 数据库服务
- `src/services/dataMigration.js` - 数据迁移工具
- `src/services/excelExporter.js` - Excel 导出服务
- `electron/main.js` - 更新主进程 (添加 IPC 处理)
- `electron/preload.js` - 安全通信层
- `src/services/dataManager.js` - 更新前端数据访问层

3. **测试验证**
```bash
npm run dev
```

## 验收标准
- ✅ 数据库文件创建在用户文档目录
- ✅ 自动迁移 localStorage 数据
- ✅ 前端 API 保持不变
- ✅ 数据永不丢失

完整实施方案请查看 **[后端实现指南.md](./后端实现指南.md)**
