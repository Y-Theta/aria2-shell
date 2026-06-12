use yew::prelude::*;

#[derive(Properties, PartialEq)]
pub struct LayoutProps {
    pub sidebar: Html,
    pub toolbar: Html,
    pub content: Html,
    pub footer: Html,
    #[prop_or_default]
    pub dialog: Html,
}

#[function_component(Layout)]
pub fn layout(props: &LayoutProps) -> Html {
    html! {
        <div class="app-shell">
            { props.sidebar.clone() }
            <main class="content-panel">
                { props.toolbar.clone() }
                <section class="content-body">
                    { props.content.clone() }
                </section>
                { props.footer.clone() }
            </main>
            { props.dialog.clone() }
        </div>
    }
}