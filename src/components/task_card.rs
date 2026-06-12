use yew::prelude::*;

use crate::models::download::{
    format_bytes, format_eta, format_speed, DownloadTask, TaskStatus,
};

#[derive(Properties, PartialEq)]
pub struct TaskCardProps {
    pub task: DownloadTask,
}

fn progress_class(status: &TaskStatus) -> &'static str {
    match status {
        TaskStatus::Active => "progress-fill downloading",
        TaskStatus::Complete => "progress-fill completed",
        TaskStatus::Paused => "progress-fill paused",
        TaskStatus::Removed => "progress-fill removed",
        _ => "progress-fill waiting",
    }
}

fn meta_text(task: &DownloadTask) -> String {
    match task.status {
        TaskStatus::Active => {
            let eta = task.eta_seconds.map(format_eta).unwrap_or_else(|| "-".into());
            format!(
                "{} / {} • {} • 剩余 {}",
                format_bytes(task.completed_length),
                format_bytes(task.total_length),
                format_speed(task.download_speed),
                eta
            )
        }
        TaskStatus::Complete => format!("{} • 已完成", format_bytes(task.total_length)),
        TaskStatus::Paused => format!(
            "{} / {} • 已暂停",
            format_bytes(task.completed_length),
            format_bytes(task.total_length)
        ),
        TaskStatus::Removed => format!(
            "{} / {} • 已取消",
            format_bytes(task.completed_length),
            format_bytes(task.total_length)
        ),
        _ => format!(
            "{} / {}",
            format_bytes(task.completed_length),
            format_bytes(task.total_length)
        ),
    }
}

#[function_component(TaskCard)]
pub fn task_card(props: &TaskCardProps) -> Html {
    let task = &props.task;
    let percent = task.progress_percent();

    html! {
        <article class="task-card">
            <div class="task-card-top">
                <div class="task-main">
                    <div class="task-name">{ &task.name }</div>
                    <div class="task-meta">{ meta_text(task) }</div>
                </div>

                <div class="task-actions">
                    <span class="task-percent">{ format!("{percent}%") }</span>
                    <button class="icon-btn">
                        {
                            if task.status == TaskStatus::Complete {
                                "▷"
                            } else {
                                "Ⅱ"
                            }
                        }
                    </button>
                    <button class="icon-btn">{ "⋮" }</button>
                </div>
            </div>

            <div class="progress-bar">
                <div
                    class={progress_class(&task.status)}
                    style={format!("width: {percent}%;")}
                />
            </div>
        </article>
    }
}