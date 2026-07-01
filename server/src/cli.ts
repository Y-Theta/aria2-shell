#!/usr/bin/env node
import { loadEnv } from "./utils.js";
import { initDb } from "./store.js";
import { userService } from "./userService.js";
import readline from "readline";

// Load .env from project root
loadEnv();

// 初始化数据库
initDb();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve));
}

async function registerUser() {
    console.log("=== 注册新用户 ===\n");

    const username = await question("请输入用户名: ");
    if (!username.trim()) {
        console.error("用户名不能为空！");
        process.exit(1);
    }

    const existingUser = userService.getUserByUsername(username.trim());
    if (existingUser) {
        console.error(`用户 ${username} 已存在！`);
        process.exit(1);
    }

    const password = await question("请输入密码 (至少6位): ");
    if (!password || password.length < 6) {
        console.error("密码长度至少为6位！");
        process.exit(1);
    }

    const confirmPassword = await question("请再次输入密码: ");
    if (password !== confirmPassword) {
        console.error("两次输入的密码不一致！");
        process.exit(1);
    }

    const user = userService.createUser(username.trim(), password);
    const token = userService.generateToken(user);

    console.log("\n=== 用户创建成功 ===");
    console.log("用户信息:");
    console.log(`  ID: ${user.id}`);
    console.log(`  用户名: ${user.username}`);
    console.log(`  密码: ${password}`);
    console.log(`  创建时间: ${new Date(user.created_at).toLocaleString()}`);
    console.log("\n访问令牌 (Token):");
    console.log(`  ${token}`);
    console.log("\n配置信息:");
    console.log(JSON.stringify({
        userId: user.id,
        username: user.username,
        password: password,
        token: token
    }, null, 2));

    rl.close();
}

async function listUsers() {
    console.log("=== 用户列表 ===\n");

    const users = userService.getAllUsers();
    if (users.length === 0) {
        console.log("暂无用户");
        rl.close();
        return;
    }

    console.log(`共 ${users.length} 个用户:\n`);
    users.forEach((user, index) => {
        const password = userService.getUserPassword(user.id);
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   用户名: ${user.username}`);
        console.log(`   密码: ${password || '未知'}`);
        console.log(`   创建时间: ${new Date(user.created_at).toLocaleString()}`);
        console.log(`   更新时间: ${new Date(user.updated_at).toLocaleString()}`);
        console.log();
    });

    rl.close();
}

async function showUser() {
    console.log("=== 查看用户信息 ===\n");

    const users = userService.getAllUsers();
    if (users.length === 0) {
        console.log("暂无用户");
        rl.close();
        return;
    }

    console.log("可用用户:");
    users.forEach(user => {
        console.log(`  ${user.id}. ${user.username}`);
    });
    console.log();

    const userIdStr = await question("请输入用户ID: ");
    const userId = parseInt(userIdStr);
    if (isNaN(userId)) {
        console.error("无效的用户ID！");
        process.exit(1);
    }

    const user = userService.getUserById(userId);
    if (!user) {
        console.error("用户不存在！");
        process.exit(1);
    }

    const password = userService.getUserPassword(userId);
    const token = userService.generateToken(user);

    console.log("\n=== 用户信息 ===");
    console.log(`  ID: ${user.id}`);
    console.log(`  用户名: ${user.username}`);
    console.log(`  密码: ${password || '未知'}`);
    console.log(`  创建时间: ${new Date(user.created_at).toLocaleString()}`);
    console.log(`  更新时间: ${new Date(user.updated_at).toLocaleString()}`);
    console.log("\n访问令牌 (Token):");
    console.log(`  ${token}`);

    const userConfigs = userService.getAllUserConfigs(userId);
    if (userConfigs.length > 0) {
        console.log("\n用户配置:");
        userConfigs.forEach(config => {
            console.log(`  ${config.key}: ${config.value}`);
        });
    }

    rl.close();
}

function createUserNonInteractive(username: string, password: string) {
    username = username.trim();
    if (!username) {
        console.error("用户名不能为空！");
        process.exit(1);
    }

    if (!password || password.length < 6) {
        console.error("密码长度至少为6位！");
        process.exit(1);
    }

    const existingUser = userService.getUserByUsername(username);
    if (existingUser) {
        console.log(`用户 ${username} 已存在，跳过创建`);
        return;
    }

    const user = userService.createUser(username, password);
    console.log(`默认管理员用户已创建: ${username}`);
}

// 解析命令行参数
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log("使用方法:");
    console.log("  node dist/cli.js register              - 注册新用户（交互式）");
    console.log("  node dist/cli.js list                  - 显示用户列表");
    console.log("  node dist/cli.js show                  - 查看用户详细信息");
    console.log("  node dist/cli.js create <user> <pass>  - 非交互式创建用户");
    console.log();
    console.log("  tsx src/cli.ts register                - 开发环境注册新用户");
    console.log("  tsx src/cli.ts list                    - 开发环境显示用户列表");
    console.log("  tsx src/cli.ts show                    - 开发环境查看用户详细信息");
    console.log("  tsx src/cli.ts create <user> <pass>    - 开发环境非交互式创建用户");
    process.exit(0);
}

const command = args[0];
switch (command) {
    case "register":
        await registerUser();
        break;
    case "list":
        await listUsers();
        break;
    case "show":
        await showUser();
        break;
    case "create":
        if (args.length < 3) {
            console.error("用法: cli create <username> <password>");
            process.exit(1);
        }
        createUserNonInteractive(args[1], args[2]);
        break;
    default:
        console.error(`未知命令: ${command}`);
        process.exit(1);
}