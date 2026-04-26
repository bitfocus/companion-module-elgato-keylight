---
name: 'companion-feedback-regression'
description: 'How to validate Companion feedbacks driven by polled device state'
domain: 'testing'
confidence: 'high'
source: 'observed'
tools:
  - name: 'rg'
    description: 'Trace feedback definitions, state maps, and polling updates'
    when: 'Use when feedbacks appear stuck or never re-evaluate'
---

## Context

Use this when a Companion module defines feedbacks from device state that is refreshed by polling or async callbacks.

## Patterns

- Verify the feedback callback reads from a state source that is actually populated at runtime.
- Verify the code path that mutates state also calls `checkFeedbacks(...)` or `checkFeedbacksById(...)` so Companion re-runs the feedback.
- For advanced feedbacks, confirm the callback returns every style field the user expects to change (`text`, `color`, `bgcolor`, etc.).
- Validate failure paths too: offline/default state should clear or correctly restyle the feedback instead of leaving stale state behind.

## Examples

- `src/feedbacks.ts` currently reads `self.data.variables[...]`; if that map is empty, every feedback callback bails out with `{}`.
- `src/polling.ts` updates `self.data.keylight` and variables, but without `checkFeedbacks(...)` the UI will not be notified to re-run feedback logic.

## Anti-Patterns

- Assuming updated polled state automatically refreshes Companion feedbacks.
- Comparing against a lookup table that is never initialized.
- Claiming text-changing feedback support when the advanced feedback result never returns `text`.
