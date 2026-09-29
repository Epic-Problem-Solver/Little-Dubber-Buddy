//! lil-dubber-core: pure, UI-free game logic for Little Dubber Buddy.
//!
//! Design rules (load-bearing — see the architecture bar):
//! - No I/O except the explicit save/load functions in [`save`].
//! - No clocks: time-dependent functions take `now` in epoch seconds, so tests
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
