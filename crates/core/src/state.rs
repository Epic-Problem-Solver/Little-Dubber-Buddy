//! Persisted game state and the save schema.

use serde::{Deserialize, Serialize};

/// Bump when the save shape changes, and add a migration in `save`.
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
