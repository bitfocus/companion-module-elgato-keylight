## 2026-04-26: Feedback Behavior Fixes

### Kaylee Decision: Refresh Feedbacks from Live Light State

The module's feedback callbacks should read directly from `self.data.keylight.options.lights[0]` and not depend on the unused `self.data.variables` metadata object.

Whenever module state is pushed through `UpdateVariables`, we should also call `self.checkFeedbacks()` so polled changes and action responses immediately restyle Companion buttons.

### Zoe Decision: Feedback Regression Review — Current State Rejected

**Scope:** Review of current Elgato Key Light feedback implementation.

**Decision:** Reject the current feedback state as shippable.

**Issues Identified:**

- `src/feedbacks.ts` depends on `self.data.variables`, but the map is never populated in the current source.
- `src/polling.ts` never calls `checkFeedbacks(...)`, so polled state changes will not trigger feedback re-evaluation.
- The current advanced feedback result does not implement text overrides, so "change text" expectations are unsupported.

**Required Revision Owner:** Wash (not Kaylee).

**Regression Checks Required on Next Fix:**

- Power feedback updates style when the lamp changes on/off through polling.
- Brightness and temperature feedbacks still evaluate correctly.
- Offline/error polling transitions do not leave stale active feedback state behind.

### Wash Decision: Fresh Feedback State with Safe Stale Clearing

Advanced Key Light feedbacks now only match against fresh polled light status, and they clear when the module loses current light state.

**Why:** Using fallback `0` values after a failed poll made "power off" and similar feedbacks look valid even when the device was offline. Tying feedback evaluation to fresh `lights[0]` state keeps power, brightness, and temperature feedbacks honest and prevents stale button text/colors from lingering.

**Implementation:**

- Track light-status validity and last update time on the module instance.
- Invalidate light status on failed `getLights()` polls and failed write responses.
- Re-evaluate feedbacks from `UpdateVariables()`, and allow advanced feedbacks to override `text` as well as colors when a match is live.

### Zoe Decision: Feedback Revision Approved

**Verdict:** Approve Wash's feedback revision for the previously blocked behavior.

**Confirmed Fixes:**

- Feedbacks now read live light state
- Refresh after polling/action-driven variable updates
- Support advanced text override
- Clear safely when light state is stale/offline

**Validation:**

- `yarn build` passed
- Targeted lint passed (`src/actions.ts src/feedbacks.ts src/main.ts src/polling.ts src/variables.ts`)
- Repo-wide `yarn lint` blocked by unrelated workspace files (not a blocker)

**Residual Note:** Delta/toggle actions still depend on read-then-write pattern, but this is not a release blocker.
