use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::init())
        .setup(|app| {
            #[cfg(target_os = "windows")]
            {
                use tauri_plugin_global_shortcut::ShortcutExt;
                let app_handle = app.handle().clone();
                let _ = app
                    .global_shortcut()
                    .register("ctrl+shift+l", move |_| {
                        if let Some(window) = app_handle.get_webview_window("main") {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    });
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
