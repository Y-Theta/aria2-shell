use serde::{Deserialize, Serialize};

#[derive(Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum TaskStatus {
    Active,
    Waiting,
    Paused,
    Complete,
    Error,
    Removed,
}

#[derive(Clone, PartialEq, Eq)]
pub enum FilterKind {
    All,
    Downloading,
    Completed,
    Paused,
    Cancelled,
}

#[derive(Clone, PartialEq, Serialize, Deserialize)]
pub struct DownloadTask {
    pub gid: String,
    pub name: String,
    pub total_length: u64,
    pub completed_length: u64,
    pub download_speed: u64,
    pub eta_seconds: Option<u64>,
    pub status: TaskStatus,
}

impl DownloadTask {
    pub fn progress_percent(&self) -> u8 {
        if self.total_length == 0 {
            0
        } else {
            ((self.completed_length as f64 / self.total_length as f64) * 100.0).round() as u8
        }
    }

    pub fn is_downloading(&self) -> bool {
        self.status == TaskStatus::Active
    }

    pub fn is_completed(&self) -> bool {
        self.status == TaskStatus::Complete
    }

    pub fn is_paused(&self) -> bool {
        self.status == TaskStatus::Paused
    }

    pub fn is_cancelled(&self) -> bool {
        self.status == TaskStatus::Removed
    }
}

pub fn format_bytes(value: u64) -> String {
    const KB: f64 = 1024.0;
    const MB: f64 = KB * 1024.0;
    const GB: f64 = MB * 1024.0;

    let v = value as f64;
    if v >= GB {
        format!("{:.1} GB", v / GB)
    } else if v >= MB {
        format!("{:.1} MB", v / MB)
    } else if v >= KB {
        format!("{:.1} KB", v / KB)
    } else {
        format!("{value} B")
    }
}

pub fn format_speed(value: u64) -> String {
    format!("{}/s", format_bytes(value))
}

pub fn format_eta(seconds: u64) -> String {
    if seconds >= 60 {
        format!("{} 分钟", seconds / 60)
    } else {
        format!("{} 秒", seconds)
    }
}