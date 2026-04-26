📌 Imported from squad-export on 2026-04-26T01:58:14.328Z. Portable knowledge carried over; project learnings from previous project preserved below.

# Project Context

- **Owner:** Justin James
- **Project:** Bitfocus Companion module for controlling Elgato Key Light and Ring Light devices
- **Stack:** TypeScript, Node.js, BitFocus Companion SDK
- **Created:** 2026-03-13

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

### 2026-04-26: Feedback regression review

- `src/feedbacks.ts` resolves feedback comparisons through `self.data.variables`, but the current source never populates that map, so the callback returns `{}` and feedbacks never activate.
- `src/polling.ts` refreshes polled device state and variables, but does not call `checkFeedbacks(...)`; polling alone is not enough to re-evaluate Companion feedbacks after the device state changes.
- The advanced feedbacks currently return only `color`/`bgcolor`; text changes are not implemented in the callback even though Companion advanced feedbacks can style text.
- Key review paths for this module’s feedback behavior are `src/feedbacks.ts`, `src/polling.ts`, `src/main.ts`, and `src/variables.ts`.

### 2026-04-25: Merge validation — origin/main → feature/preset-architecture

**Review scope:** Post-merge quality validation for 6 upstream commits

**Validation results:**

- Build: passing ✅
- Lint: passing ✅
- Tests: 323/323 across 30 test suites ✅
- Type safety: maintained across all changes ✅
- Backward compatibility: confirmed (new polling config defaults to true = existing behavior) ✅
- Dropped functionality: none detected ✅

**Regression risk:** LOW

**Pattern observed:** Polling config changes include comprehensive upgrade script that properly initializes new fields, preventing data migration issues.

**Quality checkpoint:** New config toggle actions properly implemented following existing action patterns (enum-based IDs, type-safe config updates, state persistence).

### 2026-03-13: Merge origin/main → feature/preset-architecture

- **Commits merged**: 6 commits including v4.10.0 (ZoomISO v3 support) and v4.11.0 (ISO polling config options)
- **Conflicts**: Only yarn.lock (resolved via regeneration)
- **Validation**: Build ✅, Lint ✅, Tests ✅ (323/323 passing)
- **Key changes**:
  - Added 4 new config checkboxes for granular ZoomISO polling control
  - New upgrade script `addPollingConfigOptions.ts` sets defaults to true (maintains existing behavior)
  - 4 new toggle actions for runtime polling control
  - Updated osc.ts to conditionally poll based on config flags
  - Security updates: picomatch, flatted, tar
- **Regression risk**: LOW - All changes backward compatible, no dropped behavior
- **Pattern observed**: Config changes require upgrade script + new action toggles for runtime control
- **Test strategy**: Existing test suite validates merge quality - no test updates needed for config additions

## Team Updates — 2026-04-26

**Feedback Behavior Fix Revision Cycle**

- Kaylee's initial feedback fix rejected by Zoe review.
- Three issues identified: stale variable cache in feedbacks.ts, missing polling integration, no text support in advanced feedback.
- Wash assigned to implement comprehensive revision addressing all blockers.
- Regression checks defined: power feedback polling updates, brightness/temperature evaluation, offline/error state transitions.
