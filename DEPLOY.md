# 部署指南

## 目录
- [Server 部署](#server-部署)
- [Web 部署](#web-部署)
- [Nginx 反向代理配置](#nginx-反向代理配置)
- [完整部署示例](#完整部署示例)

---

## Server 部署

### 1. 准备部署文件

从 GitHub Releases 下载 `aria2-server.zip`，解压后目录结构：

```
server/
├── dist/              # 编译后的代码
├── data/             # 数据目录（自动创建）
├── package.json
└── .env.example
```

### 2. 安装依赖

```bash
cd server
npm install --production
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env`，根据实际情况修改：

```bash
cp .env.example .env
```

**重要配置项：**

```env
# 服务端口
PORT=65002

# 生产环境
NODE_ENV=production

# JWT 密钥（必须修改为强密码！）
JWT_SECRET=your-very-secure-secret-key-change-this-in-production

# Aria2 配置
ARIA2_RPC_URL=http://localhost:6800/jsonrpc
ARIA2_SECRET=your-aria2-secret

# 数据存储目录（建议使用绝对路径）
DATA_DIR=/var/lib/aria2-shell/data
```

### 4. 使用 CLI 注册用户

在启动 server 前，需要先注册用户：

```bash
npm run cli:register
```

按照提示输入用户名和密码，系统会生成访问 token。

### 5. 启动 Server

**方式一：直接启动（不推荐用于生产）**
```bash
npm start
```

**方式二：使用 PM2（推荐）**
```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start dist/server.js --name aria2-server

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs aria2-server
```

**方式三：使用 systemd**
创建 `/etc/systemd/system/aria2-server.service`：

```ini
[Unit]
Description=Aria2 Shell Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/aria2-shell/server
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
systemctl daemon-reload
systemctl enable aria2-server
systemctl start aria2-server
```

---

## Web 部署

### 1. 准备部署文件

从 GitHub Releases 下载 `aria2-web.zip`，解压后得到 `web/dist/` 目录。

### 2. 配置 API 地址

在部署前，你有两种方式配置前端连接后端：

**方式一：构建时配置（推荐）**

在项目根目录创建 `.env.production`：

```env
VITE_API_BASE_URL=https://your-domain.com/api
VITE_SKIP_LOGIN=false
```

然后重新构建：

```bash
cd web
npm install
npm run build
```

**方式二：使用 Nginx 子路径**

前端和后端使用相同域名，通过路径区分（见下文 Nginx 配置）。

### 3. 部署到 Web 服务器

#### 使用 Nginx

```bash
# 复制文件到 web 根目录
cp -r web/dist/* /var/www/aria2-shell/
```

#### 使用 Apache

```bash
cp -r web/dist/* /var/www/html/aria2-shell/
```

---

## Nginx 反向代理配置

### 完整 Nginx 配置示例

`/etc/nginx/sites-available/aria2-shell.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Web 前端
    location / {
        root /var/www/aria2-shell;
        index index.html;
        
        # SPA 路由支持
        try_files $uri $uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Server API 代理
    location /api {
        proxy_pass http://localhost:65002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS 配置（如果前后端不在同一域名）
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
    }
    
    # 启用 HTTPS（推荐使用 Let's Encrypt）
    # listen 443 ssl http2;
    # listen [::]:443 ssl http2;
    # ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
}

# HTTP 重定向到 HTTPS（如果启用 HTTPS）
# server {
#     listen 80;
#     server_name your-domain.com;
#     return 301 https://$server_name$request_uri;
# }
```

启用配置：

```bash
# 创建软链接
ln -s /etc/nginx/sites-available/aria2-shell.conf /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

---

## 完整部署示例

### 1. 服务器准备

```bash
# 创建应用目录
mkdir -p /var/www/aria2-shell
cd /var/www/aria2-shell

# 设置权限
chown -R www-data:www-data /var/www/aria2-shell
```

### 2. 部署 Server

```bash
# 解压 server 包
unzip aria2-server.zip -d server
cd server

# 安装依赖
npm install --production

# 配置环境变量
cp .env.example .env
nano .env  # 修改配置

# 注册用户
npm run cli:register

# 启动服务（使用 PM2）
pm2 start dist/server.js --name aria2-server
pm2 save
pm2 startup
```

### 3. 部署 Web

```bash
# 解压 web 包
unzip aria2-web.zip -d web

# 复制到 Nginx 目录
cp -r web/dist/* /var/www/aria2-shell/
```

### 4. 配置 Nginx

创建配置文件并启用（见上文）。

### 5. 验证部署

访问以下地址检查是否正常：
- 前端：`https://your-domain.com/`
- 后端：`https://your-domain.com/api/`

---

## 常见问题

### 1. 前端无法连接后端

**检查清单：**
- 确认 `VITE_API_BASE_URL` 配置正确
- 检查 Nginx 代理配置
- 查看浏览器控制台的网络请求
- 确认 server 正在运行：`pm2 status`

### 2. Server 无法连接 Aria2

**检查清单：**
- 确认 Aria2 正在运行：`ps aux | grep aria2c`
- 检查 Aria2 RPC 地址和密钥配置
- 测试 RPC 连接：`curl http://localhost:6800/jsonrpc`

### 3. 数据持久化

确保 `DATA_DIR` 目录存在且有写权限：

```bash
mkdir -p /var/lib/aria2-shell/data
chown www-data:www-data /var/lib/aria2-shell/data
```

### 4. 日志查看

```bash
# PM2 日志
pm2 logs aria2-server

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 安全建议

1. **修改 JWT_SECRET**：使用强随机字符串
2. **启用 HTTPS**：使用 Let's Encrypt 免费证书
3. **配置防火墙**：只开放必要端口（80, 443）
4. **定期备份**：备份 `DATA_DIR` 目录
5. **更新依赖**：定期运行 `npm audit` 检查安全漏洞