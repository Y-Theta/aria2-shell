<template>
    <task-page
        :tasks="tasks"
        @addTask="onAddTask"
        @startAll="onStartAll"
        @pauseAll="onPauseAll"
        @deleteAll="onDeleteAll"
        @start="onStart"
        @pause="onPause"
        @delete="onDelete"
        @openFolder="onOpenFolder"
        @openFile="onOpenFile"
    />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TaskPage from '../components/TaskPage.vue'

interface TorrentFile {
    id: string
    name: string
    size: number
    progress: number
    priority: 'high' | 'normal' | 'low'
}

interface Task {
    id: string
    name: string
    totalSize: number
    progress: number
    downloadSpeed: number
    uploadSpeed: number
    status: 'downloading' | 'completed' | 'paused' | 'error' | 'seeding'
    isTorrent?: boolean
    path?: string
    files?: TorrentFile[]
}

const tasks = ref<Task[]>([
    {
        id: '1',
        name: '设计规范文档.pdf',
        totalSize: 24 * 1024 * 1024,
        progress: 68,
        downloadSpeed: 2.4 * 1024 * 1024,
        uploadSpeed: 0,
        status: 'downloading',
        path: '/downloads/docs'
    },
    {
        id: '2',
        name: '项目素材包.zip',
        totalSize: 1.32 * 1024 * 1024 * 1024,
        progress: 32,
        downloadSpeed: 5.7 * 1024 * 1024,
        uploadSpeed: 0.3 * 1024 * 1024,
        status: 'downloading',
        isTorrent: true,
        path: '/downloads/projects',
        files: [
            {
                id: '2-1',
                name: 'images/cover.jpg',
                size: 4.2 * 1024 * 1024,
                progress: 85,
                priority: 'high'
            },
            {
                id: '2-2',
                name: 'videos/intro.mp4',
                size: 128.7 * 1024 * 1024,
                progress: 40,
                priority: 'normal'
            },
            {
                id: '2-3',
                name: 'documents/spec.pdf',
                size: 24 * 1024 * 1024,
                progress: 68,
                priority: 'normal'
            },
            {
                id: '2-4',
                name: 'assets/sprite.png',
                size: 12.5 * 1024 * 1024,
                progress: 10,
                priority: 'low'
            },
            {
                id: '2-5',
                name: 'readme.md',
                size: 12 * 1024,
                progress: 100,
                priority: 'normal'
            }
        ]
    },
    {
        id: '3',
        name: '课程资料全集.7z',
        totalSize: 2.5 * 1024 * 1024 * 1024,
        progress: 55,
        downloadSpeed: 4.1 * 1024 * 1024,
        uploadSpeed: 0,
        status: 'downloading',
        path: '/downloads/courses'
    },
    {
        id: '4',
        name: '素材包\图片\封面.jpg',
        totalSize: 4.2 * 1024 * 1024,
        progress: 85,
        downloadSpeed: 1.2 * 1024 * 1024,
        uploadSpeed: 0,
        status: 'downloading',
        path: '/downloads/images'
    },
    {
        id: '5',
        name: '素材包\视频\片头.mp4',
        totalSize: 128.7 * 1024 * 1024,
        progress: 40,
        downloadSpeed: 2 * 1024 * 1024,
        uploadSpeed: 0,
        status: 'downloading',
        path: '/downloads/videos'
    },
    {
        id: '6',
        name: '素材包\文档\说明.txt',
        totalSize: 2.1 * 1024,
        progress: 100,
        downloadSpeed: 0,
        uploadSpeed: 0,
        status: 'completed',
        path: '/downloads/docs'
    },
    {
        id: '7',
        name: '课程资料合集.mp4',
        totalSize: 2.15 * 1024 * 1024 * 1024,
        progress: 0,
        downloadSpeed: 0,
        uploadSpeed: 0,
        status: 'paused',
        path: '/downloads/courses'
    },
    {
        id: '8',
        name: '使用手册.docx',
        totalSize: 12.4 * 1024 * 1024,
        progress: 100,
        downloadSpeed: 0,
        uploadSpeed: 0,
        status: 'completed',
        path: '/downloads/docs'
    },
    {
        id: '9',
        name: '效果图合集.jpg',
        totalSize: 154.8 * 1024 * 1024,
        progress: 100,
        downloadSpeed: 0,
        uploadSpeed: 0,
        status: 'completed',
        path: '/downloads/images'
    },
    {
        id: '10',
        name: '背景音乐.mp3',
        totalSize: 9.7 * 1024 * 1024,
        progress: 100,
        downloadSpeed: 0,
        uploadSpeed: 0,
        status: 'completed',
        path: '/downloads/audio'
    }
])

const onAddTask = () => console.log('Add task')
const onStartAll = () => console.log('Start all')
const onPauseAll = () => console.log('Pause all')
const onDeleteAll = () => console.log('Delete all')
const onStart = (id: string) => console.log('Start', id)
const onPause = (id: string) => console.log('Pause', id)
const onDelete = (id: string) => console.log('Delete', id)
const onOpenFolder = (id: string) => console.log('Open folder', id)
const onOpenFile = (id: string) => console.log('Open file', id)
</script>