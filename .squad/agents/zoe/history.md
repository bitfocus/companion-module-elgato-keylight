📌 Imported from squad-export on 2026-04-26T01:58:14.328Z. Portable knowledge carried over; project learnings from previous project preserved below.

# Project Context

- **Owner:** Justin James
- **Project:** Bitfocus Companion module for controlling Elgato Key Light and Ring Light devices
- **Stack:** TypeScript, Node.js, BitFocus Companion SDK
- **Created:** 2026-03-13

## Learnings

### 2026-04-26: Wash feedback revision review

- Wash's revision now resolves feedback matches through `ModuleInstance.getLightStatus()` instead of the dead variable metadata path, so feedbacks evaluate against live `keylight.options.lights[0]` state.
- `src/variables.ts` is now the central refresh hook: after `setVariableValues(...)` it also runs `checkFeedbacks()`, which means both polling and successful/failed action updates re-evaluate button feedbacks.
- Offline safety now depends on `src/main.ts` freshness tracking (`lightStatus.isValid` + `lastUpdatedAt`) with invalidation on polling/action failures; stale light-state variables now surface as `$NA. Light State Unavailable`.
- Reviewer validation for this module is `yarn build` plus linting the touched TS sources when workspace-level `yarn lint` is polluted by unrelated non-module files.

<!-- Append new learnings below. Each entry is something lasting about the project. -->

### 2026-04-26: Feedback regression review

- `src/feedbacks.ts` resolves feedback comparisons through `self.data.variables`, but the current source never populates that map, so the callback returns `{}` and feedbacks never activate.
- `src/polling.ts` refreshes polled device state and variables, but does not call `checkFeedbacks(...)`; polling alone is not enough to re-evaluate Companion feedbacks after the device state changes.
- The advanced feedbacks currently return only `color`/`bgcolor`; text changes are not implemented in the callback even though Companion advanced feedbacks can style text.
- Key review paths for this module’s feedback behavior are `src/feedbacks.ts`, `src/polling.ts`, `src/main.ts`, and `src/variables.ts`.

### 2026-04-26: Temperature feedback unit mismatch review

- `src/variables.ts` exposes light temperature as rounded Kelvin text via `getKelvin(...)`, but `src/feedbacks.ts` still compares the selected feedback option against raw `lightStatus.temperature` mired values.
- `src/main.ts` builds temperature feedback dropdown labels in Kelvin while storing option IDs as `getMired(kelvin)`, so a displayed `5600K` selection resolves to `179` mired and can miss a live device value like `178` mired even though the variable still shows `5600K`.
- Reviewer verdict for this revision: build passes, repo-wide `yarn lint` is polluted by unrelated `.squad-archive` files, and targeted lint for `src/feedbacks.ts src/variables.ts src/utils.ts src/main.ts src/polling.ts` passes.

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

### Revision Complete — 2026-04-26T02:15:33Z

- **Status:** ✅ Approved
- **Review Outcome:**
  - Live light state feedback evaluation working correctly
  - `checkFeedbacks()` refresh on polling updates confirmed
  - `checkFeedbacks()` refresh on action response completion confirmed
  - Advanced text override support implemented
  - Safe stale/offline state clearing validated
- **Build & Lint:** ✅ passed
- **All regression checks passed**
- **Ready for production integration**

### Cycle Complete — 2026-04-26T02:28:20Z

**Zoe Status:** ✅ Review complete. Approved Wash's revision.

**Key Findings on Initial Rejection:**

- `src/variables.ts` shows rounded Kelvin (`5600K`) but `src/feedbacks.ts` compares raw mired values
- User-visible `5600K` maps to `179` mired, fails on device `178` mired even though variable still shows `5600K`

**Key Approvals on Wash Revision:**

- Feedbacks read live light state directly from `lights[0]`
- Refresh integrated on polling and action updates
- Advanced text override support added
- Stale/offline state clearing validated

**Orchestration Log Created:** 2026-04-26T02-28-20Z-zoe.md

### 2026-04-26: Kelvin feedback revision verdict

- `src/feedbacks.ts` now normalizes both the configured temperature option and the live `lights[0].temperature` reading through `normalizeTemperatureSelection(...)`, so feedback matching happens in the same rounded Kelvin domain shown by `src/variables.ts`.
- `src/upgrades.ts` adds a temperature feedback migration that rewrites legacy saved values (raw mired IDs or Kelvin strings) to rounded Kelvin dropdown IDs, while the runtime comparison still tolerates legacy values before migration persists.
- Reviewer validation for this bugfix: `yarn build` passed, targeted `yarn lint:raw src/feedbacks.ts src/variables.ts src/utils.ts src/main.ts src/polling.ts src/upgrades.ts src/actions.ts` passed, and repo-wide `yarn lint` still fails only on unrelated `.squad-archive-*` files.

### 2026-04-26: Temperature feedback normalization cycle complete

**Wash & Zoe cycle outcome:**

- Wash implemented centralized temperature normalization in `src/utils.ts` and added feedback upgrade in `src/upgrades.ts`.
- Zoe validated all changes: build passed, targeted lint passed, backward compatibility confirmed.
- Decision merged to decisions.md. Inbox files cleared.
- Ready for production integration.
- Orchestration logs created: 2026-04-26T02:34:12Z-wash.md, 2026-04-26T02:34:12Z-zoe.md.
- Session log created: 2026-04-26T02:34:12Z-temperature-feedback-approved.md.

### 2026-04-26: Boolean feedback migration review

- `src/feedbacks.ts` now defines the Key Light power, brightness, and temperature matchers as Companion boolean feedbacks, so the callback is pure state validation and Companion owns the triggered style.
- `src/upgrades.ts` uses `CreateConvertToBooleanFeedbackUpgradeScript(...)` to move legacy advanced-feedback option fields (`text`, `fg`, `bg`) into boolean feedback style fields (`text`, `color`, `bgcolor`) while preserving the separate temperature normalization migration.
- Reviewer verdict for this revision: `yarn build` passed, targeted `yarn lint:raw src/feedbacks.ts src/upgrades.ts src/main.ts src/utils.ts src/actions.ts src/polling.ts src/variables.ts` passed, and repo-wide `yarn lint` still fails only on unrelated `.squad-archive-*` files.

### 2026-04-26: Boolean feedback migration approved — 2026-04-26T02:41:16Z

**Kaylee Status:** ✅ Task complete. Converted feedbacks to boolean with style migration.

- Boolean feedback definitions with default active colors and text expression support
- Upgrade script preserves legacy `text`, `fg`, `bg` option values in boolean feedback `style`
- Temperature feedback keeps normalized Kelvin comparison matching variable display values
- Build validation passed ✅
- Targeted lint validation passed ✅
- Ready for next phase

**Zoe Status:** ✅ Review complete. Approved migration.

- Validated boolean feedback definitions and style migration script
- Confirmed temperature feedback uses normalized Kelvin path matching user-visible variables
- Confirmed upgrade script preserves trigger styling and text expression parsing
- Build validation passed ✅
- Targeted lint validation passed ✅
- Ready for production integration

**Orchestration Logs Created:**

- 2026-04-26T02-41-16Z-kaylee.md
- 2026-04-26T02-41-16Z-zoe.md

**Session Log Created:** 2026-04-26T02-41-16Z-boolean-feedbacks-approved.md
