use yew::prelude::*;

use crate::components::task_card::TaskCard;
use crate::models::download::DownloadTask;

#[derive(Properties, PartialEq)]
pub struct TaskListProps {
    pub tasks: Vec<DownloadTask>,
}

#[function_component(TaskList)]
pub fn task_list(props: &TaskListProps) -> Html {
    html! {
        <div class="task-list">
            {
                props.tasks.iter().cloned().map(|task| {
                    html! { <TaskCard task={task} /> }
                }).collect::<Html>()
            }
        </div>
    }
}