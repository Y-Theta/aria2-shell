# BitStream - Web UI

一个使用 Vue3 + Vite + TypeScript 构建的现代化下载管理器 Web UI，支持 aria2 RPC 集成。

## 项目架构

```
aria2-shell/
├── web/              # 前端 Vue3 + Vite 项目
├── mock-server/      # 独立的 Mock API 服务器
└── start-dev.sh      # 快速启动脚本
```

## 核心特性

✨ **组件化架构**
- 18+ Vue3 独立组件
- 每个组件独立维护自身样式
- 全局设计令牌统一管理

🎨 **样式系统**
- 全局 CSS 变量管理
- 每个组件使用 scoped CSS
- 响应式布局支持
- FontAwesome 图标库

🔌 **API 架构**
- Mock API 独立项目
- 支持真实 aria2 RPC 集成（预留）
- 本地配置存储支持

⚡ **开发体验**
- 快速热重载 (HMR)
- TypeScript 完全支持
- 简单的启动流程

## 快速开始

### 方式 1: 使用启动脚本（推荐）

```bash
./start-dev.sh
```

这将同时启动 Mock API 服务器和 Web 开发服务器。

### 方式 2: 手动启动

**启动 Mock API 服务器：**
```bash
cd mock-server
npm install
npm run dev
```
Mock API 运行在 `http://localhost:3001`

**启动 Web 开发服务器（新终端）：**
```bash
cd web
npm install
npm run dev
```
Web UI 运行在 `http://localhost:5173`

## 项目结构详解

### Web 项目 (`web/`)

```
web/
├── src/
│   ├── components/          # Vue 组件库
│   │   ├── Sidebar.vue      # 左侧导航栏
│   │   ├── TopBar.vue       # 顶部操作栏
│   │   ├── TaskList.vue     # 任务列表容器
│   │   ├── TaskRow.vue      # 单个任务行
│   │   ├── ProgressBar.vue  # 进度条
│   │   ├── StatusBadge.vue  # 状态徽章
│   │   ├── ActionButtons.vue# 操作按钮
│   │   └── BottomStats.vue  # 底部统计
│   ├── api/
│   │   └── client.ts        # API 客户端 (axios)
│   ├── types/
│   │   └── index.ts         # TypeScript 类型定义
│   ├── styles/
│   │   └── main.css         # 全局样式和设计令牌
│   ├── App.vue              # 根组件
│   └── main.ts              # 应用入口
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
└── package.json
```

### Mock API 项目 (`mock-server/`)

```
mock-server/
├── src/
│   ├── server.ts            # Express 服务器
│   ├── data.ts              # Mock 数据定义
│   └── types.ts             # TypeScript 类型
├── tsconfig.json            # TypeScript 配置
└── package.json
```

## API 端点

Mock API 提供以下端点：

### 任务管理
- `GET /api/tasks` - 获取所有任务
- `GET /api/tasks/:id` - 获取单个任务
- `POST /api/tasks` - 创建新任务
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务

### 统计数据
- `GET /api/stats` - 获取统计信息

### 配置管理
- `GET /api/config` - 获取配置
- `PUT /api/config` - 更新配置

### 健康检查
- `GET /health` - 服务器健康状态

## 设计令牌

全局样式中定义的 CSS 变量（`src/styles/main.css`）：

### 颜色
```css
--primary-blue: #1f6feb           /* 主色 */
--success-green: #2da44e          /* 成功/播种 */
--warning-orange: #fb8500         /* 警告 */
--error-red: #da3633              /* 错误 */
--neutral-gray: #6e7681           /* 中性灰 */
```

### 状态颜色
```css
--status-downloading: #1f6feb     /* 下载中 */
--status-seeding: #2da44e         /* 播种中 */
--status-paused: #6e7681          /* 暂停 */
--status-completed: #2da44e       /* 已完成 */
--status-error: #da3633           /* 错误 */
```

### 间距
```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 12px
--spacing-lg: 16px
--spacing-xl: 24px
--spacing-2xl: 32px
```

## 开发指南

### 添加新组件

1. 在 `src/components/` 下创建新的 `.vue` 文件
2. 使用 `<style scoped>` 编写组件样式
3. 使用全局 CSS 变量 (如 `var(--primary-blue)`)
4. 在需要的地方导入并使用

示例组件结构：
```vue
<template>
  <div class="my-component">
    <!-- Content -->
  </div>
</template>

<script setup lang="ts">
// Your component logic
</script>

<style scoped>
.my-component {
  background-color: var(--bg-gray);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
}
</style>
```

### 调用 API

使用 `src/api/client.ts` 中的 API 客户端：

```typescript
import apiClient from '../api/client';

// 获取任务
const tasks = await apiClient.getTasks();

// 暂停任务
await apiClient.pauseTask(taskId);

// 获取配置
const config = await apiClient.getConfig();
```

### 生成类型定义

所有 API 响应类型在 `src/types/index.ts` 中定义，提供完整的 TypeScript 支持。

## 构建和部署

### 生产构建

```bash
cd web
npm run build
```

生成的文件在 `web/dist/` 目录中。

## 与 aria2 集成

当前使用 Mock API 开发。要连接真实的 aria2 实例：

1. 在 `web/src/api/client.ts` 中修改 API 基础 URL
2. 或在 `web/vite.config.ts` 中配置代理指向 aria2 RPC 端点
3. 服务器端配置本地存储实现

## 日志

- Mock API 日志: `mock-server.log`
- Web Dev 日志: `web-dev.log`

## 环境要求

- Node.js >= 16
- npm >= 8

## 常见问题

**Q: 启动时出现端口被占用错误**
A: 修改相应项目的 `vite.config.ts` 或 `package.json` 中的端口配置

**Q: Mock API 无法连接**
A: 确保 Mock API 服务器已启动，检查 `mock-server.log` 文件

**Q: TypeScript 类型错误**
A: 运行 `npm install` 确保所有依赖已安装

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
