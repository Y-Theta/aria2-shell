import type { Task, Config, Stats } from '../types';

export const mockTasks: Task[] = [
  {
    id: '1',
    filename: 'ubuntu-24.04-desktop-amd64.iso',
    status: 'downloading',
    progress: 74,
    totalSize: 4398046272, // 4.2 GB
    completedSize: 3254108160, // 3.1 GB
    downloadSpeed: 12582912, // 12 MB/s
    uploadSpeed: 563200, // 550 KB/s
    eta: 24,
  },
  {
    id: '2',
    filename: 'Favorite_WebSeries_S01E05.mp4.torrent',
    status: 'seeding',
    progress: 100,
    totalSize: 2952790016, // 2.8 GB
    completedSize: 2952790016,
    downloadSpeed: 3276800, // 3.2 MB/s
    uploadSpeed: 1843200, // 1.8 MB/s
    eta: null,
    seeders: 14,
    ratio: 1.8,
  },
  {
    id: '3',
    filename: 'Project_Final_Archive.zip',
    status: 'paused',
    progress: 51,
    totalSize: 1288490188, // 1.2 GB
    completedSize: 675282176, // 645 MB
    downloadSpeed: 0,
    uploadSpeed: 0,
    eta: null,
  },
  {
    id: '4',
    filename: 'Documentary_S05_MegaPack.torrent',
    status: 'downloading',
    progress: 45,
    totalSize: 36189239296, // 33.7 GB
    completedSize: 16267410432, // 15.1 GB
    downloadSpeed: 8453120, // 8.1 MB/s
    uploadSpeed: 1126400, // 1.1 MB/s
    eta: 2280, // 38 minutes
    seeders: 28,
    ratio: 0.8,
  },
];

export const mockStats: Stats = {
  totalDownloadSpeed: 21036032, // 20.6 MB/s
  totalUploadSpeed: 1638400, // 1.6 MB/s
  activeTasks: 2,
  completedTasks: 1,
  pausedTasks: 1,
};

export const mockConfig: Config = {
  rpcUrl: 'http://localhost:6800/jsonrpc',
  rpcSecret: '',
  autoStart: true,
  maxConnections: 100,
  maxDownloadSpeed: 0, // unlimited
  maxUploadSpeed: 0, // unlimited
};
