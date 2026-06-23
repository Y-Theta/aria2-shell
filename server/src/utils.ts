import fs from 'fs';
import path from 'path';

/**
 * 从当前目录向上查找 .env 文件
 * 优先查找下级目录（从项目根目录）
 */
export function loadEnv(fileName = '.env'): void {
    const cwd = process.cwd();
    let dir = cwd;
    
    const found = findEnv(dir, fileName);
    if (found) {
        loadEnvFile(found);
        return;
    }

    // 从当前目录向上查找直到根目录
    while (dir !== path.dirname(dir)) {
        dir = path.dirname(dir);
        const found = findEnv(dir, fileName);
        if (found) {
            loadEnvFile(found);
            return;
        }
    }
}

function findEnv(dir: string, fileName: string): string | null {
    const filePath = path.join(dir, fileName);
    if (fs.existsSync(filePath)) {
        return filePath;
    }

    // 同时检查 common 目录的父目录（项目根目录）
    const projectRoot = path.join(dir, '..', '..');
    const projectFilePath = path.join(projectRoot, fileName);
    if (fs.existsSync(projectFilePath)) {
        return projectFilePath;
    }

    return null;
}

function loadEnvFile(filePath: string): void {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        let loaded = 0;
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const eqIndex = trimmed.indexOf('=');
                if (eqIndex > 0) {
                    const key = trimmed.slice(0, eqIndex).trim();
                    const value = trimmed.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, '');
                    if (key && process.env[key] === undefined) {
                        process.env[key] = value;
                        loaded++;
                    }
                }
            }
        }

        if (loaded > 0) {
            console.log(`Loaded ${loaded} variable(s) from ${filePath}`);
        }
    } catch (error) {
        console.warn(`Warning: Could not load .env file from ${filePath}`);
    }
}