//! Economy: tier data, unlocks, payouts, upgrade costs.
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
