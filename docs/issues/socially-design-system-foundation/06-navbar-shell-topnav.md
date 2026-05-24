# Issue 6: Navbar Shell Slice (TopNav + theme toggle + nav states)

## GitHub Issue
- URL: https://github.com/Krzysiek899/socially-app/issues/6
- Label: ready-for-agent

## PRD Context
Define a reusable navigation shell for common pages with integrated theme control and state handling.

## Scope
- Build TopNav with reusable slots for brand, links, and actions.
- Implement active/hover interaction-state semantics.
- Integrate theme toggle with persisted/system preference behavior.
- Compose navbar using layout primitives for responsive behavior.

## Acceptance Criteria
- [ ] TopNav supports reusable slots/areas for brand, links, and actions.
- [ ] Active and hover states follow semantic interaction tokens.
- [ ] Theme toggle is integrated and reflects persisted/system theme behavior.
- [ ] Navbar layout composes cleanly with layout system primitives.
- [ ] Unit tests verify state behavior and accessible navigation interactions.

## Blocked By
- #2 Primitive Components v1 (Button, Input, Card, Avatar, Badge)
- #3 Layout System Slice (Flex + Grid primitives for common page shells)

## Notes
This is the first common page-shell component and should be reusable across routes.
