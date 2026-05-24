# Socially Design System Foundation - Issue Drafts

Publish order: 1 -> 2 -> 5 -> 3 -> 4 -> 6 -> 7

## 1) Token Engine + Theme Preference Baseline

Labels: ready-for-agent

## Parent

Derived from PRD: socially-design-system-foundation-prd

## What to build

Create the initial design token and theming foundation for Socially using a two-layer CSS variable model (primitive plus semantic). Implement light and dark themes with separate neutral mappings, apply the approved brand palette semantics, and add system-plus-manual theme preference with persistence.

## Acceptance criteria

- [ ] Two-layer token architecture is available in CSS variables with explicit naming.
- [ ] Semantic mappings include primary, primary-strong, success, warning, info, and core text/surface/border intents.
- [ ] Light and dark themes both render with separate neutral semantic mappings and maintain WCAG AA targets for core text and interactive states.
- [ ] Theme mode supports system preference and user override with persisted selection.
- [ ] Unit tests verify token mapping resolution and theme preference behavior.

## Blocked by

None - can start immediately.

---

## 2) Primitive Components v1 (Button, Input, Card, Avatar, Badge)

Labels: ready-for-agent

## Parent

Derived from PRD: socially-design-system-foundation-prd

## What to build

Build strict, semantic-token-only primitive components for Button, Input, Card, Avatar, and Badge. Lock internals to prevent ad-hoc styling drift and enforce constrained variants and sizes.

## Acceptance criteria

- [ ] Components consume semantic tokens only (no raw brand values in component styles).
- [ ] Variant and size APIs are constrained and documented in code-level contracts.
- [ ] Focus-visible, disabled, and hover/active states use global interaction semantics.
- [ ] Accessibility semantics are present for interactive and form primitives.
- [ ] Unit tests validate externally observable behavior for variants, states, and roles.

## Blocked by

- #1 Token Engine + Theme Preference Baseline

---

## 5) Layout System Slice (Flex + Grid primitives for common page shells)

Labels: ready-for-agent

## Parent

Derived from PRD: socially-design-system-foundation-prd

## What to build

Create reusable layout primitives for common page composition based on flex and grid. Include composable patterns for page, section, stack, cluster, split, and grid behaviors aligned with spacing and responsive token decisions.

## Acceptance criteria

- [ ] Layout primitives support flex and grid composition for common app shells.
- [ ] Responsive behavior aligns with fluid layout plus max-width tier decisions.
- [ ] Layout styles consume tokens and avoid one-off hard-coded spacing.
- [ ] Public APIs prioritize composability over page-specific assumptions.
- [ ] Unit tests validate layout variant contracts and responsive composition behavior.

## Blocked by

- #1 Token Engine + Theme Preference Baseline

---

## 3) Form Components Slice (Password Field + Date Field)

Labels: ready-for-agent

## Parent

Derived from PRD: socially-design-system-foundation-prd

## What to build

Create reusable password and date field components on top of primitives. Include accessible labeling, validation-friendly states, and robust interaction behavior. Implement password visibility toggle behavior as part of the password field contract.

## Acceptance criteria

- [ ] Password field supports show/hide toggle with accessible controls and labels.
- [ ] Date field provides a reusable API and supports standard form states.
- [ ] Error, focus, disabled, and helper text behavior follow semantic token rules.
- [ ] Components remain strict and avoid leaking internal style hooks.
- [ ] Unit tests cover interaction states and accessibility behavior.

## Blocked by

- #2 Primitive Components v1 (Button, Input, Card, Avatar, Badge)

---

## 4) Disclosure Components Slice (Accordion)

Labels: ready-for-agent

## Parent

Derived from PRD: socially-design-system-foundation-prd

## What to build

Build an accessible accordion/disclosure component that supports reusable section expansion patterns with keyboard and ARIA-compliant behavior.

## Acceptance criteria

- [ ] Accordion supports expanded/collapsed state with clear semantic API.
- [ ] Keyboard navigation and focus handling are accessible and predictable.
- [ ] ARIA attributes and relationships are correctly applied.
- [ ] Styling uses semantic tokens and shared interaction states.
- [ ] Unit tests validate accessibility behavior and state transitions.

## Blocked by

- #2 Primitive Components v1 (Button, Input, Card, Avatar, Badge)

---

## 6) Navbar Shell Slice (TopNav + theme toggle + nav states)

Labels: ready-for-agent

## Parent

Derived from PRD: socially-design-system-foundation-prd

## What to build

Create a reusable navbar shell (TopNav) that works as a common page header and navigation structure. Include active navigation states and integrated theme toggle behavior tied to the theme preference module.

## Acceptance criteria

- [ ] TopNav supports reusable slots/areas for brand, links, and actions.
- [ ] Active and hover states follow semantic interaction tokens.
- [ ] Theme toggle is integrated and reflects persisted/system theme behavior.
- [ ] Navbar layout composes cleanly with layout system primitives.
- [ ] Unit tests verify state behavior and accessible navigation interactions.

## Blocked by

- #2 Primitive Components v1 (Button, Input, Card, Avatar, Badge)
- #5 Layout System Slice (Flex + Grid primitives for common page shells)

---

## 7) Unit Test and Contract Hardening Slice

Labels: ready-for-agent

## Parent

Derived from PRD: socially-design-system-foundation-prd

## What to build

Consolidate and harden unit-test coverage and public component/token contracts for the completed foundation slices. Standardize test patterns around externally observable behavior and prevent regressions in accessibility and theming.

## Acceptance criteria

- [ ] Test coverage includes tokens/theme, primitives, form controls, accordion, and navbar slices.
- [ ] Tests assert public behavior and accessibility semantics rather than internal markup details.
- [ ] Contract checks prevent accidental broadening of strict variant APIs.
- [ ] Regression tests cover theme toggling and focus-visible behavior across representative components.
- [ ] Test baseline is documented for future component slices.

## Blocked by

- #3 Form Components Slice (Password Field + Date Field)
- #4 Disclosure Components Slice (Accordion)
- #6 Navbar Shell Slice (TopNav + theme toggle + nav states)
