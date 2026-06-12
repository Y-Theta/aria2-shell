mod app;
mod components;
mod models;
mod services;
mod store;

fn main() {
    yew::Renderer::<app::App>::new().render();
}