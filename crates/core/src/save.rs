//! Save/load: one local JSON file, atomic writes, strict parsing.

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
