use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};
use tauri_plugin_updater::UpdaterExt;
use tauri::menu::{MenuBuilder, MenuItemBuilder};
use tauri::{Manager, Emitter, Listener};
use std::sync::Mutex;
use std::str::FromStr;

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
    if hotkey.is_empty() {
        return HotkeyResult {
            success: false,
            message: "Invalid hotkey format. Hotkey cannot be empty.".to_string(),
        };
    }

    // Basic validation - should contain alphanumeric or valid key names
    let valid_pattern = hotkey.chars().all(|c| c.is_alphanumeric() || c == '+' || c == '-');
    if !valid_pattern {
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
        message: format!("Hotkey '{}' saved! Please restart the app to apply changes.", hotkey),
    }
}

#[tauri::command]
fn get_hotkey(state: tauri::State<AppState>) -> String {
    state.current_hotkey.lock()
        .map(|h| h.clone())
        .unwrap_or_else(|_| "F10".to_string())
}

#[tauri::command]
fn init_hotkey(hotkey: String, app: tauri::AppHandle) -> HotkeyResult {
    // Parse the hotkey string into a Shortcut
    match Shortcut::from_str(&hotkey) {
        Ok(shortcut) => {
            // Unregister all existing hotkeys first
            let _ = app.global_shortcut().unregister_all();

            // Register the new hotkey
            match app.global_shortcut().register(shortcut) {
                Ok(_) => HotkeyResult {
                    success: true,
                    message: format!("Hotkey '{}' activated", hotkey),
                },
                Err(e) => HotkeyResult {
                    success: false,
                    message: format!("Failed to register hotkey: {}", e),
                },
            }
        }
        Err(_) => HotkeyResult {
            success: false,
            message: format!("Invalid hotkey format: '{}'. Use F10, ctrl+shift+l, etc.", hotkey),
        },
    }
}

#[tauri::command]
async fn check_for_updates(app_handle: tauri::AppHandle) -> Result<bool, String> {
    let updater = app_handle.updater()
        .map_err(|e| format!("Failed to initialize updater: {}", e))?;
    match updater.check().await {
        Ok(Some(_update)) => Ok(true),
        Ok(None) => Ok(false),
        Err(e) => Err(format!("Failed to check for updates: {}", e)),
    }
}

#[tauri::command]
async fn install_update(app_handle: tauri::AppHandle) -> Result<(), String> {
    let updater = app_handle.updater()
        .map_err(|e| format!("Failed to initialize updater: {}", e))?;
    match updater.check().await {
        Ok(Some(update)) => {
            // Download and install with empty callbacks (no progress tracking)
            update.download_and_install(
                |_, _| {},  // on_chunk: (bytes_read, total_bytes)
                || {},      // on_download_finish
            ).await
                .map_err(|e| format!("Failed to install update: {}", e))?;
            app_handle.restart();
            // Note: restart() terminates the process, this line is unreachable
            #[allow(unreachable_code)]
            Ok(())
        }
        Ok(None) => Err("No update available".to_string()),
        Err(e) => Err(format!("Failed to check for updates: {}", e)),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(AppState {
            current_hotkey: Mutex::new("F10".to_string()),
        })
        .invoke_handler(tauri::generate_handler![register_hotkey, get_hotkey, init_hotkey, check_for_updates, install_update])
        .setup(|app| {
            // Register the default hotkey
            let default_hotkey = "F10";
            let app_handle = app.app_handle().clone();

            match Shortcut::from_str(default_hotkey) {
                Ok(shortcut) => {
                    match app.global_shortcut().register(shortcut) {
                        Ok(_) => println!("Successfully registered hotkey: {}", default_hotkey),
                        Err(e) => eprintln!("Failed to register default hotkey: {}", e),
                    }
                }
                Err(e) => {
                    eprintln!("Invalid default hotkey format: {}", e);
                }
            }

            // Set up a listener on the window for shortcut events
            // The global shortcut plugin emits events to the window
            if let Some(window) = app.get_webview_window("main") {
                let app_handle_for_shortcut = app_handle.clone();
                window.listen("tauri://global-shortcut", move |event| {
                    // Parse the event payload to get the shortcut that was triggered
                    println!("Received shortcut event: {:?}", event.payload());

                    if let Some(w) = app_handle_for_shortcut.get_webview_window("main") {
                        if let Ok(is_visible) = w.is_visible() {
                            let _ = if is_visible {
                                println!("Hotkey pressed: Hiding window");
                                w.hide()
                            } else {
                                println!("Hotkey pressed: Showing window");
                                let _ = w.show();
                                let _ = w.set_focus();
                                Ok(())
                            };
                        }
                    }
                });
            }

            // Create tray menu
            let toggle_item = MenuItemBuilder::new("Toggle Window").id("toggle").build(app)?;
            let settings_item = MenuItemBuilder::new("Settings").id("settings").build(app)?;
            let quit_item = MenuItemBuilder::new("Quit").id("quit").build(app)?;

            let menu = MenuBuilder::new(app)
                .items(&[&toggle_item, &settings_item, &quit_item])
                .build()?;

            // Build tray icon with application icon
            let tray = tauri::tray::TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| {
                    match event.id().as_ref() {
                        "toggle" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let is_visible = window.is_visible().unwrap_or(false);
                                if is_visible {
                                    let _ = window.hide();
                                } else {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
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

            // Keep tray reference alive (tray will be cleaned up when app closes)
            std::mem::forget(tray);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
