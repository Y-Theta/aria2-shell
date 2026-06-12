export type TaskStatus = 'downloading' | 'seeding' | 'paused' | 'completed' | 'error';

export interface Task {
  id: string;
  filename: string;
  status: TaskStatus;
  progress: number;
  totalSize: number;
  completedSize: number;
  downloadSpeed: number;
  uploadSpeed: number;
  eta: number | null;
  seeders?: number;
  ratio?: number;
  infoHash?: string;
}

export interface Config {
  rpcUrl: string;
  rpcSecret: string;
  autoStart: boolean;
  maxConnections: number;
  maxDownloadSpeed: number;
  maxUploadSpeed: number;
}

export interface Stats {
  totalDownloadSpeed: number;
  totalUploadSpeed: number;
  activeTasks: number;
  completedTasks: number;
  pausedTasks: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
