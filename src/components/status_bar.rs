use yew::prelude::*;

use crate::models::download::format_speed;

#[derive(Properties, PartialEq)]
pub struct StatusBarProps {
    pub total_speed: u64,
    pub concurrent_tasks: usize,
}

#[function_component(StatusBar)]
pub fn status_bar(props: &StatusBarProps) -> Html {
    html! {
        <footer class="status-bar">
            <div>{ format!("下载速度: {}", format_speed(props.total_speed)) }</div>
            <div class="status-right">
                <span>{ "同时下载任务数:" }</span>
                <div class="concurrency-box">{ props.concurrent_tasks }</div>
            </div>
        </footer>
    }
}