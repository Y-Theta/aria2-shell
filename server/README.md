# aria2-shell Server API

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Configure Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=65004

# Aria2 Configuration
ARIA2_RPC_URL=http://localhost:6800/jsonrpc
ARIA2_SECRET=
```

### Run Development Server

```bash
pnpm dev
```

## API Tests

This project includes a comprehensive API test file `test-api.http` that can be used with:

1. **VSCode REST Client Extension** (recommended)
2. **YAC (Yet Another Client)**
3. Any HTTP client tool that supports this format

### Running the Tests

1. Start the server: `pnpm dev`
2. Open `test-api.http` in VSCode
3. Install the "REST Client" extension by Huachao Mao
4. Click "Send Request" above each test step

### Test Steps

The tests cover all main API endpoints:

1. **User Registration** - Create a test user
2. **User Login** - Authenticate and get token
3. **Get User Info** - Retrieve current user profile
4. **Change Password** - Update user password
5. **Set Config** - Create user configuration
6. **Get Config** - Retrieve specific configuration
7. **Get All Configs** - List all user configurations
8. **Delete Config** - Remove a configuration
9. **Call Aria2** - Directly call aria2 RPC methods
10. **Add URI** - Add a download task
11. **Get Task Status** - Check status of a task
12. **Get Aria2 Version** - Retrieve aria2 version info
13. **Get Global Stat** - Get aria2 global statistics
14. **Get Active Tasks** - List active downloads
15. **Get Waiting Tasks** - List waiting downloads
16. **Get Stopped Tasks** - List stopped/completed downloads

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### User Config

- `POST /api/user/config` - Set config
- `GET /api/user/config/:key` - Get config
- `GET /api/user/configs` - Get all configs
- `DELETE /api/user/config/:key` - Delete config

### Aria2 Integration

- `POST /api/aria2/call` - Call any aria2 RPC method
- `POST /api/aria2/add-uri` - Add a download task
- `GET /api/aria2/status/:gid` - Get task status
- `GET /api/aria2/active` - List active tasks
- `GET /api/aria2/waiting` - List waiting tasks
- `GET /api/aria2/stopped` - List stopped tasks
- `POST /api/aria2/pause/:gid` - Pause a task
- `POST /api/aria2/unpause/:gid` - Resume a task
- `DELETE /api/aria2/remove/:gid` - Remove a task
- `DELETE /api/aria2/force-remove/:gid` - Force remove a task
- `GET /api/aria2/global-stat` - Get global stats
- `GET /api/aria2/version` - Get aria2 version