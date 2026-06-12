// Task status types
export type TaskStatus = 'downloading' | 'seeding' | 'paused' | 'completed' | 'error';

// Task interface
export interface Task {
  id: string;
  filename: string;
  status: TaskStatus;
  progress: number; // 0-100
  totalSize: number;
  completedSize: number;
  downloadSpeed: number; // KB/s
  uploadSpeed: number; // KB/s
  eta: number | null; // seconds
  seeders?: number;
  ratio?: number;
  infoHash?: string;
}

// API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Config interface
export interface Config {
  rpcUrl: string;
  rpcSecret: string;
  autoStart: boolean;
  maxConnections: number;
  maxDownloadSpeed: number; // KB/s, 0 = unlimited
  maxUploadSpeed: number; // KB/s, 0 = unlimited
}

// Stats interface
export interface Stats {
  totalDownloadSpeed: number;
  totalUploadSpeed: number;
  activeTasks: number;
  completedTasks: number;
  pausedTasks: number;
}
