# Changelog

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
