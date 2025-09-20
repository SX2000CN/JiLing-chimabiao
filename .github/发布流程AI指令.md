# AI助手版本发布自动化指令

> **用途**: 当用户请求"提交到github并且创建发行版"时，AI助手应严格按照此指令执行

## 🤖 AI执行流程 (严格按序执行)

### 步骤1: 准备阶段检查
```bash
# 检查当前git状态
git status

# 确认安装包存在 (替换版本号)
Get-ChildItem "dist-electron\*X.X.X*" | Select-Object Name, Length, LastWriteTime
```

### 步骤2: 提交代码更改
```bash
# 添加所有代码更改
git add .

# 提交 (使用规范的提交信息格式)
git commit -m "🚀 发布版本 X.X.X

✨ 新功能：
- [根据实际情况填写]

🐛 修复：
- [根据实际情况填写]  

📝 文档：
- [根据实际情况填写]

🔧 技术改进：
- 升级版本号至 X.X.X"

# 推送到远程
git push origin main
```

### 步骤3: 创建版本标签
```bash
# 创建带注释的版本标签
git tag -a vX.X.X -m "项目名 vX.X.X

🚀 主要特性：
- [主要功能特性]

✨ 新增功能：
- [详细功能列表]

🐛 问题修复：
- [修复问题列表]

📦 安装包：
- Windows安装包: 项目名-Setup-X.X.X.exe
- Windows便携版: 项目名-X.X.X-portable.exe"

# 推送标签
git push origin vX.X.X
```

### 步骤4: 创建发行文档 ⚠️ **关键步骤**

#### 4.1 创建 RELEASE_NOTES_vX.X.X.md
```markdown
# 项目名 vX.X.X 发行说明

🚀 **重大版本更新！** [简要描述主要更新]

## ✨ 主要新功能

### 🌟 [功能分类]
- **[功能名称]**: [详细描述]

## 🐛 问题修复

- **[问题描述]**: [修复详情]

## 📦 安装包信息

### Windows 版本
- **安装版**: `项目名-Setup-X.X.X.exe` (XXX MB)
  - 完整安装程序，包含自动更新功能
  
- **便携版**: `项目名-X.X.X-portable.exe` (XXX MB)  
  - 免安装版本，可以在任意位置运行

### 系统要求
- **操作系统**: Windows 10 或更高版本
- **内存**: 建议 4GB RAM 或更多
- **硬盘空间**: 至少 500MB 可用空间

## 🔧 从vY.Y.Y升级

- **数据兼容**: 完全兼容vY.Y.Y的所有数据和设置
- **自动升级**: 安装版用户将收到自动更新提醒

## 💬 反馈与支持

- **问题反馈**: [GitHub Issues](https://github.com/用户名/项目名/issues)
- **功能建议**: 欢迎在Issues中提出
```

#### 4.2 创建 GITHUB_RELEASE_GUIDE_vX.X.X.md  
```markdown
# GitHub Release vX.X.X 创建指南

## 📋 准备工作清单

✅ 代码已提交到GitHub  
✅ 版本标签 vX.X.X 已推送  
✅ 安装包已生成  
✅ 发行说明已准备

## 🚀 创建发行版步骤

### 1. 访问GitHub仓库
访问: https://github.com/用户名/项目名

### 2. 创建新发行版
1. 点击 **"Releases"** 链接
2. 点击 **"Create a new release"** 按钮

### 3. 填写发行版信息
- **Tag version**: `vX.X.X`
- **Release title**: `项目名 vX.X.X - [主要特性简述]`
- **Description**: 复制 RELEASE_NOTES_vX.X.X.md 的内容

### 4. 上传安装包文件
上传 dist-electron 目录中的:
- 项目名-Setup-X.X.X.exe
- 项目名-X.X.X-portable.exe

### 5. 发布
- ✅ **Set as the latest release**
- ❌ **Set as a pre-release**
- 点击 **"Publish release"**
```

### 步骤5: 提交发行文档 ⚠️ **必须执行**

```bash
# 检查新创建的文件
git status

# 添加发行文档
git add RELEASE_NOTES_vX.X.X.md GITHUB_RELEASE_GUIDE_vX.X.X.md

# 提交发行文档
git commit -m "📝 添加vX.X.X发行版文档

- 添加 RELEASE_NOTES_vX.X.X.md - 详细的发行说明
- 添加 GITHUB_RELEASE_GUIDE_vX.X.X.md - GitHub发行版创建指南
- 完善vX.X.X发行版的文档体系"

# 推送文档
git push origin main
```

### 步骤6: 最终确认

```bash
# 确认所有文件已提交
git status

# 确认标签存在
git tag -l "vX.X.X"

# 确认安装包文件存在
Get-ChildItem "dist-electron\*X.X.X*"
```

## 🚨 关键注意事项

### 必须记住的要点:
1. **发行文档必须单独提交**: 在步骤5中必须执行文档提交
2. **检查git status**: 每个阶段都要确认状态
3. **版本号一致性**: 确保所有地方的版本号一致
4. **安装包完整性**: 确认安装包文件存在且是最新的

### 常见错误预防:
- ❌ 创建发行文档后忘记提交
- ❌ 版本号不一致
- ❌ 安装包文件过期或缺失
- ❌ 标签推送失败

### 执行完成标准:
- ✅ 所有代码已推送到main分支  
- ✅ 版本标签已创建并推送
- ✅ 发行文档已创建并推送
- ✅ 安装包文件存在且正确
- ✅ git status 显示 "working tree clean"

## 📝 AI响应模板

当执行完成时，应回复:

```
## 🎉 GitHub发行版准备完成！

### ✅ 已完成的任务：
1. **代码提交和推送** - 所有vX.X.X的更改已提交到GitHub
2. **版本标签创建** - 创建并推送了vX.X.X标签  
3. **安装包准备** - 确认安装包文件存在
4. **发行版文档** - 创建了完整的发行说明和创建指南

### 🔥 下一步操作：
现在您只需要在GitHub上创建发行版：
1. 访问: https://github.com/用户名/项目名
2. 点击 "Releases" → "Create a new release"  
3. 选择标签: vX.X.X
4. 复制发行说明内容
5. 上传安装包文件
6. 发布

所有技术工作都已完成，您现在可以直接在GitHub上创建发行版了！🚀
```

---

**重要提醒**: 此指令基于v2.0.0发布时的实际错误经验制定，必须严格按序执行，特别是步骤5的文档提交环节。