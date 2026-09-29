//! The buddy's live state: keystrokes → words, and the doze cycle.
//!
//! No clocks live here: every function takes `now` in epoch seconds. The UI
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

/// Pure query: the buddy's mood at time `now`.
/// A buddy that has never typed is awake and waiting.
pub fn mood_at(state: &GameState, now: i64) -> Mood {
    match state.last_keystroke_secs {
        Some(last) if now - last >= DOZE_AFTER_SECS => Mood::Dozing,
        _ => Mood::Working,
    }
}

/// Register one counted (printable) keypress at time `now`.
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
