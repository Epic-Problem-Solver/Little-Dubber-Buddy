#!/usr/bin/env node
/**
 * Little Dubber Buddy — Round 1 scaffold bootstrap.
 *
 * Usage (from the repo root of a fresh Little-Dubber-Buddy clone):
 *   node bootstrap.mjs
 *
 * Writes the initial project files (overwriting the stub README.md) and
 * generates the app icon source PNG. Then:
 *   npm install
 *   npx tauri icon src-tauri/icons/source.png
 *   cargo test -p lil-dubber-core
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const root = dirname(fileURLToPath(import.meta.url));

const FILES = {
  "README.md": `# Little Dubber Buddy

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
`,

  "LICENSE": `MIT License

Copyright (c) 2026 Little Dubber Buddy Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`,

  "CHANGELOG.md": `# Changelog

All notable changes to Little Dubber Buddy are documented here.

## [Unreleased]

## [0.1.0] - 2026-09-29

### Added
- Project scaffold: Cargo workspace, Tauri v2 window shell (opaque, always-on-top,
  resizable, frameless with drag strip), procedurally generated app icon source.
- lil-dubber-core: pure Rust game logic — 4-tier project ladder with unlock chain,
  keystroke→word accumulator, 8-second doze state machine (mock-clock seam),
  upgrade economy ($25 × 1.5^level), integer-cents payouts, JSON save with atomic
  writes and byte-stable round-trips. Unit + integration tests.
`,

  "PROGRESS.md": `# Little Dubber Buddy — Gauntlet Ledger

Append-only. Entries are written at event time (EDT), never backfilled.

## Workstreams (confirmed by user, 2026-09-29)

| # | Workstream | Status |
|---|---|---|
| 1 | Core game logic (pure Rust, mock-clock seam, full tests) | IN REVIEW (r1) |
| 2 | Art — Cozy Desk scene + character sprite spec (boy/girl) | QUEUED |
| 3 | Keystroke engine — Windows hook first; macOS CGEventTap; X11 + Wayland fallback | QUEUED |
| 4 | UI/scene — first-run flow, scene, progress, shop, settings, on-demand rendering | QUEUED |
| 5 | Window & shell — position/size persistence, tray, export/import, macOS permission status | QUEUED |
| 6 | Docs & distribution — README polish, field checklists, release config | QUEUED |
| 7 | Integration + adversarial pass | QUEUED |

Sequence: 1 ∥ 2 → 3 → 4 → 5 → 6 → 7.

## Known issues

(none yet)

## Rounds

### W1 · Round 1 · 2026-09-29 16:35
- Builder: emitted full scaffold + lil-dubber-core (state, economy, session, game,
  save) via bootstrap.mjs. 25 tests (20 unit + 5 integration).
- Critic (fresh-eyes inspection): all W1 Tier A bar items PASS (structure, logic
  walkthroughs, test presence, integer-only math, single 8s doze knob, zero
  passive-generation paths). Tier B gates (cargo test green, zero warnings,
  Windows build) PENDING user output → workstream stays IN REVIEW.
- Next: user pastes cargo test -p lil-dubber-core output.
`,

  ".gitignore": `node_modules/
dist/
src-tauri/target/
src-tauri/gen/
*.tmp
.DS_Store
Thumbs.db
`,

  "Cargo.toml": `[workspace]
resolver = "2"
members = ["crates/core", "src-tauri"]

[profile.release]
lto = "thin"
codegen-units = 1
`,

  "crates/core/Cargo.toml": `[package]
name = "lil-dubber-core"
version = "0.1.0"
edition = "2021"
description = "Pure game logic for Little Dubber Buddy: tiers, economy, dozing, saves."
license = "MIT"

[dependencies]
serde = { version = "1", features = ["derive"] }
serde_json = "1"

[dev-dependencies]
tempfile = "3"
`,

  "crates/core/src/lib.rs": `//! lil-dubber-core: pure, UI-free game logic for Little Dubber Buddy.
//!
//! Design rules (load-bearing — see the architecture bar):
//! - No I/O except the explicit save/load functions in [\`save\`].
//! - No clocks: time-dependent functions take \`now\` in epoch seconds, so tests
//!   run a mock clock and the doze test never waits 8 real seconds.
//! - Integer-only money and word math (cents, key units) so results are
//!   deterministic and saves round-trip byte-stable.

pub mod economy;
pub mod game;
pub mod save;
pub mod session;
pub mod state;

pub use economy::{payout_cents, UpgradeTrack, BASE_UPGRADE_COST_CENTS};
pub use game::{abandon_project, purchase_upgrade, settle, start_project, ActionError};
pub use save::{from_json, load_game, save_game_atomic, to_json, SaveError};
pub use session::{mood_at, register_keypress, Mood, DOZE_AFTER_SECS, KEY_UNITS_PER_WORD};
pub use state::{
    ActiveProject, Buddy, CompletedCounts, GameState, Gender, ProjectTier, UpgradeLevels,
    SAVE_VERSION,
};
`,

  "crates/core/src/state.rs": `//! Persisted game state and the save schema.

use serde::{Deserialize, Serialize};

/// Bump when the save shape changes, and add a migration in \`save\`.
pub const SAVE_VERSION: u32 = 1;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Gender {
    Boy,
    Girl,
}

/// The buddy: a name chosen by the user and a boy/girl art variant.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Buddy {
    pub name: String,
    pub gender: Gender,
}

/// Project ladder, smallest to largest.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProjectTier {
    /// 1,000 words.
    Flash,
    /// 7,500 words.
    Short,
    /// 25,000 words.
    Novella,
    /// 75,000 words.
    Novel,
}

/// A project currently being written.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct ActiveProject {
    pub tier: ProjectTier,
    /// Words written toward this project so far.
    pub words: u32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub struct UpgradeLevels {
    /// +25% word rate per level.
    pub typing: u32,
    /// +25% payout per level.
    pub quality: u32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub struct CompletedCounts {
    pub flash: u32,
    pub short: u32,
    pub novella: u32,
    pub novel: u32,
}

/// The whole game, as saved to disk (one JSON document).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct GameState {
    pub version: u32,
    pub buddy: Buddy,
    /// Wallet, in whole cents.
    pub money_cents: u64,
    pub upgrades: UpgradeLevels,
    pub completed: CompletedCounts,
    /// The project currently in progress, if any.
    pub active: Option<ActiveProject>,
    /// Key units not yet whole (500 units == 1 base word).
    pub key_units: u64,
    /// Epoch seconds of the last counted keypress; None if the buddy never typed.
    pub last_keystroke_secs: Option<i64>,
    pub total_words: u64,
    pub total_keystrokes: u64,
}

impl GameState {
    /// A brand-new buddy, as created by the first-run flow.
    pub fn fresh(name: impl Into<String>, gender: Gender) -> Self {
        Self {
            version: SAVE_VERSION,
            buddy: Buddy { name: name.into(), gender },
            money_cents: 0,
            upgrades: UpgradeLevels::default(),
            completed: CompletedCounts::default(),
            active: None,
            key_units: 0,
            last_keystroke_secs: None,
            total_words: 0,
            total_keystrokes: 0,
        }
    }
}
`,

  "crates/core/src/economy.rs": `//! Economy: tier data, unlocks, payouts, upgrade costs.
//!
//! All money is integer cents; all math is integer so results are deterministic
//! and saves round-trip byte-stable.

use crate::state::{CompletedCounts, ProjectTier, UpgradeLevels};

impl ProjectTier {
    pub const ALL: [ProjectTier; 4] = [
        ProjectTier::Flash,
        ProjectTier::Short,
        ProjectTier::Novella,
        ProjectTier::Novel,
    ];

    /// Target word count for this tier.
    pub fn target_words(self) -> u32 {
        match self {
            ProjectTier::Flash => 1_000,
            ProjectTier::Short => 7_500,
            ProjectTier::Novella => 25_000,
            ProjectTier::Novel => 75_000,
        }
    }

    /// Payout rate, in cents per word.
    pub fn rate_cents_per_word(self) -> u32 {
        match self {
            ProjectTier::Flash => 5,
            ProjectTier::Short => 8,
            ProjectTier::Novella => 10,
            ProjectTier::Novel => 12,
        }
    }

    /// Unlock rules: Flash open; Short after 1 Flash; Novella after 2 Shorts;
    /// Novel after 1 Novella.
    pub fn is_unlocked(self, counts: &CompletedCounts) -> bool {
        match self {
            ProjectTier::Flash => true,
            ProjectTier::Short => counts.flash >= 1,
            ProjectTier::Novella => counts.short >= 2,
            ProjectTier::Novel => counts.novella >= 1,
        }
    }
}

/// The two upgrade tracks.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum UpgradeTrack {
    /// +25% word rate per level.
    Typing,
    /// +25% payout per level.
    Quality,
}

/// Base cost of the first upgrade level: $25.00.
pub const BASE_UPGRADE_COST_CENTS: u64 = 2_500;

impl UpgradeTrack {
    pub fn level(self, levels: &UpgradeLevels) -> u32 {
        match self {
            UpgradeTrack::Typing => levels.typing,
            UpgradeTrack::Quality => levels.quality,
        }
    }

    /// Cost of the next level: $25 × 1.5^level, kept exact as 15/10 and
    /// truncated to whole cents.
    pub fn next_cost_cents(self, levels: &UpgradeLevels) -> u64 {
        let (mut num, mut den) = (BASE_UPGRADE_COST_CENTS as u128, 1u128);
        for _ in 0..self.level(levels) {
            num = match num.checked_mul(15) {
                Some(n) => n,
                None => return u64::MAX,
            };
            den = match den.checked_mul(10) {
                Some(d) => d,
                None => return u64::MAX,
            };
        }
        (num / den).min(u64::MAX as u128) as u64
    }
}

/// Payout for a finished project: words × rate × quality multiplier,
/// truncated to whole cents. Quality multiplier = 1 + 25% × quality level.
pub fn payout_cents(words: u32, tier: ProjectTier, quality_level: u32) -> u64 {
    let mult = 100u128 + 25u128 * u128::from(quality_level);
    let raw = u128::from(words) * u128::from(tier.rate_cents_per_word()) * mult;
    (raw / 100).min(u64::MAX as u128) as u64
}

#[cfg(test)]
mod tests {
    use super::*;

    fn counts(flash: u32, short: u32, novella: u32, novel: u32) -> CompletedCounts {
        CompletedCounts { flash, short, novella, novel }
    }

    #[test]
    fn tier_word_targets_match_spec() {
        assert_eq!(ProjectTier::Flash.target_words(), 1_000);
        assert_eq!(ProjectTier::Short.target_words(), 7_500);
        assert_eq!(ProjectTier::Novella.target_words(), 25_000);
        assert_eq!(ProjectTier::Novel.target_words(), 75_000);
    }

    #[test]
    fn tier_rates_match_spec() {
        assert_eq!(ProjectTier::Flash.rate_cents_per_word(), 5);
        assert_eq!(ProjectTier::Short.rate_cents_per_word(), 8);
        assert_eq!(ProjectTier::Novella.rate_cents_per_word(), 10);
        assert_eq!(ProjectTier::Novel.rate_cents_per_word(), 12);
    }

    #[test]
    fn fresh_state_unlocks_flash_only() {
        let c = counts(0, 0, 0, 0);
        assert!(ProjectTier::Flash.is_unlocked(&c));
        assert!(!ProjectTier::Short.is_unlocked(&c));
        assert!(!ProjectTier::Novella.is_unlocked(&c));
        assert!(!ProjectTier::Novel.is_unlocked(&c));
    }

    #[test]
    fn unlock_chain_follows_spec() {
        assert!(ProjectTier::Short.is_unlocked(&counts(1, 0, 0, 0)));
        assert!(!ProjectTier::Short.is_unlocked(&counts(0, 5, 0, 0)));
        assert!(ProjectTier::Novella.is_unlocked(&counts(0, 2, 0, 0)));
        assert!(!ProjectTier::Novella.is_unlocked(&counts(0, 1, 0, 0)));
        assert!(ProjectTier::Novel.is_unlocked(&counts(0, 0, 1, 0)));
        assert!(!ProjectTier::Novel.is_unlocked(&counts(0, 0, 0, 9)));
    }

    #[test]
    fn payout_math() {
        // Flash, no upgrades: 1,000 words × 5¢ = $50.00
        assert_eq!(payout_cents(1_000, ProjectTier::Flash, 0), 5_000);
        // Quality level 2 → ×1.5
        assert_eq!(payout_cents(1_000, ProjectTier::Flash, 2), 7_500);
        // Novel, no upgrades: 75,000 × 12¢ = $9,000.00
        assert_eq!(payout_cents(75_000, ProjectTier::Novel, 0), 900_000);
    }

    #[test]
    fn upgrade_cost_schedule_is_25_times_1_5_to_the_level() {
        for (level, expected) in [
            (0, 2_500u64),
            (1, 3_750),
            (2, 5_625),
            (3, 8_437),
            (4, 12_656),
        ] {
            let levels = UpgradeLevels { typing: level, quality: 0 };
            assert_eq!(
                UpgradeTrack::Typing.next_cost_cents(&levels),
                expected,
                "typing level {level}"
            );
            let levels = UpgradeLevels { typing: 0, quality: level };
            assert_eq!(
                UpgradeTrack::Quality.next_cost_cents(&levels),
                expected,
                "quality level {level}"
            );
        }
    }
}
`,

  "crates/core/src/session.rs": `//! The buddy's live state: keystrokes → words, and the doze cycle.
//!
//! No clocks live here: every function takes \`now\` in epoch seconds. The UI
//! passes real time; tests pass a mock clock.

use crate::state::GameState;

/// The buddy dozes when no keystroke arrives for this many seconds.
/// Single knob — spec'd at 8 (allowed band 7–10).
pub const DOZE_AFTER_SECS: i64 = 8;

/// 500 key units == 1 base word (5 printable keys at typing level 0).
pub const KEY_UNITS_PER_WORD: u64 = 500;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Mood {
    /// Awake and writing (or ready to).
    Working,
    /// Dozing (Zzz); writing paused until the next keypress.
    Dozing,
}

/// Pure query: the buddy's mood at time \`now\`.
/// A buddy that has never typed is awake and waiting.
pub fn mood_at(state: &GameState, now: i64) -> Mood {
    match state.last_keystroke_secs {
        Some(last) if now - last >= DOZE_AFTER_SECS => Mood::Dozing,
        _ => Mood::Working,
    }
}

/// Register one counted (printable) keypress at time \`now\`.
///
/// A dozing buddy wakes instantly — this keypress counts. The press adds
/// 1/5 × (1 + 0.25 × typing level) words, accumulated as integer key units so
/// fractional words carry over. Returns the whole words gained.
///
/// Zero passive generation: this function is the only source of words in the
/// entire crate.
pub fn register_keypress(state: &mut GameState, now: i64) -> u32 {
    state.last_keystroke_secs = Some(now);
    state.total_keystrokes += 1;

    let units_per_key = KEY_UNITS_PER_WORD / 5
        + (KEY_UNITS_PER_WORD / 20) * u64::from(state.upgrades.typing);
    state.key_units += units_per_key;

    let whole = state.key_units / KEY_UNITS_PER_WORD;
    state.key_units -= whole * KEY_UNITS_PER_WORD;
    if whole > 0 {
        state.total_words += whole as u64;
        if let Some(project) = state.active.as_mut() {
            project.words = project.words.saturating_add(whole as u32);
        }
    }
    whole as u32
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::{ActiveProject, Gender, ProjectTier};

    fn fresh_with_project() -> GameState {
        let mut s = GameState::fresh("Pip", Gender::Boy);
        s.active = Some(ActiveProject { tier: ProjectTier::Flash, words: 0 });
        s
    }

    #[test]
    fn five_keys_make_one_base_word() {
        let mut s = fresh_with_project();
        let mut gained = 0;
        for t in 0..5 {
            gained += register_keypress(&mut s, t);
        }
        assert_eq!(gained, 1);
        assert_eq!(s.total_words, 1);
        assert_eq!(s.active.unwrap().words, 1);
    }

    #[test]
    fn sub_word_remainder_carries_over() {
        let mut s = fresh_with_project();
        for t in 0..4 {
            register_keypress(&mut s, t);
        }
        assert_eq!(s.total_words, 0);
        assert_eq!(s.key_units, 400);
        assert_eq!(register_keypress(&mut s, 4), 1);
        assert_eq!(s.key_units, 0);
    }

    #[test]
    fn typing_upgrade_boosts_word_rate() {
        let mut s = fresh_with_project();
        s.upgrades.typing = 1; // 1.25× → 0.25 words per key
        for t in 0..20 {
            register_keypress(&mut s, t);
        }
        assert_eq!(s.total_words, 5);
    }

    #[test]
    fn doze_boundary_is_exactly_8_seconds() {
        let mut s = fresh_with_project();
        register_keypress(&mut s, 10);
        assert_eq!(mood_at(&s, 17), Mood::Working);
        assert_eq!(mood_at(&s, 18), Mood::Dozing);
    }

    #[test]
    fn dozing_buddy_wakes_on_next_keypress() {
        let mut s = fresh_with_project();
        register_keypress(&mut s, 0);
        assert_eq!(mood_at(&s, 100), Mood::Dozing);
        register_keypress(&mut s, 100);
        assert_eq!(mood_at(&s, 100), Mood::Working);
    }

    #[test]
    fn no_words_without_keypresses() {
        let mut s = fresh_with_project();
        register_keypress(&mut s, 0);
        // An hour of real time passes; nothing else happens in the core.
        assert_eq!(mood_at(&s, 3600), Mood::Dozing);
        assert_eq!(s.total_words, 0);
        assert_eq!(s.active.unwrap().words, 0);
    }

    #[test]
    fn never_typed_buddy_is_awake() {
        let s = GameState::fresh("Pip", Gender::Girl);
        assert_eq!(mood_at(&s, 0), Mood::Working);
    }
}
`,

  "crates/core/src/game.rs": `//! Game actions: starting/abandoning projects, completion, purchases.

use crate::economy::{payout_cents, UpgradeTrack};
use crate::state::{ActiveProject, GameState, ProjectTier};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ActionError {
    /// A project is already in progress.
    AlreadyActive,
    /// The tier is not unlocked yet.
    Locked,
    /// No project is in progress.
    NoActiveProject,
    /// Not enough money.
    NotEnoughMoney,
}

/// Begin a new project. Fails if one is already active or the tier is locked.
pub fn start_project(state: &mut GameState, tier: ProjectTier) -> Result<(), ActionError> {
    if state.active.is_some() {
        return Err(ActionError::AlreadyActive);
    }
    if !tier.is_unlocked(&state.completed) {
        return Err(ActionError::Locked);
    }
    state.active = Some(ActiveProject { tier, words: 0 });
    Ok(())
}

/// Drop the current project without a payout.
pub fn abandon_project(state: &mut GameState) -> Result<(), ActionError> {
    if state.active.is_none() {
        return Err(ActionError::NoActiveProject);
    }
    state.active = None;
    Ok(())
}

/// If the active project has reached its word target, publish it: pay out,
/// count the completion (which drives unlocks), and clear the slot.
/// Payout uses the actual word count — a project may overshoot its target.
pub fn settle(state: &mut GameState) -> Option<(ProjectTier, u64)> {
    let done = state.active.as_ref().filter(|p| p.words >= p.tier.target_words())?;
    let tier = done.tier;
    let words = done.words;
    let payout = payout_cents(words, tier, state.upgrades.quality);
    state.money_cents += payout;
    match tier {
        ProjectTier::Flash => state.completed.flash += 1,
        ProjectTier::Short => state.completed.short += 1,
        ProjectTier::Novella => state.completed.novella += 1,
        ProjectTier::Novel => state.completed.novel += 1,
    }
    state.active = None;
    Some((tier, payout))
}

/// Buy one level of an upgrade track.
pub fn purchase_upgrade(state: &mut GameState, track: UpgradeTrack) -> Result<(), ActionError> {
    let cost = track.next_cost_cents(&state.upgrades);
    if state.money_cents < cost {
        return Err(ActionError::NotEnoughMoney);
    }
    state.money_cents -= cost;
    match track {
        UpgradeTrack::Typing => state.upgrades.typing += 1,
        UpgradeTrack::Quality => state.upgrades.quality += 1,
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::session::register_keypress;
    use crate::state::Gender;

    fn rich() -> GameState {
        let mut s = GameState::fresh("Pip", Gender::Boy);
        s.money_cents = 1_000_000;
        s
    }

    #[test]
    fn starting_a_locked_tier_fails() {
        let mut s = rich();
        assert_eq!(start_project(&mut s, ProjectTier::Novel), Err(ActionError::Locked));
        assert!(s.active.is_none());
    }

    #[test]
    fn starting_while_active_fails() {
        let mut s = rich();
        assert!(start_project(&mut s, ProjectTier::Flash).is_ok());
        assert_eq!(
            start_project(&mut s, ProjectTier::Flash),
            Err(ActionError::AlreadyActive)
        );
    }

    #[test]
    fn finishing_a_flash_pays_and_unlocks() {
        let mut s = rich();
        start_project(&mut s, ProjectTier::Flash).unwrap();
        let before = s.money_cents;
        for t in 0..5_000 {
            register_keypress(&mut s, t);
        }
        assert_eq!(settle(&mut s), Some((ProjectTier::Flash, 5_000)));
        assert_eq!(s.money_cents, before + 5_000);
        assert_eq!(s.completed.flash, 1);
        assert!(s.active.is_none());
        assert_eq!(start_project(&mut s, ProjectTier::Short), Ok(()));
    }

    #[test]
    fn overshoot_words_are_paid() {
        let mut s = GameState::fresh("Pip", Gender::Girl);
        s.upgrades.typing = 36; // 100 + 25×36 = 1000 units/key = 2 words/key
        start_project(&mut s, ProjectTier::Flash).unwrap();
        for t in 0..501 {
            register_keypress(&mut s, t);
        }
        assert_eq!(s.active.unwrap().words, 1_002);
        assert_eq!(settle(&mut s), Some((ProjectTier::Flash, 5_010)));
    }

    #[test]
    fn settle_is_noop_without_project() {
        let mut s = rich();
        assert_eq!(settle(&mut s), None);
    }

    #[test]
    fn abandon_clears_project() {
        let mut s = rich();
        start_project(&mut s, ProjectTier::Flash).unwrap();
        abandon_project(&mut s).unwrap();
        assert!(s.active.is_none());
        assert_eq!(abandon_project(&mut s), Err(ActionError::NoActiveProject));
    }

    #[test]
    fn purchase_requires_funds() {
        let mut s = GameState::fresh("Pip", Gender::Boy);
        assert_eq!(
            purchase_upgrade(&mut s, UpgradeTrack::Typing),
            Err(ActionError::NotEnoughMoney)
        );
        s.money_cents = 2_499;
        assert_eq!(
            purchase_upgrade(&mut s, UpgradeTrack::Typing),
            Err(ActionError::NotEnoughMoney)
        );
        s.money_cents = 2_500;
        purchase_upgrade(&mut s, UpgradeTrack::Quality).unwrap();
        assert_eq!(s.money_cents, 0);
        assert_eq!(s.upgrades.quality, 1);
    }
}
`,

  "crates/core/src/save.rs": `//! Save/load: one local JSON file, atomic writes, strict parsing.

use crate::state::{GameState, SAVE_VERSION};
use std::fs;
use std::io;
use std::path::Path;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SaveError {
    Io(io::Error),
    Parse(String),
    VersionMismatch { expected: u32, found: u32 },
}

impl std::fmt::Display for SaveError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SaveError::Io(e) => write!(f, "save I/O error: {e}"),
            SaveError::Parse(msg) => write!(f, "malformed save: {msg}"),
            SaveError::VersionMismatch { expected, found } => write!(
                f,
                "save version {found} not supported (this build expects {expected})"
            ),
        }
    }
}

impl std::error::Error for SaveError {}

impl From<io::Error> for SaveError {
    fn from(e: io::Error) -> Self {
        SaveError::Io(e)
    }
}

/// Serialize state to JSON (the exact bytes written to disk).
pub fn to_json(state: &GameState) -> Result<String, SaveError> {
    serde_json::to_string(state).map_err(|e| SaveError::Parse(e.to_string()))
}

/// Parse a save from JSON, rejecting unknown versions rather than guessing.
pub fn from_json(json: &str) -> Result<GameState, SaveError> {
    let state: GameState =
        serde_json::from_str(json).map_err(|e| SaveError::Parse(e.to_string()))?;
    if state.version != SAVE_VERSION {
        return Err(SaveError::VersionMismatch {
            expected: SAVE_VERSION,
            found: state.version,
        });
    }
    Ok(state)
}

/// Write the save atomically: temp file + rename, so a crash mid-write can
/// never leave a half-written save.
pub fn save_game_atomic(state: &GameState, path: &Path) -> Result<(), SaveError> {
    let tmp = path.with_extension("tmp");
    fs::write(&tmp, to_json(state)?)?;
    fs::rename(&tmp, path)?;
    Ok(())
}

/// Load a save from disk.
pub fn load_game(path: &Path) -> Result<GameState, SaveError> {
    from_json(&fs::read_to_string(path)?)
}
`,

  "crates/core/tests/save_roundtrip.rs": `//! File-based save tests: round-trip stability, atomicity, corruption.

use lil_dubber_core::save::{from_json, load_game, save_game_atomic, to_json, SaveError};
use lil_dubber_core::state::{
    ActiveProject, Buddy, CompletedCounts, GameState, Gender, ProjectTier, UpgradeLevels,
    SAVE_VERSION,
};

fn rich_state() -> GameState {
    GameState {
        version: SAVE_VERSION,
        buddy: Buddy { name: "Pip".into(), gender: Gender::Girl },
        money_cents: 12_345,
        upgrades: UpgradeLevels { typing: 3, quality: 2 },
        completed: CompletedCounts { flash: 4, short: 2, novella: 1, novel: 0 },
        active: Some(ActiveProject { tier: ProjectTier::Short, words: 321 }),
        key_units: 300,
        last_keystroke_secs: Some(1_729_000_000),
        total_words: 98_765,
        total_keystrokes: 456_789,
    }
}

#[test]
fn roundtrip_is_lossless_and_byte_stable() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("save.json");
    let original = rich_state();

    save_game_atomic(&original, &path).unwrap();
    let loaded = load_game(&path).unwrap();
    assert_eq!(loaded, original, "load must reconstruct the exact state");

    // Byte stability: the same state serializes to the same bytes every time.
    assert_eq!(to_json(&loaded).unwrap(), to_json(&original).unwrap());
}

#[test]
fn atomic_write_leaves_no_tmp_file() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("save.json");
    save_game_atomic(&rich_state(), &path).unwrap();
    assert!(path.exists());
    assert!(
        !path.with_extension("tmp").exists(),
        "temp file must be renamed, not left behind"
    );
}

#[test]
fn corrupt_save_is_an_error_not_a_panic() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("save.json");
    std::fs::write(&path, "definitely { not json").unwrap();
    assert!(matches!(load_game(&path), Err(SaveError::Parse(_))));
}

#[test]
fn truncated_save_is_a_parse_error() {
    let json = to_json(&rich_state()).unwrap();
    let truncated = &json[..json.len() / 2];
    assert!(matches!(from_json(truncated), Err(SaveError::Parse(_))));
}

#[test]
fn unknown_version_is_rejected() {
    let json = to_json(&rich_state()).unwrap();
    let future = json.replace("\"version\":1,", "\"version\":99,");
    assert!(matches!(
        from_json(&future),
        Err(SaveError::VersionMismatch {
            expected: 1,
            found: 99
        })
    ));
}
`,

  "src-tauri/Cargo.toml": `[package]
name = "little-dubber-buddy"
version = "0.1.0"
edition = "2021"
description = "Little Dubber Buddy — a cozy desktop writing companion."
license = "MIT"

[lib]
name = "little_dubber_buddy_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
lil-dubber-core = { path = "../crates/core" }
serde_json = "1"
`,

  "src-tauri/build.rs": `fn main() {
    tauri_build::build()
}
`,

  "src-tauri/tauri.conf.json": `{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Little Dubber Buddy",
  "version": "0.1.0",
  "identifier": "com.littledubberbuddy.desktop",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "Little Dubber Buddy",
        "width": 520,
        "height": 400,
        "minWidth": 320,
        "minHeight": 260,
        "resizable": true,
        "transparent": false,
        "decorations": false,
        "alwaysOnTop": true,
        "skipTaskbar": true
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
`,

  "src-tauri/capabilities/default.json": `{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capabilities for the main window",
  "windows": ["main"],
  "permissions": ["core:default", "core:window:allow-close"]
}
`,

  "src-tauri/src/main.rs": `// Prevents an extra console window on Windows in release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    little_dubber_buddy_lib::run()
}
`,

  "src-tauri/src/lib.rs": `// Little Dubber Buddy — Tauri shell.
// Keystroke capture (workstream 3) and the tray (workstream 5) attach here.

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running Little Dubber Buddy");
}
`,

  "package.json": `{
  "name": "little-dubber-buddy-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "tauri": "tauri"
  },
  "dependencies": {
    "@tauri-apps/api": "^2"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2",
    "typescript": "^5",
    "vite": "^6"
  }
}
`,

  "vite.config.ts": `import { defineConfig } from "vite";

// Tauri expects a fixed dev port and no auto-open.
export default defineConfig({
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  build: {
    target: "es2021",
    outDir: "dist",
  },
});
`,

  "tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "lib": ["ES2021", "DOM", "DOM.Iterable"]
  },
  "include": ["src"]
}
`,

  "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Little Dubber Buddy</title>
  </head>
  <body>
    <header id="drag-region" data-tauri-drag-region>
      <span>Little Dubber Buddy</span>
      <button id="close-btn" title="Close" aria-label="Close">✕</button>
    </header>
    <main id="scene">
      <p class="placeholder">Scaffold — the Cozy Desk scene arrives in workstream 4.</p>
    </main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`,

  "src/main.ts": `// Little Dubber Buddy — frontend entry (scaffold).
// The Cozy Desk scene, first-run flow, shop, and settings land in later workstreams.
import { getCurrentWindow } from "@tauri-apps/api/window";

document.getElementById("close-btn")?.addEventListener("click", () => {
  // Until the tray icon lands (workstream 5), this button quits the app.
  getCurrentWindow()
    .close()
    .catch(() => window.close());
});

document.getElementById("scene")?.setAttribute("data-stage", "scaffold");
`,

  "src/style.css": `:root {
  color-scheme: light;
}
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
html,
body,
#scene {
  width: 100%;
  height: 100%;
}
body {
  font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
  background: #f6e7d4;
  color: #3a2e28;
  overflow: hidden;
}
#drag-region {
  position: relative;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #e8d5bc;
  font-size: 13px;
  user-select: none;
}
#close-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 6px;
  background: rgba(58, 46, 40, 0.08);
  color: #3a2e28;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
}
#close-btn:hover {
  background: rgba(58, 46, 40, 0.18);
}
#scene {
  display: grid;
  place-items: center;
}
.placeholder {
  opacity: 0.6;
  font-size: 14px;
  padding: 16px;
  text-align: center;
}
`,
};

// ---------------------------------------------------------------------------
// App icon: generated PNG (pure JS, no dependencies, no committed binaries).
// ---------------------------------------------------------------------------

function makeCrcTable() {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
}
const CRC_TABLE = makeCrcTable();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// A round-headed buddy: warm cream disc, brown hair cap, two eyes, a smile dot.
function drawIcon(S) {
  const px = Buffer.alloc(S * S * 4);
  const cx = S / 2;
  const faceCy = 0.56 * S;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      const d = Math.hypot(x - cx, y - cx);
      if (d > 0.485 * S) continue; // transparent
      let r = 246, g = 231, b = 212; // warm cream
      const fd = Math.hypot(x - cx, y - faceCy);
      if (fd <= 0.36 * S) {
        r = 255; g = 217; b = 176; // skin
        if (Math.hypot(x - cx, y - 0.30 * S) <= 0.34 * S) { r = 139; g = 90; b = 43; } // hair
        if (Math.hypot(x - 0.36 * S, y - 0.60 * S) <= 0.05 * S) { r = 245; g = 168; b = 140; } // cheek L
        if (Math.hypot(x - 0.64 * S, y - 0.60 * S) <= 0.05 * S) { r = 245; g = 168; b = 140; } // cheek R
        if (Math.hypot(x - 0.40 * S, y - 0.52 * S) <= 0.032 * S) { r = 58; g = 46; b = 40; } // eye L
        if (Math.hypot(x - 0.60 * S, y - 0.52 * S) <= 0.032 * S) { r = 58; g = 46; b = 40; } // eye R
        if (Math.hypot(x - 0.50 * S, y - 0.66 * S) <= 0.022 * S) { r = 176; g = 83; b = 59; } // mouth
      }
      px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = 255;
    }
  }
  return px;
}

// ---------------------------------------------------------------------------
// Write everything
// ---------------------------------------------------------------------------

let count = 0;
for (const [rel, content] of Object.entries(FILES)) {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content, "utf8");
  count++;
  console.log("  wrote " + rel);
}

const icon = encodePng(512, 512, drawIcon(512));
const iconPath = join(root, "src-tauri/icons/source.png");
mkdirSync(dirname(iconPath), { recursive: true });
writeFileSync(iconPath, icon);
console.log("  wrote src-tauri/icons/source.png (" + icon.length + " bytes)");

console.log("");
console.log("Scaffold complete: " + count + " text files + 1 generated icon.");
console.log("Next steps:");
console.log("  1. git add -A && git commit -m \"round 1: core game logic + app scaffold\" && git push");
console.log("  2. cargo test -p lil-dubber-core");
console.log("  3. (later, for the GUI) npm install && npx tauri icon src-tauri/icons/source.png && npm run tauri dev");