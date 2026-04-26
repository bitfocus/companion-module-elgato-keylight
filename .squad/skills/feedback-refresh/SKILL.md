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
- After `setVariableValues()`, call `self.checkFeedbacks()` so Companion re-evaluates button styles whenever fresh state arrives.

## Examples

- In this Elgato Key Light module, `src/feedbacks.ts` now maps each feedback ID to a raw light status key (`on`, `brightness`, `temperature`) and compares the selected option against `self.data.keylight.options?.lights[0]?.[statusKey]`.
- `src/variables.ts` calls `self.checkFeedbacks()` immediately after `self.setVariableValues(variables)` so both polling and action responses refresh feedback styling.

## Anti-Patterns

- Depending on an unpopulated metadata cache to resolve feedback values.
- Updating variables without calling `checkFeedbacks()`, which leaves Companion buttons visually stale even though the device state changed.
