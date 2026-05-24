# Issue 4: Form Components Slice (Password Field + Date Field)

## GitHub Issue
- URL: https://github.com/Krzysiek899/socially-app/issues/4
- Label: ready-for-agent

## PRD Context
Add high-frequency form controls as reusable components with accessibility-first behavior.

## Scope
- Build PasswordField with accessible show/hide toggle behavior.
- Build DateField with reusable form API and state handling.
- Support error, focus, disabled, helper semantics.
- Keep strict internal contracts and semantic-token styling.

## Acceptance Criteria
- [ ] Password field supports show/hide toggle with accessible controls and labels.
- [ ] Date field provides a reusable API and supports standard form states.
- [ ] Error, focus, disabled, and helper text behavior follow semantic token rules.
- [ ] Components remain strict and avoid leaking internal style hooks.
- [ ] Unit tests cover interaction states and accessibility behavior.

## Blocked By
- #2 Primitive Components v1 (Button, Input, Card, Avatar, Badge)

## Notes
This slice feeds the final hardening and test consolidation work.
