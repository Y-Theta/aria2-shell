import { API_CONFIG } from '../config/api'
import { getAuthHeaders } from './auth'
import type { Aria2Status } from '@common/aria2'
import type { Task, TorrentFile, ListResponse, GidResponse } from '@common/types'

function getTaskName(status: Aria2Status): string {
    if (status.bittorrent?.info?.name) {
        return status.bittorrent.info.name
    }
    if (status.files && status.files.length > 0) {
        const firstFile = status.files[0]
        const pathParts = firstFile.path.split(/[/\\]/)
        const fileName = pathParts[pathParts.length - 1] || firstFile.path
        if (status.files.length === 1) {
            return fileName
        }
        return fileName || `Task ${status.gid}`
    }
    return `Task ${status.gid}`
}

function mapAria2Status(aria2Status: string): Task['status'] {
    switch (aria2Status) {
        case 'active':
            return 'downloading'
        case 'complete':
            return 'completed'
        case 'paused':
            return 'paused'
        case 'error':
            return 'error'
        case 'waiting':
            return 'waiting'
        default:
            return 'paused'
    }
}

function getFileProgress(file: { length: string; completedLength: string }): number {
    const total = parseInt(file.length, 10)
    const completed = parseInt(file.completedLength, 10)
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
}

function mapAria2StatusToTask(status: Aria2Status): Task {
    const totalSize = parseInt(status.totalLength, 10)
    const completedSize = parseInt(status.completedLength, 10)
    const progress = totalSize > 0 ? Math.round((completedSize / totalSize) * 100) : 0
    const downloadSpeed = parseInt(status.downloadSpeed, 10)
    const uploadSpeed = parseInt(status.uploadSpeed, 10)
    const isTorrent = !!status.bittorrent || !!status.infoHash
    const mappedStatus = mapAria2Status(status.status)
    const isSeeding = isTorrent && status.status === 'active' && status.seeder === 'true' && progress === 100

    let files: TorrentFile[] | undefined
    if (isTorrent && status.files) {
        files = status.files.map((file, index) => ({
            id: `${status.gid}-${index}`,
            name: file.path.split(/[/\\]/).pop() || file.path,
            size: parseInt(file.length, 10),
            progress: getFileProgress(file),
            priority: 'normal'
        }))
    }

    return {
        id: status.gid,
        name: getTaskName(status),
        totalSize,
        progress,
        downloadSpeed,
        uploadSpeed,
        status: isSeeding ? 'seeding' : mappedStatus,
        isTorrent,
        path: status.dir,
        files
    }
}

export async function getActiveTasks(): Promise<Task[]> {
    const headers = getAuthHeaders()
    const response = await fetch(`${API_CONFIG.baseUrl}/aria2/active`, {
        method: 'GET',
        headers
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
        throw new Error(data.message || 'Failed to fetch active tasks')
    }

    return (data.list || []).map(mapAria2StatusToTask)
}

export async function getWaitingTasks(offset = 0, num = 50): Promise<Task[]> {
    const headers = getAuthHeaders()
    const response = await fetch(`${API_CONFIG.baseUrl}/aria2/waiting?offset=${offset}&num=${num}`, {
        method: 'GET',
        headers
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
        throw new Error(data.message || 'Failed to fetch waiting tasks')
    }

    return (data.list || []).map(mapAria2StatusToTask)
}

export async function getStoppedTasks(offset = 0, num = 50): Promise<Task[]> {
    const headers = getAuthHeaders()
    const response = await fetch(`${API_CONFIG.baseUrl}/aria2/stopped?offset=${offset}&num=${num}`, {
        method: 'GET',
        headers
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
        throw new Error(data.message || 'Failed to fetch stopped tasks')
    }

    return (data.list || []).map(mapAria2StatusToTask)
}

export async function pauseTask(gid: string): Promise<string> {
    const headers = getAuthHeaders()
    // POST 请求不带 body 时移除 Content-Type，避免 Fastify 空 body 报错
    const postHeaders = { ...headers }
    delete postHeaders['Content-Type']
    
    const response = await fetch(`${API_CONFIG.baseUrl}/aria2/pause/${gid}`, {
        method: 'POST',
        headers: postHeaders
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
        throw new Error(data.message || 'Failed to pause task')
    }

    return data.gid
}

export async function unpauseTask(gid: string): Promise<string> {
    const headers = getAuthHeaders()
    // POST 请求不带 body 时移除 Content-Type，避免 Fastify 空 body 报错
    const postHeaders = { ...headers }
    delete postHeaders['Content-Type']
    
    const response = await fetch(`${API_CONFIG.baseUrl}/aria2/unpause/${gid}`, {
        method: 'POST',
        headers: postHeaders
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
        throw new Error(data.message || 'Failed to unpause task')
    }

    return data.gid
}

export async function removeTask(gid: string, force = false, deleteLocalFile = false): Promise<string> {
    const headers = getAuthHeaders()
    // DELETE 请求不需要 Content-Type，避免 Fastify 空 body 报错
    const deleteHeaders = { ...headers }
    delete deleteHeaders['Content-Type']
    
    const queryParams = deleteLocalFile ? '?deleteLocalFile=true' : ''
    
    // 辅助函数：尝试删除并返回结果
    const tryRemove = async (url: string): Promise<string | null> => {
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: deleteHeaders
            })
            
            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    return data.gid
                }
            }
            return null
        } catch (e) {
            console.warn(`Remove attempt failed for ${url}:`, e)
            return null
        }
    }
    
    if (!force) {
        // 1. 尝试普通 remove（活跃/等待任务）
        const removeResult = await tryRemove(`${API_CONFIG.baseUrl}/aria2/remove/${gid}${queryParams}`)
        if (removeResult) return removeResult
        
        // 2. 尝试强制 remove（活跃任务强制停止）
        const forceResult = await tryRemove(`${API_CONFIG.baseUrl}/aria2/force-remove/${gid}${queryParams}`)
        if (forceResult) return forceResult
        
        // 3. 尝试 removeDownloadResult（已完成/错误/已停止任务）
        const resultResult = await tryRemove(`${API_CONFIG.baseUrl}/aria2/remove-result/${gid}${queryParams}`)
        if (resultResult) return resultResult
        
        throw new Error(`Failed to remove task: ${gid}`)
    }
    
    // force=true 时：先尝试强制删除，再尝试删除结果
    const forceResult = await tryRemove(`${API_CONFIG.baseUrl}/aria2/force-remove/${gid}${queryParams}`)
    if (forceResult) return forceResult
    
    const resultResult = await tryRemove(`${API_CONFIG.baseUrl}/aria2/remove-result/${gid}${queryParams}`)
    if (resultResult) return resultResult
    
    throw new Error(`Failed to force remove task: ${gid}`)
}

export async function addUri(uris: string | string[], options?: Record<string, string | number | boolean>, position?: number): Promise<string> {
    const headers = getAuthHeaders()
    const urisArray = Array.isArray(uris) ? uris : [uris]
    
    const response = await fetch(`${API_CONFIG.baseUrl}/aria2/add-uri`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            uris: urisArray,
            options,
            position
        })
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
        throw new Error(data.message || 'Failed to add task')
    }

    return data.gid
}

export async function getTaskStatus(gid: string): Promise<Task | null> {
    const headers = getAuthHeaders()
    const response = await fetch(`${API_CONFIG.baseUrl}/aria2/status/${gid}`, {
        method: 'GET',
        headers
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
        return null
    }

    return mapAria2StatusToTask(data.status)
}

interface DiskSpaceInfo {
    path: string
    total: number
    free: number
    available: number
    used: number
}

interface DashboardResponse {
    success: boolean
    connected: boolean
    version?: string
    error?: string
    downloadSpeed: number
    uploadSpeed: number
    numActive: number
    numWaiting: number
    numStopped: number
    diskSpace: DiskSpaceInfo
}

interface DiskSpaceResponse {
    success: boolean
    path: string
    total: number
    free: number
    available: number
    used: number
}

export async function getDashboard(): Promise<DashboardResponse> {
    const headers = getAuthHeaders()
    // GET 请求不需要 Content-Type
    const getHeaders = { ...headers }
    delete getHeaders['Content-Type']
    
    const response = await fetch(`${API_CONFIG.baseUrl}/aria2/dashboard`, {
        method: 'GET',
        headers: getHeaders
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data as DashboardResponse
}

export async function getDiskSpace(path?: string): Promise<DiskSpaceResponse> {
    const headers = getAuthHeaders()
    // GET 请求不需要 Content-Type
    const getHeaders = { ...headers }
    delete getHeaders['Content-Type']
    
    const queryParams = path ? `?path=${encodeURIComponent(path)}` : ''
    const response = await fetch(`${API_CONFIG.baseUrl}/filesystem/disk-space${queryParams}`, {
        method: 'GET',
        headers: getHeaders
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
        throw new Error(data.message || 'Failed to get disk space')
    }

    return data as DiskSpaceResponse
}