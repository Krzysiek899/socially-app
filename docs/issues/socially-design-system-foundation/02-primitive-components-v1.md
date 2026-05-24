# Issue 2: Primitive Components v1 (Button, Input, Card, Avatar, Badge)

## GitHub Issue
- URL: https://github.com/Krzysiek899/socially-app/issues/2
- Label: ready-for-agent

## PRD Context
Introduce strict reusable primitives that enforce semantic-token usage and prevent style drift.

## Scope
- Build primitives: Button, Input, Card, Avatar, Badge.
- Enforce strict variants and sizes.
- Consume semantic tokens only.
- Lock internals from ad-hoc style overrides.
- Apply global interaction-state semantics for hover/active/focus/disabled.

## Acceptance Criteria
- [ ] Components consume semantic tokens only (no raw brand values in component styles).
- [ ] Variant and size APIs are constrained and documented in code-level contracts.
- [ ] Focus-visible, disabled, and hover/active states use global interaction semantics.
- [ ] Accessibility semantics are present for interactive and form primitives.
- [ ] Unit tests validate externally observable behavior for variants, states, and roles.

## Blocked By
- #1 Token Engine + Theme Preference Baseline

## Notes
This slice is a prerequisite for form controls, accordion, and navbar assembly.
