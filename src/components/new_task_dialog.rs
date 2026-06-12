use web_sys::HtmlInputElement;
use yew::prelude::*;

#[derive(Properties, PartialEq)]
pub struct NewTaskDialogProps {
    pub visible: bool,
    pub on_close: Callback<MouseEvent>,
    pub on_submit: Callback<String>,
}

#[function_component(NewTaskDialog)]
pub fn new_task_dialog(props: &NewTaskDialogProps) -> Html {
    let input_value = use_state(String::new);

    let oninput = {
        let input_value = input_value.clone();
        Callback::from(move |e: InputEvent| {
            let input: HtmlInputElement = e.target_unchecked_into();
            input_value.set(input.value());
        })
    };

    let onsubmit = {
        let input_value = input_value.clone();
        let on_submit = props.on_submit.clone();
        Callback::from(move |_| {
            let value = (*input_value).trim().to_string();
            if !value.is_empty() {
                on_submit.emit(value);
            }
        })
    };

    if !props.visible {
        return html! {};
    }

    html! {
        <div class="dialog-mask">
            <div class="dialog">
                <div class="dialog-title">{ "新建下载任务" }</div>
                <input
                    class="dialog-input"
                    type="text"
                    placeholder="输入 URL / 磁力链接 / torrent 地址"
                    value={(*input_value).clone()}
                    oninput={oninput}
                />
                <div class="dialog-actions">
                    <button class="btn" onclick={props.on_close.clone()}>{ "取消" }</button>
                    <button class="btn btn-primary" onclick={onsubmit}>{ "添加任务" }</button>
                </div>
            </div>
        </div>
    }
}