# Little Dubber Buddy — Gauntlet Ledger

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
