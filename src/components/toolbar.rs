use yew::prelude::*;

#[derive(Properties, PartialEq)]
pub struct ToolbarProps {
    pub title: String,
    pub on_new: Callback<MouseEvent>,
}

#[function_component(Toolbar)]
pub fn toolbar(props: &ToolbarProps) -> Html {
    html! {
        <header class="toolbar">
            <h1 class="toolbar-title">{ &props.title }</h1>

            <div class="toolbar-actions">
                <button class="btn btn-primary" onclick={props.on_new.clone()}>
                    { "＋ 新建任务" }
                </button>
                <button class="btn btn-square">{ "▷" }</button>
                <button class="btn btn-square">{ "Ⅱ" }</button>
                <button class="btn btn-square">{ "🗑" }</button>
            </div>
        </header>
    }
}