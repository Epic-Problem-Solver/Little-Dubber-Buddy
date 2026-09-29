//! File-based save tests: round-trip stability, atomicity, corruption.

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
    let future = json.replace(""version":1,", ""version":99,");
    assert!(matches!(
        from_json(&future),
        Err(SaveError::VersionMismatch {
            expected: 1,
            found: 99
        })
    ));
}
