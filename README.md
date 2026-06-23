# BitStream - Aria2 下载管理器

一个现代化的 Aria2 下载管理器，包含完整的 Web UI 和后端 API，支持任务管理、用户认证、设置配置等功能。

## 项目架构

```
aria2-shell/
├── web/              # 前端 Vue3 + Vite 项目
├── server/           # 后端 Fastify + TypeScript 服务器
└── .env              # 环境变量配置
```

## 核心特性

✨ **下载管理**
- 完整的任务列表（活跃、暂停、已完成）
- 添加、暂停、恢复、删除任务
- 实时速度和进度显示
- 支持 HTTP(S)/FTP/Magnet 链接

🎨 **UI/UX 设计**
- Vue3 + TypeScript 构建
- 响应式布局，支持移动端
- 深色/浅色主题切换
- 国际化支持（中文/英文）
- FontAwesome 图标库

🔐 **用户认证**
- 用户注册和登录
- JWT Token 认证
- 用户设置持久化

⚙️ **丰富的设置**
- 下载设置（最大任务数、速度限制）
- Aria2 连接配置
- 外观设置（主题、语言）
- 可配置的保存路径列表

📁 **文件系统浏览**
- 树状文件系统浏览
- 目录导航
- 路径选择功能

## 快速开始

### 环境要求
- Node.js >= 20
- npm >= 9
- Aria2 服务（需预先启动）

### 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# Server
PORT=65002

# Aria2
ARIA2_RPC_URL=http://localhost:6800/jsonrpc
ARIA2_RPC_SECRET=

# App
NODE_ENV=development
```

### 启动后端服务器

```bash
cd server
npm install
npm run dev
```

后端 API 运行在 `http://localhost:65002`

### 启动 Web 开发服务器

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
│   │   ├── settings/        # 设置相关组件
│   │   │   ├── SwitchControl.vue
│   │   │   ├── TextControl.vue
│   │   │   ├── NumberControl.vue
│   │   │   ├── CustomSelect.vue
│   │   │   ├── SettingItem.vue
│   │   │   ├── DownloadTab.vue
│   │   │   ├── Aria2Tab.vue
│   │   │   ├── AppearanceTab.vue
│   │   │   └── AboutTab.vue
│   │   ├── FileSelectorDialog.vue  # 文件选择对话框
│   │   ├── SettingsPanel.vue        # 设置面板
│   │   ├── Sidebar.vue              # 侧边栏
│   │   ├── TaskList.vue             # 任务列表
│   │   ├── TaskItem.vue             # 任务项
│   │   ├── TaskToolbar.vue          # 任务工具栏
│   │   ├── TaskFooter.vue           # 底部统计
│   │   ├── AddTaskDialog.vue        # 添加任务对话框
│   │   └── ConfirmDialog.vue        # 确认对话框
│   ├── views/               # 页面组件
│   │   ├── LoginPage.vue
│   │   ├── SettingsPage.vue
│   │   ├── ActiveTasks.vue
│   │   ├── PausedTasks.vue
│   │   ├── CompletedTasks.vue
│   │   └── Torrents.vue
│   ├── services/            # 业务服务
│   │   ├── settings.ts
│   │   ├── theme.ts
│   │   └── auth.ts
│   ├── i18n/                # 国际化
│   │   ├── index.ts
│   │   └── locales/
│   │       ├── zh-CN.ts
│   │       └── en-US.ts
│   ├── config/              # 配置
│   │   └── api.ts
│   ├── types/               # TypeScript 类型定义
│   │   ├── settings.ts
│   │   └── aria2.d.ts
│   ├── styles/              # 全局样式
│   │   └── main.css
│   ├── router/              # 路由
│   │   └── index.ts
│   ├── App.vue              # 根组件
│   └── main.ts              # 应用入口
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
└── package.json
```

### Server 项目 (`server/`)

```
server/
├── src/
│   ├── server.ts            # Fastify 服务器入口
│   ├── routes/              # API 路由
│   │   ├── auth.ts          # 认证路由（登录/注册）
│   │   ├── user.ts          # 用户路由（配置管理）
│   │   ├── aria2.ts         # Aria2 代理路由
│   │   └── filesystem.ts    # 文件系统路由
│   ├── aria2Client.ts       # Aria2 RPC 客户端
│   ├── store.ts             # 数据存储
│   ├── userService.ts       # 用户服务
│   └── types/               # 类型定义
│       ├── user.d.ts
│       └── aria2.d.ts
├── data/                    # 数据目录
│   └── store.json
├── dist/                    # 编译输出
├── tsconfig.json            # TypeScript 配置
├── tsup.config.ts           # TSUP 打包配置
└── package.json
```

## API 端点

### 认证
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册

### 用户配置
- `GET /api/user/configs` - 获取所有配置
- `POST /api/user/config` - 更新单个配置
- `POST /api/user/reset-configs` - 重置所有配置

### Aria2
- `POST /api/aria2/call` - 直接调用 Aria2 RPC
- `POST /api/aria2/add-uri` - 添加 URI 下载
- `GET /api/aria2/status/:gid` - 获取任务状态
- `GET /api/aria2/active` - 获取活跃任务
- `GET /api/aria2/waiting` - 获取等待任务
- `GET /api/aria2/stopped` - 获取已停止任务
- `POST /api/aria2/pause/:gid` - 暂停任务
- `POST /api/aria2/unpause/:gid` - 恢复任务
- `DELETE /api/aria2/remove/:gid` - 删除任务
- `DELETE /api/aria2/force-remove/:gid` - 强制删除任务
- `GET /api/aria2/global-stat` - 获取全局状态
- `GET /api/aria2/version` - 获取 Aria2 版本

### 文件系统
- `GET /api/filesystem/list` - 获取目录结构

## 开发指南

### 添加新组件

1. 在 `web/src/components/` 下创建新的 `.vue` 文件
2. 使用 `<style scoped>` 编写组件样式
3. 使用全局 CSS 变量保持设计一致性
4. 在需要的地方导入并使用

### 添加新的设置选项

1. 在 `web/src/types/settings.ts` 中添加类型定义
2. 在 `web/src/services/settings.ts` 中添加默认值
3. 在对应设置 Tab 组件中添加 UI
4. 更新 i18n 翻译文件

### 添加后端 API

1. 在 `server/src/routes/` 中创建或更新路由文件
2. 在 `server/src/server.ts` 中注册路由
3. 在 `web/src/config/api.ts` 中配置 API 基础 URL
4. 在前端创建服务函数调用 API

## 构建和部署

### 后端构建

```bash
cd server
npm run build
npm start
```

### 前端构建

```bash
cd web
npm run build
```

生成的文件在 `web/dist/` 目录中，可部署到任何静态 Web 服务器。

## 配置 Aria2

确保 Aria2 已启动并启用 RPC 功能：

```bash
aria2c --enable-rpc --rpc-listen-all --rpc-secret=your_secret
```

更新 `.env` 文件中的 `ARIA2_RPC_URL` 和 `ARIA2_RPC_SECRET` 配置。

## 设计系统

### 颜色变量
```css
--primary: #3b82f6               /* 主色 */
--primary-hover: #2563eb         /* 主色 Hover */
--danger: #ef4444                /* 危险色 */
--success-green: #22c55e         /* 成功/播种 */
--text-primary: #1f2937          /* 主文字 */
--text-secondary: #6b7280        /* 次要文字 */
--text-muted: #9ca3af            /* 弱化文字 */
--panel-bg: #ffffff              /* 面板背景 */
--bg-gray: #f9fafb               /* 浅灰背景 */
--border-gray: #e5e7eb           /* 边框色 */
--input-bg: #ffffff              /* 输入框背景 */
--input-border: #d1d5db          /* 输入框边框 */
--input-color: #1f2937           /* 输入框文字 */
--input-placeholder: #9ca3af     /* 输入框占位符 */
--input-focus-shadow: rgba(59, 130, 246, 0.1)
```

### 深色主题
```css
html[data-theme="dark"] {
  --panel-bg: #1f2937
  --bg-gray: #111827
  --border-gray: #374151
  --text-primary: #f9fafb
  --text-secondary: #d1d5db
  --text-muted: #9ca3af
  --input-bg: #374151
  --input-border: #4b5563
  --input-color: #f9fafb
}
```

## 常见问题

**Q: 启动时出现端口被占用错误**
A: 修改 `.env` 文件中的 `PORT` 配置

**Q: Aria2 连接失败**
A: 确保 Aria2 RPC 服务已启动，检查 `.env` 文件中的连接配置

**Q: 如何重置所有设置**
A: 在设置面板的 "关于" 标签页中点击 "恢复默认"

**Q: 如何添加新的语言**
A: 在 `web/src/i18n/locales/` 中添加新的语言文件，并在 `web/src/i18n/index.ts` 中注册

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！