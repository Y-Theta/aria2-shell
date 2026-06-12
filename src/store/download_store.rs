use crate::models::download::{DownloadTask, FilterKind, TaskStatus};

#[derive(Clone, PartialEq)]
pub struct DownloadStore {
    pub tasks: Vec<DownloadTask>,
    pub active_filter: FilterKind,
    pub concurrent_tasks: usize,
    pub total_speed: u64,
    pub dialog_open: bool,
}

impl DownloadStore {
    pub fn mock() -> Self {
        let tasks = vec![
            DownloadTask {
                gid: "2089b05ecca3d829".into(),
                name: "ubuntu-24.04-desktop-amd64.iso".into(),
                total_length: 4_700 * 1024 * 1024,
                completed_length: 1_200 * 1024 * 1024,
                download_speed: 25_300_000,
                eta_seconds: Some(120),
                status: TaskStatus::Active,
            },
            DownloadTask {
                gid: "2089b05ecca3d830".into(),
                name: "archlinux-2024.05.01-x86_64.iso".into(),
                total_length: 1_300 * 1024 * 1024,
                completed_length: 682 * 1024 * 1024,
                download_speed: 18_700_000,
                eta_seconds: Some(40),
                status: TaskStatus::Active,
            },
            DownloadTask {
                gid: "2089b05ecca3d831".into(),
                name: "VSCodeUserSetup-x64-1.89.1.exe".into(),
                total_length: 92 * 1024 * 1024,
                completed_length: 92 * 1024 * 1024,
                download_speed: 0,
                eta_seconds: None,
                status: TaskStatus::Complete,
            },
        ];

        let total_speed = tasks.iter().map(|t| t.download_speed).sum();

        Self {
            tasks,
            active_filter: FilterKind::All,
            concurrent_tasks: 3,
            total_speed,
            dialog_open: false,
        }
    }

    pub fn filtered_tasks(&self) -> Vec<DownloadTask> {
        self.tasks
            .iter()
            .filter(|task| match self.active_filter {
                FilterKind::All => true,
                FilterKind::Downloading => task.status == TaskStatus::Active,
                FilterKind::Completed => task.status == TaskStatus::Complete,
                FilterKind::Paused => task.status == TaskStatus::Paused,
                FilterKind::Cancelled => task.status == TaskStatus::Removed,
            })
            .cloned()
            .collect()
    }

    pub fn count_all(&self) -> usize {
        self.tasks.len()
    }

    pub fn count_downloading(&self) -> usize {
        self.tasks.iter().filter(|t| t.status == TaskStatus::Active).count()
    }

    pub fn count_completed(&self) -> usize {
        self.tasks.iter().filter(|t| t.status == TaskStatus::Complete).count()
    }

    pub fn count_paused(&self) -> usize {
        self.tasks.iter().filter(|t| t.status == TaskStatus::Paused).count()
    }

    pub fn count_cancelled(&self) -> usize {
        self.tasks.iter().filter(|t| t.status == TaskStatus::Removed).count()
    }
}