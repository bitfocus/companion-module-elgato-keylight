## 2026-04-26: Feedback Behavior Fixes

### Kaylee Decision: Match Temperature Feedback in Kelvin

Color temperature feedback should compare the same operator-facing Kelvin value that variables display, not the raw mired value from the Elgato API.

**Why:**

- Operators configure the feedback as "Temperature in Kelvin".
- `$(keylight:options.light.lightTemperature)` already shows rounded Kelvin via `getKelvin(...)`.
- Some device mired readings round to the displayed Kelvin value without being numerically identical to the feedback choice's raw mired ID, so comparing raw mired values can miss a visible `5600K` match.

**Implementation:**

- Temperature feedback choices now store Kelvin IDs to match the UI label.
- The feedback callback normalizes live light temperature with `getKelvin(...)`.
- Legacy saved feedbacks that still store mired IDs are normalized before comparison so existing buttons keep working.

### Zoe Decision: Reject temperature feedback revision on unit mismatch

**Verdict:** Reject the current revision for the reported color-temperature feedback bug.

**Why:** The comparison path still mismatches display units and stored units. `src/variables.ts` shows rounded Kelvin text (`5600K`), but `src/feedbacks.ts` compares against the raw mired reading from `lightStatus.temperature`. The dropdown in `src/main.ts` labels the choice as Kelvin while storing `getMired(kelvin)` as the option ID, so a user-visible `5600K` selection maps to `179` mired and fails when the lamp reports `178` mired even though the variable still rounds to `5600K`.

**Next revision owner:** Wash (not Kaylee).

**Regression expectation:** Temperature feedback must compare in the same unit and rounding domain the operator sees in Companion, or the variable/feedback pair will keep disagreeing.

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

### Wash Decision: Normalize and Migrate Temperature Feedback Values

Color temperature feedbacks should compare and store rounded Kelvin values, even though the Elgato API still reports raw mired temperatures.

**Why:**

- Operators see rounded Kelvin values in variables and feedback dropdown labels.
- Older saved feedbacks may still carry raw mired IDs, which can leave the UI selection out of sync with the live value comparison.

**Implementation:**

- Centralize temperature normalization in `src/utils.ts` so variables and feedback matching share the same Kelvin rounding rules.
- Keep runtime feedback matching backward-compatible by accepting Kelvin, mired, or `5600K`-style saved values.
- Add a feedback upgrade in `src/upgrades.ts` to rewrite saved `temperature` feedback options from legacy mired/raw values to Kelvin dropdown IDs.

### Zoe Decision: Approve Wash's temperature normalization revision

**Verdict:** Approve Wash's revision for the Kelvin-vs-mired feedback bug.

**Why:**

- `src/feedbacks.ts` compares temperature feedbacks in rounded Kelvin, matching the variable/UI value users see.
- `src/utils.ts` normalizes both legacy mired IDs and Kelvin-formatted selections to the same comparison value.
- `src/upgrades.ts` migrates older saved temperature feedback values forward to Kelvin IDs.

**Validation:**

- `yarn build` ✅
- `yarn lint:raw src/feedbacks.ts src/variables.ts src/utils.ts src/main.ts src/polling.ts src/upgrades.ts src/actions.ts` ✅
- `yarn lint` ⚠️ blocked by unrelated `.squad-archive-*` files, not by this revision
