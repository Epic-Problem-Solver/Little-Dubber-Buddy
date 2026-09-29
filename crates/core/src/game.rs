//! Game actions: starting/abandoning projects, completion, purchases.

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
