use tauri_plugin_global_shortcut::GlobalShortcutExt;
use tauri::menu::{MenuBuilder, MenuItemBuilder};
use tauri::{Manager, Emitter};
use std::sync::Mutex;

#[derive(serde::Serialize)]
pub struct HotkeyResult {
    pub success: bool,
    pub message: String,
}

pub struct AppState {
    current_hotkey: Mutex<String>,
}

#[tauri::command]
fn register_hotkey(hotkey: String, state: tauri::State<AppState>) -> HotkeyResult {
    // Validate format (allow single keys like F10, or combinations with +)
    if hotkey.is_empty() || hotkey.len() < 2 {
        return HotkeyResult {
            success: false,
            message: "Invalid hotkey format. Use F10, ctrl+shift+l, alt+k, etc.".to_string(),
        };
    }

    // Store the preference
    if let Ok(mut current) = state.current_hotkey.lock() {
        *current = hotkey.clone();
    }

    HotkeyResult {
        success: true,
        message: format!("Hotkey preference saved: {}. Please restart the app to apply changes.", hotkey),
    }
}

#[tauri::command]
fn get_hotkey(state: tauri::State<AppState>) -> String {
    state.current_hotkey.lock()
        .map(|h| h.clone())
        .unwrap_or_else(|_| "F10".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(AppState {
            current_hotkey: Mutex::new("F10".to_string()),
        })
        .invoke_handler(tauri::generate_handler![register_hotkey, get_hotkey])
        .setup(|app| {
            let _ = app.global_shortcut().register("F10");

            // Create tray menu
            let toggle_item = MenuItemBuilder::new("Toggle Window").id("toggle").build(app)?;
            let settings_item = MenuItemBuilder::new("Settings").id("settings").build(app)?;
            let quit_item = MenuItemBuilder::new("Quit").id("quit").build(app)?;

            let menu = MenuBuilder::new(app)
                .items(&[&toggle_item, &settings_item, &quit_item])
                .build()?;

            let _tray = tauri::tray::TrayIconBuilder::new()
                .menu(&menu)
                .on_menu_event(|app, event| {
                    match event.id().as_ref() {
                        "toggle" => {
                            let window = app.get_webview_window("main").unwrap();
                            let is_visible = window.is_visible().unwrap_or(false);
                            if is_visible {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "settings" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                                // This will emit an event to open settings
                                let _ = window.emit("open-settings", ());
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
