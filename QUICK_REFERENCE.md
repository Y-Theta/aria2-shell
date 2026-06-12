# 快速参考

## 🚀 快速启动（3 步）

```bash
# 1. 进入项目目录
cd aria2-shell

# 2. 一键启动所有服务
./start-dev.sh

# 3. 打开浏览器
# Web UI: http://localhost:5173
# API: http://localhost:3001
```

## 📋 核心命令

```bash
# 验证项目设置
./verify-setup.sh

# 启动开发服务器
./start-dev.sh

# 手动启动 Mock API
cd mock-server && npm run dev

# 手动启动 Web UI
cd web && npm run dev

# 生产构建
cd web && npm run build

# 测试 API
curl http://localhost:3001/api/tasks | jq '.'
```

## 🎨 常见编辑任务

### 改变颜色主题
编辑 `web/src/styles/main.css` - 修改 `--primary-blue` 等变量

### 添加新组件
1. 创建 `web/src/components/NewComponent.vue`
2. 在 `App.vue` 中导入使用

### 修改任务列表字段
编辑 `web/src/components/TaskRow.vue` - 修改 grid 布局和显示字段

### 改变 Mock 数据
编辑 `mock-server/src/data.ts` - 修改 `mockTasks`、`mockStats` 等

### 添加 API 端点
1. 在 `mock-server/src/server.ts` 添加路由
2. 在 `web/src/api/client.ts` 添加方法

## 📁 重要文件位置

| 文件 | 位置 | 说明 |
|------|------|------|
| 全局样式 | `web/src/styles/main.css` | CSS 变量、设计令牌 |
| 类型定义 | `web/src/types/index.ts` | TypeScript 接口 |
| API 客户端 | `web/src/api/client.ts` | HTTP 请求方法 |
| 根组件 | `web/src/App.vue` | 主应用逻辑 |
| 组件库 | `web/src/components/` | 8 个 Vue 组件 |
| Mock 服务器 | `mock-server/src/server.ts` | API 端点定义 |
| Mock 数据 | `mock-server/src/data.ts` | 示例数据 |

## 🔑 CSS 变量快速查询

```css
/* 颜色 */
--primary-blue          /* 主题蓝 */
--success-green         /* 成功绿 */
--warning-orange        /* 警告橙 */
--error-red            /* 错误红 */
--neutral-gray         /* 中立灰 */

/* 状态颜色 */
--status-downloading   /* 下载中 */
--status-seeding       /* 播种中 */
--status-paused        /* 暂停 */

/* 间距 */
--spacing-xs/sm/md/lg/xl/2xl   /* 4px - 32px */

/* 尺寸 */
--sidebar-width        /* 240px */
--topbar-height        /* 60px */
--bottombar-height     /* 50px */
```

## 🐛 调试技巧

```bash
# 查看 Mock API 日志
tail -f mock-server.log

# 查看 Web Dev 日志
tail -f web-dev.log

# 测试 API 端点
curl http://localhost:3001/api/stats | jq '.'

# 创建新任务
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"url":"http://example.com/file.iso"}'

# 获取特定任务
curl http://localhost:3001/api/tasks/1 | jq '.'
```

## 📱 设备适配

```css
/* 响应式断点 */
@media (max-width: 1200px) { /* 平板 */ }
@media (max-width: 768px)  { /* 手机 */ }
```

## 🎯 常见问题速查

| 问题 | 解决方案 |
|------|--------|
| 端口被占用 | 修改 vite.config.ts 中的 port 或 mock-server package.json |
| Mock API 无响应 | 检查 mock-server.log，重启服务器 |
| HMR 不工作 | 检查浏览器控制台是否有错误 |
| 类型错误 | 运行 `npm install` 确保依赖完整 |
| 样式未应用 | 检查是否使用了正确的 CSS 变量名称 |

## 🗂️ 项目文件树

```
aria2-shell/
├── web/                          # 前端项目
│   ├── src/
│   │   ├── components/           # 8 个组件
│   │   ├── api/client.ts        # API 客户端
│   │   ├── types/index.ts       # 类型定义
│   │   ├── styles/main.css      # 全局样式
│   │   ├── App.vue              # 根组件
│   │   └── main.ts              # 入口
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── mock-server/                  # API 服务器
│   ├── src/
│   │   ├── server.ts            # Express 服务
│   │   ├── data.ts              # Mock 数据
│   │   └── types.ts             # 类型定义
│   ├── tsconfig.json
│   └── package.json
├── README.md                     # 项目介绍
├── DEVELOPMENT.md               # 开发指南
├── PROJECT_SUMMARY.md           # 项目总结
├── start-dev.sh                 # 启动脚本
└── verify-setup.sh              # 验证脚本
```

## 💻 开发工作流示例

### 添加新菜单项

1. 编辑 `web/src/components/Sidebar.vue`：
```typescript
const menuItems = [
  // ... 现有项
  { id: 'backup', label: 'Backup', icon: 'fas fa-save' }
]
```

2. 在 `web/src/App.vue` 处理：
```typescript
} else if (currentMenu.value === 'backup') {
  result = result.filter(t => /* 你的过滤条件 */)
}
```

3. 保存、浏览器自动刷新

### 改变任务行样式

编辑 `web/src/components/TaskRow.vue`：
```css
.task-row {
  grid-template-columns: /* 修改列宽 */
  padding: var(--spacing-xl) /* 修改内边距 */
}
```

### 新增 API 端点

1. `mock-server/src/server.ts`：
```typescript
app.get('/api/new-endpoint', (req, res) => {
  res.json(respond({ /* 数据 */ }));
});
```

2. `web/src/api/client.ts`：
```typescript
async getNewData() {
  const response = await this.client.get('/new-endpoint');
  return response.data.data;
}
```

## 📞 获取帮助

1. **查看文档**
   - README.md - 快速入门
   - DEVELOPMENT.md - 详细指南
   - PROJECT_SUMMARY.md - 项目详情

2. **查看日志**
   - mock-server.log - API 日志
   - web-dev.log - Web 日志

3. **查看代码**
   - 每个文件都有清晰的结构
   - 复杂逻辑都有注释

4. **浏览器调试**
   - F12 打开开发者工具
   - Network 标签查看 API 调用
   - Console 查看 JavaScript 错误

## 🎓 学习资源链接

- [Vue 3 文档](https://vuejs.org)
- [Vite 文档](https://vitejs.dev)
- [Express 文档](https://expressjs.com)
- [TypeScript 手册](https://www.typescriptlang.org/docs)
- [MDN Web 文档](https://developer.mozilla.org)

---

**提示**: 将此文件收藏书签，方便快速查询！
