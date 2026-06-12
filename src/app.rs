use gloo::console::log;
use yew::prelude::*;

use crate::components::layout::Layout;
use crate::components::new_task_dialog::NewTaskDialog;
use crate::components::sidebar::{Sidebar, SidebarItem};
use crate::components::status_bar::StatusBar;
use crate::components::task_list::TaskList;
use crate::components::toolbar::Toolbar;
use crate::models::download::FilterKind;
use crate::store::download_store::DownloadStore;

fn filter_title(filter: &FilterKind) -> &'static str {
    match filter {
        FilterKind::All => "全部",
        FilterKind::Downloading => "下载中",
        FilterKind::Completed => "已完成",
        FilterKind::Paused => "已暂停",
        FilterKind::Cancelled => "已取消",
    }
}

#[function_component(App)]
pub fn app() -> Html {
    let store = use_state(DownloadStore::mock);

    let on_select_filter = {
        let store = store.clone();
        Callback::from(move |filter: FilterKind| {
            let mut next = (*store).clone();
            next.active_filter = filter;
            store.set(next);
        })
    };

    let on_open_dialog = {
        let store = store.clone();
        Callback::from(move |_| {
            let mut next = (*store).clone();
            next.dialog_open = true;
            store.set(next);
        })
    };

    let on_close_dialog = {
        let store = store.clone();
        Callback::from(move |_| {
            let mut next = (*store).clone();
            next.dialog_open = false;
            store.set(next);
        })
    };

    let on_submit_task = {
        let store = store.clone();
        Callback::from(move |input: String| {
            log!(format!("TODO: add task to aria2 => {input}"));
            let mut next = (*store).clone();
            next.dialog_open = false;
            store.set(next);
        })
    };

    let current = (*store).clone();
    let active = current.active_filter.clone();

    let sidebar_items = vec![
        SidebarItem {
            label: "全部",
            count: current.count_all(),
            filter: FilterKind::All,
            active: active == FilterKind::All,
            icon: "⊞",
        },
        SidebarItem {
            label: "下载中",
            count: current.count_downloading(),
            filter: FilterKind::Downloading,
            active: active == FilterKind::Downloading,
            icon: "↓",
        },
        SidebarItem {
            label: "已完成",
            count: current.count_completed(),
            filter: FilterKind::Completed,
            active: active == FilterKind::Completed,
            icon: "✓",
        },
        SidebarItem {
            label: "已暂停",
            count: current.count_paused(),
            filter: FilterKind::Paused,
            active: active == FilterKind::Paused,
            icon: "Ⅱ",
        },
        SidebarItem {
            label: "已取消",
            count: current.count_cancelled(),
            filter: FilterKind::Cancelled,
            active: active == FilterKind::Cancelled,
            icon: "×",
        },
    ];

    html! {
        <Layout
            sidebar={html! {
                <Sidebar items={sidebar_items} on_select={on_select_filter} />
            }}
            toolbar={html! {
                <Toolbar
                    title={filter_title(&current.active_filter).to_string()}
                    on_new={on_open_dialog}
                />
            }}
            content={html! {
                <TaskList tasks={current.filtered_tasks()} />
            }}
            footer={html! {
                <StatusBar
                    total_speed={current.total_speed}
                    concurrent_tasks={current.concurrent_tasks}
                />
            }}
            dialog={html! {
                <NewTaskDialog
                    visible={current.dialog_open}
                    on_close={on_close_dialog}
                    on_submit={on_submit_task}
                />
            }}
        />
    }
}