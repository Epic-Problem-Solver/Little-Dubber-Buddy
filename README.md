# Little Dubber Buddy

A cozy desktop writing companion. A small pixel-art buddy (yours to name, boy or
girl) sits at a desk on your screen. Every time you type anywhere on your computer,
the buddy's writing project advances. Finish a project to publish it for money;
spend the money on upgrades — and eventually, new work locations.

It is a discipline tool disguised as an idle game: the buddy writes **only** when
you type, and dozes off after 8 seconds of silence.

**Status: v0.1.0 scaffold.** The core game logic (economy, project tiers, dozing,
saves) and the window shell are in place. Keystroke capture, the Cozy Desk scene,
the shop, and the tray icon land in the next milestones — see [PROGRESS.md](PROGRESS.md).

## Privacy

- What you type is **not recorded**. The keystroke engine counts printable
  keypresses; key contents, combinations, and timestamps never leave your machine.
- No accounts, no cloud, no telemetry, no network calls. Your save is one local
  JSON file.

## Mechanics (v1)

- 5 printable keys = 1 base word (× typing-speed multiplier).
- No typing for 8 seconds → the buddy dozes; the next keypress wakes it instantly.
- Projects: Flash Story (1,000 words) → Short Story (7,500) → Novella (25,000) →
  Novel (75,000).
- Payout on completion: words × tier rate × quality multiplier
  (rates: $0.05 / $0.08 / $0.10 / $0.12 per word).
- Upgrades: Typing Speed (+25% word rate / level), Writing Quality (+25% payout /
  level). Cost: $25 × 1.5^level.
- Unlocks: Short after 1 Flash; Novella after 2 Shorts; Novel after 1 Novella.

## Requirements

- Rust (via rustup) and Node.js LTS.
- Windows 10/11: Visual Studio Build Tools with the "Desktop development with C++"
  workload (needed for both the Rust linker and the Tauri build).
- macOS: Xcode Command Line Tools (xcode-select --install). The keystroke hook (a
  later milestone) requires granting Accessibility permission to the app; the
  first-run flow will prompt you.
- Linux: GTK 3, webkit2gtk-4.1 and their dev packages (distribution-specific; e.g.
  on Debian/Ubuntu: sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev).

## Development

From the repo root (same commands on all three OSes):

    npm install
    npx tauri icon src-tauri/icons/source.png
    cargo test -p lil-dubber-core
    npm run tauri dev

- npm run tauri dev — run the app with hot reload.
- cargo test -p lil-dubber-core — game-logic test suite (no GUI needed).

## Building installers (one command per OS)

    npm run tauri build

- Windows → NSIS installer (+ MSI) in src-tauri/target/release/bundle/.
- macOS → unsigned .dmg in src-tauri/target/release/bundle/dmg/. Without a paid
  Apple Developer ID, macOS users right-click the app → Open on first launch
  (Gatekeeper).
- Linux → AppImage + .deb in src-tauri/target/release/bundle/.

## Field test checklists

Checklists live in this file as each platform's runtime surface lands. The Windows
11 checklist starts at the keystroke milestone; macOS and Linux checklists are
added at ship time. Until then: launch, drag, resize, and close the window without
crashing.

## License

MIT — see [LICENSE](LICENSE).

## Attribution & originality

Little Dubber Buddy is an original project. The idle "type to advance a buddy's
writing" mechanic is inspired by existing idle-productivity games; no assets,
text, or code are taken from them. All art and text in this repository are created
for this project.
