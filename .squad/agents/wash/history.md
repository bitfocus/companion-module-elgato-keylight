📌 Imported from squad-export on 2026-04-26T01:58:14.328Z. Portable knowledge carried over; project learnings from previous project preserved below.

# Project Context

- **Owner:** Justin James
- **Project:** Bitfocus Companion module for controlling Elgato Key Light and Ring Light devices
- **Stack:** TypeScript, Node.js, BitFocus Companion SDK
- **Created:** 2026-03-13

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

- Advanced Key Light feedbacks should read directly from fresh `self.data.keylight.options.lights[0]` state, not from a side cache; `src/feedbacks.ts`, `src/variables.ts`, `src/polling.ts`, and `src/actions.ts` form the full refresh path.
- `UpdateVariables()` is the safe re-evaluation choke point: it sets current variables, then calls `self.checkFeedbacks()` so both poll results and action responses restyle Companion buttons.
- Offline or stale light state must clear power/brightness/temperature feedback matches instead of treating fallback `0` values as real device state; freshness is tracked in `src/main.ts` and invalidated on failed light reads or failed write responses.
- Temperature feedbacks and operator-facing temperature variables should share the same Kelvin normalization path in `src/utils.ts`; compare rounded Kelvin values, not raw Elgato mired values.
- Saved color-temperature feedback options may still be older mired IDs; `src/upgrades.ts` now migrates those feedback values to rounded Kelvin dropdown IDs so edited buttons keep matching what operators see.

## Team Updates — 2026-04-26

**Feedback Behavior Fix Revision Cycle**

- Wash assigned to revise Kaylee's feedback fix after Zoe's rejection.
- Three blockers to resolve: stale variable cache, missing polling integration, missing text support in advanced feedback.
- Validation required: power feedback polling updates, brightness/temperature evaluation, offline/error state handling.
- Orchestration and session logs created for cycle tracking.

### Revision Complete — 2026-04-26T02:15:33Z

- **Status:** ✅ Approved by Zoe
- **Fixes Implemented:**
  - Removed dependency on unpopulated `self.data.variables`; now reads directly from fresh `self.data.keylight.options.lights[0]`
  - Added `checkFeedbacks()` call in `src/polling.ts` after light state updates
  - Implemented text override support in advanced feedback results
- **Validation:** `yarn build` ✅, targeted lint ✅, all regression checks ✅
- **Ready for integration**

### Cycle Complete — 2026-04-26T02:28:20Z

**Wash Status:** ✅ Revision complete and approved

**Blockers Successfully Addressed:**

1. Removed dependency on unpopulated `self.data.variables`; now reads directly from `self.data.keylight.options.lights[0]`
2. Added `checkFeedbacks()` call in `src/polling.ts` for live polling updates
3. Implemented text override support in advanced feedback callbacks

**Validation Results:**

- `yarn build` ✅ passed
- Targeted lint ✅ passed
- All regression checks ✅ passed:
  - Power feedback updates on polling changes
  - Brightness and temperature feedbacks evaluate correctly
  - Offline/error state transitions clear stale state safely

**Key Decision:** Advanced Key Light feedbacks now only match against fresh polled light status, and clear when module loses current light state.

**Orchestration Log Created:** 2026-04-26T02-28-20Z-wash.md

### 2026-04-26: Temperature feedback normalization cycle complete

**Wash status update:**

- Implemented centralized temperature normalization in `src/utils.ts` with `normalizeTemperatureSelection(...)`
- Added feedback upgrade in `src/upgrades.ts` to migrate legacy mired/raw values to Kelvin IDs
- Maintained backward compatibility for runtime comparisons
- All validation passed: `yarn build` ✅, targeted lint ✅, regression checks ✅
- Approved by Zoe for production integration.
- Orchestration logs created: 2026-04-26T02:34:12Z-wash.md, 2026-04-26T02:34:12Z-zoe.md.
- Session log created: 2026-04-26T02:34:12Z-temperature-feedback-approved.md.
