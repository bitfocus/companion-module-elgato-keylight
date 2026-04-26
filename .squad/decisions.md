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
