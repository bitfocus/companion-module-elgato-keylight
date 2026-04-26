---
name: 'feedback-refresh'
description: 'Keep Companion feedbacks in sync with polled device state'
domain: 'companion-sdk'
confidence: 'high'
source: 'earned'
tools:
  - name: 'view'
    description: 'Inspect feedback, variable, and polling files together'
    when: 'Tracing why a Companion feedback never changes appearance'
---

## Context

Use this skill when a Companion module has feedback definitions that should react to device state from polling or action callbacks, but operators report that button styles never update.

## Patterns

- Read feedback callbacks and the state update path together (`feedbacks.ts`, `variables.ts`, polling/action files).
- Compare feedback option values directly against the live device state stored on the module instance when the state shape already matches the UI option IDs.
- If the UI exposes a normalized unit (for example Kelvin) but the device API stores a different raw unit (for example mired), normalize both the live state and the configured feedback value to the same operator-facing unit before comparing them.
- After `setVariableValues()`, call `self.checkFeedbacks()` so Companion re-evaluates button styles whenever fresh state arrives.
- Track whether the polled device state is still fresh; if polling fails or a write request fails, invalidate that state so feedbacks clear instead of matching fallback defaults.
- For advanced feedbacks that promise text changes, return `text` along with `color`/`bgcolor` when the live state matches.

## Examples

- In this Elgato Key Light module, `src/feedbacks.ts` now maps each feedback ID to a raw light status key (`on`, `brightness`, `temperature`) and compares the selected option against `self.data.keylight.options?.lights[0]?.[statusKey]`.
- In this Elgato Key Light module, the temperature variable is shown as rounded Kelvin, so `src/feedbacks.ts` should compare `getKelvin(lightStatus.temperature)` against the configured Kelvin selection rather than comparing raw mired values.
- `src/variables.ts` calls `self.checkFeedbacks()` immediately after `self.setVariableValues(variables)` so both polling and action responses refresh feedback styling.
- `src/main.ts` can hold a small freshness record (`isValid`, `lastUpdatedAt`) so feedback callbacks and delta-style actions can refuse stale offline state.
- `src/feedbacks.ts` can parse a configured text override with `context.parseVariablesInString(...)` and return it from the advanced feedback result when the selected device value matches.

## Anti-Patterns

- Depending on an unpopulated metadata cache to resolve feedback values.
- Comparing raw device units against normalized operator-facing values.
- Updating variables without calling `checkFeedbacks()`, which leaves Companion buttons visually stale even though the device state changed.
- Treating fallback or error-path `0` values as valid device state for OFF/brightness/temperature feedback matches.
