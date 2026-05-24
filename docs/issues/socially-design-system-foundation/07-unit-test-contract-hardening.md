# Issue 7: Unit Test and Contract Hardening Slice

## GitHub Issue
- URL: https://github.com/Krzysiek899/socially-app/issues/7
- Label: ready-for-agent

## PRD Context
Consolidate confidence in the design-system foundation and prevent contract regressions.

## Scope
- Harden unit test coverage for all completed slices.
- Standardize externally observable behavior testing patterns.
- Add guardrails against accidental broadening of strict variant contracts.
- Validate theme and focus-visible behavior across representative components.

## Acceptance Criteria
- [ ] Test coverage includes tokens/theme, primitives, form controls, accordion, and navbar slices.
- [ ] Tests assert public behavior and accessibility semantics rather than internal markup details.
- [ ] Contract checks prevent accidental broadening of strict variant APIs.
- [ ] Regression tests cover theme toggling and focus-visible behavior across representative components.
- [ ] Test baseline is documented for future component slices.

## Blocked By
- #4 Form Components Slice (Password Field + Date Field)
- #5 Disclosure Components Slice (Accordion)
- #6 Navbar Shell Slice (TopNav + theme toggle + nav states)

## Notes
This slice locks quality expectations for subsequent design-system growth.
