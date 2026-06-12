# 架构设计文档

## 系统架构概览

```
┌─────────────────────────────────────────────────────────┐
│                     用户浏览器                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Vue3 Web UI (http://5173)              │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │  App.vue (根组件，状态管理)               │ │  │
│  │  ├────────────────────────────────────────────┤ │  │
│  │  │  Sidebar │  TopBar   │  Content  │ Bottom  │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  │                                                  │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │  axios API Client (src/api/client.ts)     │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│           HTTP/JSON ↕ (代理到 :3001)                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│         Express.js API Server (http://3001)            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         9 个 RESTful API 路由                    │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ GET    /api/tasks         - 获取所有任务        │  │
│  │ POST   /api/tasks         - 创建新任务          │  │
│  │ GET    /api/tasks/:id     - 获取单个任务        │  │
│  │ PUT    /api/tasks/:id     - 更新任务            │  │
│  │ DELETE /api/tasks/:id     - 删除任务            │  │
│  │ GET    /api/stats         - 获取统计            │  │
│  │ GET    /api/config        - 获取配置            │  │
│  │ PUT    /api/config        - 更新配置            │  │
│  │ GET    /health            - 健康检查            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │       内存数据存储 (src/data.ts)                │  │
│  │  • mockTasks[]    - 4 个示例任务                │  │
│  │  • mockStats      - 统计数据                    │  │
│  │  • mockConfig     - 配置数据                    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│         未来：真实 aria2 RPC (可选)                     │
│              http://localhost:6800                      │
└─────────────────────────────────────────────────────────┘
```

## 分层架构

### 前端层 (Web UI)

```
┌─────────────────────────────────────┐
│      Presentation Layer              │
│  ┌──────────────────────────────────┐│
│  │  Vue Components (8)              ││
│  │  • UI 渲染                       ││
│  │  • 用户交互处理                   ││
│  │  • 事件发射                       ││
│  └──────────────────────────────────┘│
├─────────────────────────────────────┤
│      Business Logic Layer            │
│  ┌──────────────────────────────────┐│
│  │  App.vue                         ││
│  │  • 状态管理                       ││
│  │  • 数据流控制                     ││
│  │  • 菜单/搜索逻辑                  ││
│  └──────────────────────────────────┘│
├─────────────────────────────────────┤
│      Data Access Layer               │
│  ┌──────────────────────────────────┐│
│  │  API Client                      ││
│  │  • HTTP 请求                     ││
│  │  • 响应处理                       ││
│  │  • 错误处理                       ││
│  └──────────────────────────────────┘│
├─────────────────────────────────────┤
│      Style Layer                     │
│  ┌──────────────────────────────────┐│
│  │  CSS 系统                        ││
│  │  • 全局变量 (main.css)           ││
│  │  • 组件样式 (scoped)             ││
│  │  • 响应式设计                     ││
│  └──────────────────────────────────┘│
├─────────────────────────────────────┤
│      Type Layer                      │
│  ┌──────────────────────────────────┐│
│  │  TypeScript                      ││
│  │  • 接口定义                       ││
│  │  • 类型检查                       ││
│  │  • IDE 支持                       ││
│  └──────────────────────────────────┘│
└─────────────────────────────────────┘
```

### 后端层 (Mock API)

```
┌─────────────────────────────────────┐
│      API Routing Layer               │
│  ┌──────────────────────────────────┐│
│  │  Express Router                  ││
│  │  • 请求映射                       ││
│  │  • 路由匹配                       ││
│  │  • 中间件处理                     ││
│  └──────────────────────────────────┘│
├─────────────────────────────────────┤
│      Business Logic Layer            │
│  ┌──────────────────────────────────┐│
│  │  Handler Functions               ││
│  │  • 请求处理                       ││
│  │  • 数据验证                       ││
│  │  • 业务逻辑                       ││
│  └──────────────────────────────────┘│
├─────────────────────────────────────┤
│      Data Layer                      │
│  ┌──────────────────────────────────┐│
│  │  In-Memory Storage               ││
│  │  • Task 数据                      ││
│  │  • Stats 数据                     ││
│  │  • Config 数据                    ││
│  └──────────────────────────────────┘│
├─────────────────────────────────────┤
│      Response Layer                  │
│  ┌──────────────────────────────────┐│
│  │  Response Handler                ││
│  │  • JSON 序列化                    ││
│  │  • 标准格式                       ││
│  │  • 错误响应                       ││
│  └──────────────────────────────────┘│
└─────────────────────────────────────┘
```

## 数据流

### 初始化流程

```
应用启动
    ↓
main.ts 入口
    ↓
createApp(App)
    ↓
App.vue 挂载
    ↓
onMounted() 钩子
    ↓
apiClient.getTasks()
    ↓
HTTP GET /api/tasks
    ↓
Mock Server 处理
    ↓
返回 { success: true, data: Task[] }
    ↓
tasks.value = data
    ↓
计算属性 filteredTasks 更新
    ↓
组件树重新渲染
```

### 用户交互流程

```
用户点击 Sidebar 菜单
    ↓
selectMenu() 触发
    ↓
发送 window.dispatchEvent('menu-change')
    ↓
App.vue 监听事件
    ↓
currentMenu.value 更新
    ↓
computed filteredTasks 重新计算
    ↓
TaskList 接收新数据
    ↓
组件重新渲染
```

### 任务操作流程

```
用户点击 "暂停" 按钮
    ↓
ActionButtons 发送 emit('pause')
    ↓
TaskRow 接收事件
    ↓
TaskRow 发送 emit('pause', taskId)
    ↓
TaskList 接收事件
    ↓
TaskList 发送 emit('pause', taskId)
    ↓
App.vue handlePause() 处理
    ↓
apiClient.pauseTask(id) API 调用
    ↓
HTTP PUT /api/tasks/:id { status: 'paused' }
    ↓
Mock Server 更新数据
    ↓
返回更新后的 Task
    ↓
App.vue 更新本地 tasks 数组
    ↓
UI 自动更新
```

## 组件通信

```
        App.vue (根组件)
            |
    ┌───────┼───────────┬──────────────┐
    |       |           |              |
 Sidebar  TopBar    TaskList      BottomStats
    |       |           |
    |       |      ┌────┴────┐
    |       |      |         |
    |       |   TaskRow  TaskRow...
    |       |      |
    |       |  ┌───┴────┐
    |       |  |        |
    |       |ProgressBar StatusBadge
    |       |  ActionButtons

通信方式：
- 向上：emit() 事件
- 向下：props 传递
- 全局：window.dispatchEvent()
- 跨域：HTTP API
```

## 类型系统

```
Task (任务)
├── id: string
├── filename: string
├── status: TaskStatus ('downloading'|'seeding'|'paused'|'completed'|'error')
├── progress: number (0-100)
├── totalSize: number
├── completedSize: number
├── downloadSpeed: number
├── uploadSpeed: number
├── eta: number | null
├── seeders?: number
├── ratio?: number
└── infoHash?: string

Stats (统计)
├── totalDownloadSpeed: number
├── totalUploadSpeed: number
├── activeTasks: number
├── completedTasks: number
└── pausedTasks: number

Config (配置)
├── rpcUrl: string
├── rpcSecret: string
├── autoStart: boolean
├── maxConnections: number
├── maxDownloadSpeed: number
└── maxUploadSpeed: number

ApiResponse<T>
├── success: boolean
├── data?: T
└── error?: string
```

## 样式层次

```
CSS 变量 (main.css)
    ↓
全局样式 (重置、工具类)
    ↓
组件样式 (scoped)
    ├── Sidebar.vue <style scoped>
    ├── TopBar.vue <style scoped>
    ├── TaskRow.vue <style scoped>
    ├── ProgressBar.vue <style scoped>
    ├── StatusBadge.vue <style scoped>
    ├── ActionButtons.vue <style scoped>
    ├── TaskList.vue <style scoped>
    └── BottomStats.vue <style scoped>
    ↓
浏览器渲染引擎
    ↓
最终样式应用
```

## API 端点设计

```
/api/tasks
├── GET      → 获取所有任务列表
├── POST     → 创建新任务
└── /{id}
    ├── GET      → 获取单个任务详情
    ├── PUT      → 更新任务（暂停、恢复等）
    └── DELETE   → 删除任务

/api/stats
└── GET      → 获取实时统计数据

/api/config
├── GET      → 获取当前配置
└── PUT      → 更新配置

/health
└── GET      → 服务器健康检查
```

## 部署架构

### 开发环境
```
开发机
├── Vite Dev Server (5173)
│   └── Hot Module Replacement
├── Mock API Server (3001)
│   └── Express with nodemon
└── 浏览器 DevTools
```

### 生产环境
```
CDN / Web Server
├── 静态文件
│   ├── index.html
│   ├── js/
│   ├── css/
│   └── assets/
└── 反向代理
    └── API Gateway
        ├── /api -> 真实 API
        └── /     -> SPA

真实后端
├── aria2 RPC (6800)
├── 配置存储 (数据库)
└── 用户认证 (可选)
```

## 扩展点

### 1. API 切换
```
当前: Mock API (内存存储)
切换: 真实 aria2 RPC
位置: web/src/api/client.ts 中的 baseURL
```

### 2. 数据存储
```
当前: Mock Server 内存
升级: 数据库存储
实现: 配置、历史记录存储
```

### 3. 认证系统
```
位置: Express 中间件
实现: JWT 或 Session
保护: 所有 API 端点
```

### 4. 实时更新
```
当前: 5秒轮询
升级: WebSocket
位置: App.vue + Mock Server
```

### 5. 国际化
```
工具: vue-i18n
位置: 所有文本内容
支持: 多语言切换
```

## 性能优化方案

### 前端优化
1. **代码分割** - 组件懒加载
2. **虚拟滚动** - 长列表优化
3. **缓存** - 数据缓存策略
4. **防抖/节流** - 搜索优化

### 后端优化
1. **分页** - API 响应分页
2. **缓存** - 数据缓存层
3. **数据库索引** - 查询优化
4. **连接池** - 资源管理

## 安全考虑

### 前端安全
- [x] HTTPS 使用 (生产环境)
- [x] XSS 防护 (Vue 自动处理)
- [x] CSRF 防护 (Token 验证)
- [ ] 敏感数据加密

### 后端安全
- [x] CORS 配置
- [ ] 认证/授权
- [ ] 输入验证
- [ ] 速率限制
- [ ] SQL 注入防护

## 监控和日志

### 前端监控
```
// 可添加的监控
- 页面加载时间
- API 响应时间
- 错误跟踪
- 用户行为分析
```

### 后端日志
```
// 当前日志
- 服务器启动
- 请求处理
- 错误信息

// 可增加的日志
- 详细请求日志
- 性能指标
- 审计日志
```

---

**版本**: 1.0  
**最后更新**: 2026-06-12  
**设计师**: Copilot
