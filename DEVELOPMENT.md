# 开发者指南

## 项目概览

BitStream 是一个现代化的下载管理器 Web UI，由以下部分组成：

- **Web UI** (`/web`): Vue3 + Vite + TypeScript 前端应用
- **Mock API** (`/mock-server`): 独立的 Express.js API 服务器

## 快速启动

### 首次设置

```bash
# 进入项目根目录
cd aria2-shell

# 验证项目设置
./verify-setup.sh

# 安装依赖（如果需要）
cd web && npm install
cd ../mock-server && npm install
cd ..
```

### 开发模式

```bash
# 一键启动（推荐）
./start-dev.sh

# 或手动启动两个终端

# 终端 1: Mock API
cd mock-server && npm run dev

# 终端 2: Web UI
cd web && npm run dev
```

## 文件结构和说明

### Web 项目结构

#### `/web/src/components/`
所有 Vue 组件都在这里。每个组件都是独立的，有自己的样式和逻辑。

**核心组件：**
- `Sidebar.vue` - 左侧导航栏
- `TopBar.vue` - 顶部操作栏
- `TaskList.vue` - 任务列表容器
- `TaskRow.vue` - 单个任务行（最复杂的组件）
- `ProgressBar.vue` - 进度条组件
- `StatusBadge.vue` - 状态徽章
- `ActionButtons.vue` - 操作按钮组
- `BottomStats.vue` - 底部统计显示

#### `/web/src/styles/main.css`
全局样式和设计令牌。所有组件都使用这里定义的 CSS 变量。

**CSS 变量分类：**
```css
/* 颜色 */
--primary-blue, --success-green, --warning-orange, --error-red

/* 状态颜色 */
--status-downloading, --status-seeding, --status-paused

/* 间距 */
--spacing-xs, --spacing-sm, --spacing-md, --spacing-lg, --spacing-xl

/* 组件尺寸 */
--sidebar-width, --topbar-height, --bottombar-height
```

#### `/web/src/types/index.ts`
TypeScript 类型定义。提供完整的类型安全。

**主要类型：**
- `Task` - 下载任务
- `TaskStatus` - 任务状态
- `Config` - 配置
- `Stats` - 统计信息
- `ApiResponse<T>` - API 响应格式

#### `/web/src/api/client.ts`
API 客户端封装。所有 HTTP 请求都通过这里。

**API 方法：**
```typescript
getTasks()           // 获取任务列表
getTaskById(id)      // 获取单个任务
createTask(url)      // 创建新任务
updateTask(id, data) // 更新任务
deleteTask(id)       // 删除任务
pauseTask(id)        // 暂停任务
resumeTask(id)       // 恢复任务
getStats()          // 获取统计数据
getConfig()         // 获取配置
updateConfig(data)  // 更新配置
```

#### `/web/src/App.vue`
根组件。管理全局状态和数据流。

**功能：**
- 加载初始数据
- 管理菜单切换
- 处理任务操作
- 实现搜索功能

### Mock Server 结构

#### `/mock-server/src/server.ts`
Express.js 服务器。定义所有 API 路由。

**路由：**
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/stats`
- `GET /api/config`
- `PUT /api/config`
- `GET /health`

#### `/mock-server/src/data.ts`
Mock 数据定义。用于初始化假数据。

**数据集：**
- `mockTasks[]` - 4 个示例任务
- `mockStats` - 统计数据
- `mockConfig` - 配置数据

#### `/mock-server/src/types.ts`
服务器端的 TypeScript 类型（与 Web 端共享概念）。

## 开发工作流

### 添加新的 UI 功能

1. **创建组件**
```vue
<!-- web/src/components/MyNewComponent.vue -->
<template>
  <div class="my-component">
    <!-- Your template -->
  </div>
</template>

<script setup lang="ts">
// Use composition API
import { ref, computed } from 'vue'

// Props
interface Props {
  title: string
}
defineProps<Props>()

// Emits
const emit = defineEmits<{
  click: [id: string]
}>()

// State
const count = ref(0)
</script>

<style scoped>
/* Use CSS variables from main.css */
.my-component {
  background-color: var(--bg-gray)
  padding: var(--spacing-lg)
  border-radius: var(--radius-md)
}
</style>
```

2. **在 App.vue 中导入和使用**
```typescript
import MyNewComponent from '../components/MyNewComponent.vue'
```

3. **测试 - Mock API 会自动返回示例数据**

### 修改 Mock 数据

编辑 `/mock-server/src/data.ts`：
```typescript
export const mockTasks: Task[] = [
  {
    id: '1',
    filename: 'example.iso',
    // ... other fields
  },
  // ...
]
```

重启 Mock 服务器后生效。

### 连接真实 API（未来）

1. 更新 `/web/src/api/client.ts` 中的 API 基础 URL
2. 适配真实 aria2 RPC 的响应格式
3. 实现配置的本地存储逻辑

## 样式系统详解

### CSS 变量命名规范

- **颜色变量**: `--{semantic-meaning}-{shade}`
  - 例: `--primary-blue`, `--status-downloading`
  
- **间距变量**: `--spacing-{size}`
  - 例: `--spacing-sm`, `--spacing-lg`
  
- **组件变量**: `--{component-name}-{property}`
  - 例: `--sidebar-width`, `--topbar-height`

### 响应式设计

全局 CSS 中的媒体查询断点：
- 手机: < 768px
- 平板: 768px - 1200px
- 桌面: > 1200px

组件中使用媒体查询：
```css
@media (max-width: 768px) {
  .component {
    /* Mobile styles */
  }
}
```

### 使用工具类

`main.css` 中预定义的工具类：
```html
<div class="flex gap-md">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<p class="text-muted truncate">文本会被截断</p>
```

## TypeScript 最佳实践

### 类型定义

```typescript
// ✓ 好的做法 - 明确类型
interface Task {
  id: string
  filename: string
  status: TaskStatus
}

// ✗ 不好的做法 - 使用 any
const task: any = {}
```

### Props 和 Events

```typescript
// ✓ 好的做法
interface Props {
  title: string
  count?: number
}

const emit = defineEmits<{
  update: [id: string, name: string]
}>()

// ✗ 不好的做法
defineProps(['title', 'count'])
emit('update', id)
```

## 常见任务

### 添加新的菜单项

1. 编辑 `web/src/components/Sidebar.vue`：
```typescript
const menuItems: MenuItem[] = [
  // ...
  { id: 'new-menu', label: 'New Menu', icon: 'fas fa-icon' },
]
```

2. 在 `web/src/App.vue` 中处理：
```typescript
if (currentMenu.value === 'new-menu') {
  result = result.filter(/* your filter */)
}
```

### 修改任务行展示的列

编辑 `web/src/components/TaskRow.vue` 中的 `grid-template-columns`

### 改变颜色主题

编辑 `web/src/styles/main.css` 中的颜色变量

### 添加新的 API 端点

1. 在 `mock-server/src/server.ts` 中添加路由
2. 在 `web/src/api/client.ts` 中添加方法
3. 在 `web/src/types/index.ts` 中定义返回类型

## 调试技巧

### 浏览器开发者工具

1. 打开 DevTools (F12)
2. 查看 Network 标签监控 API 调用
3. 查看 Console 标签查看错误日志

### Mock API 调试

```bash
# 测试特定端点
curl http://localhost:3001/api/tasks | jq '.'

# 创建新任务
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"url":"http://example.com/file.iso"}'
```

### Vue DevTools

安装 Vue DevTools 浏览器扩展，可以：
- 检查组件树
- 监控数据变化
- 追踪事件

## 性能优化建议

1. **组件分割** - 大型列表可以使用虚拟滚动
2. **数据分页** - 对大量任务进行分页
3. **缓存** - 减少不必要的 API 调用
4. **懒加载** - 图片和大型资源

## 部署

### 生产构建

```bash
cd web
npm run build
```

生成文件在 `dist/` 目录中。

### 服务器部署

使用任何静态 HTTP 服务器（Nginx, Apache, etc）或：
```bash
npm install -g http-server
http-server dist
```

## 常见问题

**Q: 修改代码后没有热重载？**
A: 检查终端中是否有错误，有时 TypeScript 错误会中断 HMR。

**Q: Mock API 返回 404？**
A: 确保 Mock 服务器仍在运行，使用 `curl http://localhost:3001/health` 检查。

**Q: CSS 变量未应用？**
A: 确保在 `<style scoped>` 中正确使用，不需要转义。

## 相关资源

- [Vue 3 文档](https://vuejs.org)
- [Vite 文档](https://vitejs.dev)
- [Express 文档](https://expressjs.com)
- [TypeScript 文档](https://www.typescriptlang.org)
- [FontAwesome](https://fontawesome.com)

## 获取帮助

- 检查浏览器控制台中的错误信息
- 查看 `mock-server.log` 和 `web-dev.log`
- 查看代码中的注释和类型提示
