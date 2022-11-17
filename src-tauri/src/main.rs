#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::async_runtime::block_on;

mod command;
mod db;
mod migration;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    block_on(migration::migration());

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            command::main::read_sheets,
            command::main::read_values,
            command::setting::get_setting_list
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
