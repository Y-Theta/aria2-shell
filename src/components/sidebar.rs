use yew::prelude::*;

use crate::models::download::FilterKind;

#[derive(Clone, PartialEq)]
pub struct SidebarItem {
    pub label: &'static str,
    pub count: usize,
    pub filter: FilterKind,
    pub active: bool,
    pub icon: &'static str,
}

#[derive(Properties, PartialEq)]
pub struct SidebarProps {
    pub items: Vec<SidebarItem>,
    pub on_select: Callback<FilterKind>,
}

#[function_component(Sidebar)]
pub fn sidebar(props: &SidebarProps) -> Html {
    html! {
        <aside class="sidebar">
            <div class="brand">{ "下载器" }</div>

            <div class="sidebar-menu">
                {
                    props.items.iter().map(|item| {
                        let class_name = if item.active {
                            "sidebar-item active"
                        } else {
                            "sidebar-item"
                        };

                        let on_click = {
                            let on_select = props.on_select.clone();
                            let filter = item.filter.clone();
                            Callback::from(move |_| on_select.emit(filter.clone()))
                        };

                        html! {
                            <button class={class_name} onclick={on_click}>
                                <span class="sidebar-item-left">
                                    <span class="sidebar-icon">{ item.icon }</span>
                                    <span>{ item.label }</span>
                                </span>
                                <span class="sidebar-badge">{ item.count }</span>
                            </button>
                        }
                    }).collect::<Html>()
                }
            </div>

            <div class="sidebar-footer">
                <span>{ "设置" }</span>
                <span class="footer-sep">{ "|" }</span>
                <span>{ "深色模式" }</span>
            </div>
        </aside>
    }
}