📌 Imported from squad-export on 2026-04-26T01:58:14.328Z. Portable knowledge carried over; project learnings from previous project preserved below.

# Project Context

- **Owner:** Justin James
- **Project:** Bitfocus Companion module for controlling Elgato Key Light and Ring Light devices
- **Stack:** TypeScript, Node.js, BitFocus Companion SDK
- **Created:** 2026-03-13

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

- Feedback callbacks in `src/feedbacks.ts` should compare directly against `self.data.keylight.options.lights[0]`; the old `self.data.variables` metadata path was dead and left all style feedbacks inert.
- `src/variables.ts` is the reliable refresh point for operator-facing state: after `setVariableValues()`, call `self.checkFeedbacks()` so polling and action updates immediately restyle buttons.
- Validation for this module currently uses `yarn build` and `yarn lint`; full-repo lint can be polluted by workspace-level `.squad` archive files, so source-file linting on changed module files is a useful sanity check while keeping module work isolated.
- Temperature UI in this module is operator-facing Kelvin, but device state is raw mired: when `src/variables.ts` and `src/feedbacks.ts` need to agree, normalize both sides with `getKelvin(...)` or feedback matches can miss values like a displayed `5600K`.

## Team Updates — 2026-04-26

**Feedback Behavior Fix Revision Cycle**

- Initial fix by Kaylee implemented partial feedback refresh and live state reading.
- Zoe review identified three blockers: stale variable cache dependency, missing polling integration, missing text support in advanced feedback.
- Wash assigned to revise fix and address all identified regressions.

### Cycle Complete — 2026-04-26T02:28:20Z

**Kaylee Status:** ✅ Task complete and locked from next revision cycle

- Temperature feedback fix implemented with Kelvin normalization
- Identified unit-domain mismatch between variables and feedback evaluation
- Work approved by Zoe on 2026-04-26T02:15:33Z; handed off to Wash for comprehensive revision

**Key Decision:** "Kaylee Decision: Match Temperature Feedback in Kelvin" — Temperature feedback should compare the same operator-facing Kelvin value that variables display, not raw mired values from Elgato API.

**Orchestration Log Created:** 2026-04-26T02:28:20Z-kaylee.md
