// Little Dubber Buddy — frontend entry (scaffold).
// The Cozy Desk scene, first-run flow, shop, and settings land in later workstreams.
import { getCurrentWindow } from "@tauri-apps/api/window";

document.getElementById("close-btn")?.addEventListener("click", () => {
  // Until the tray icon lands (workstream 5), this button quits the app.
  getCurrentWindow()
    .close()
    .catch(() => window.close());
});

document.getElementById("scene")?.setAttribute("data-stage", "scaffold");
