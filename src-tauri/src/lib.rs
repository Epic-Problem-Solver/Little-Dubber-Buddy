// Little Dubber Buddy — Tauri shell.
// Keystroke capture (workstream 3) and the tray (workstream 5) attach here.

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running Little Dubber Buddy");
}
