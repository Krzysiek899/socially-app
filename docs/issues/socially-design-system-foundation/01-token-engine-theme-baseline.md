# Issue 1: Token Engine + Theme Preference Baseline

## GitHub Issue
- URL: https://github.com/Krzysiek899/socially-app/issues/1
- Label: ready-for-agent

## PRD Context
Establish the base design-system contract for Socially so all subsequent components and layouts can consume stable semantic tokens.

## Scope
- Implement two-layer CSS token architecture (primitive + semantic).
- Map approved brand palette semantics:
  - primary: #0B4873
  - primary-strong: #163B58
  - success: #63B964
  - warning: #FBA627
  - info: #30A9A8
- Configure light and dark themes with separate neutral semantic mappings.
- Implement theme preference behavior: system default + manual override with persistence.

## Acceptance Criteria
- [ ] Two-layer token architecture is available in CSS variables with explicit naming.
- [ ] Semantic mappings include primary, primary-strong, success, warning, info, and core text/surface/border intents.
- [ ] Light and dark themes both render with separate neutral semantic mappings and maintain WCAG AA targets for core text and interactive states.
- [ ] Theme mode supports system preference and user override with persisted selection.
- [ ] Unit tests verify token mapping resolution and theme preference behavior.

## Blocked By
None - can start immediately.

## Notes
This is the foundation slice. Every other issue depends on this contract being stable.
