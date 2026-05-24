# Issue 3: Layout System Slice (Flex + Grid primitives for common page shells)

## GitHub Issue
- URL: https://github.com/Krzysiek899/socially-app/issues/3
- Label: ready-for-agent

## PRD Context
Provide reusable composition primitives for page-level structure so screens are consistent and responsive.

## Scope
- Build layout primitives for common shells and sections.
- Support patterns: page, section, stack, cluster, split, grid.
- Align with fluid layout strategy and max-width tiers.
- Ensure spacing derives from token system.

## Acceptance Criteria
- [ ] Layout primitives support flex and grid composition for common app shells.
- [ ] Responsive behavior aligns with fluid layout plus max-width tier decisions.
- [ ] Layout styles consume tokens and avoid one-off hard-coded spacing.
- [ ] Public APIs prioritize composability over page-specific assumptions.
- [ ] Unit tests validate layout variant contracts and responsive composition behavior.

## Blocked By
- #1 Token Engine + Theme Preference Baseline

## Notes
Navbar composition depends on this slice being available.
