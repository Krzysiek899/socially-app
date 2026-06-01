import React, { useState } from 'react';
import './Playground.css';
import {
  Button,    BUTTON_VARIANTS, BUTTON_SIZES,
  Input,     INPUT_SIZES,
  Card,      CARD_VARIANTS,
  Avatar,    AVATAR_SIZES,
  Badge,     BADGE_VARIANTS, BADGE_SIZES,
  Accordion,
  PasswordField,
  DateField,
  DateTimeField,
  Dropdown, DROPDOWN_VARIANTS, DROPDOWN_SIZES,
  TopNav,
  ThemeToggle,
} from '../components/index.ts';
import type { AccordionItem } from '../components/index.ts';
import type { ThemePreference } from '../hooks/useTheme.ts';
import { useTheme } from '../hooks/useTheme.ts';
import { Page, Section as LayoutSection, Stack, Cluster, Split, Grid } from '../layout/index.tsx';

/* ─── Section wrapper ─────────────────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="pg__section">
      <h2 className="pg__section-title">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pg__row">
      <span className="pg__row-label">{label}</span>
      {children}
    </div>
  );
}

/* ─── Playground ──────────────────────────────────────────────────────────── */
const ACCORDION_SINGLE: AccordionItem[] = [
  {
    id: 'what',
    heading: 'What is the Socially Design System?',
    content: 'A token-driven, accessible component library built for the Socially app. All styles reference semantic tokens — never raw primitives or hard-coded values.',
  },
  {
    id: 'why',
    heading: 'Why use semantic tokens?',
    content: 'Semantic tokens decouple intent (e.g. "primary") from raw values, making it trivial to swap themes without touching component code.',
  },
  {
    id: 'how',
    heading: 'How does keyboard navigation work?',
    content: 'Arrow Down / Arrow Up moves focus between headers. Home jumps to the first, End to the last. Enter or Space toggles the focused item.',
  },
  {
    id: 'disabled',
    heading: 'This item is disabled',
    content: 'You should never see this.',
    disabled: true,
  },
];

const ACCORDION_MULTI: AccordionItem[] = [
  {
    id: 'a',
    heading: 'Design tokens',
    content: 'Primitive → Semantic → Component. Every layer only references the layer above.',
  },
  {
    id: 'b',
    heading: 'Accessible by default',
    content: 'WAI-ARIA patterns, focus management, and keyboard contracts are built in — not bolted on.',
  },
  {
    id: 'c',
    heading: 'Dark mode support',
    content: 'Set data-theme="dark" on <html> or let the OS preference drive it automatically via prefers-color-scheme.',
  },
];

export function Playground() {
  const { theme, preference, setTheme } = useTheme();
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="pg">
      {/* Header */}
      <header className="pg__header">
        <div>
          <h1 className="pg__title">Component Playground</h1>
          <p className="pg__subtitle">Socially Design System — Primitive Components + Disclosure</p>
        </div>
        <div className="pg__theme-toggle" role="group" aria-label="Theme selector">
          {(['light', 'dark', 'system'] as ThemePreference[]).map((p) => (
            <Button
              key={p}
              variant={preference === p ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTheme(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
          <Badge variant="neutral" size="sm">
            resolved: {theme}
          </Badge>
        </div>
      </header>

      {/* ── Button ── */}
      <Section title="Button">
        <Row label="Variants">
          {BUTTON_VARIANTS.map((v) => (
            <Button key={v} variant={v}>{v}</Button>
          ))}
        </Row>
        <Row label="Sizes">
          {BUTTON_SIZES.map((s) => (
            <Button key={s} size={s}>Size {s}</Button>
          ))}
        </Row>
        <Row label="Disabled">
          {BUTTON_VARIANTS.map((v) => (
            <Button key={v} variant={v} disabled>{v}</Button>
          ))}
        </Row>
        <Row label="Submit">
          <Button type="submit" variant="primary">Submit form</Button>
          <Button type="reset" variant="secondary">Reset</Button>
        </Row>
      </Section>

      <hr className="pg__divider" />

      {/* ── Input ── */}
      <Section title="Input">
        <div className="pg__input-grid">
          <Input
            id="pg-default"
            label="Default input"
            placeholder="Type something…"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            helperText="This is helper text"
          />
          <Input
            id="pg-error"
            label="Error state"
            variant="error"
            defaultValue="bad@value"
            errorText="This field is required"
          />
          <Input
            id="pg-disabled"
            label="Disabled"
            disabled
            defaultValue="Locked value"
          />
          <Input
            id="pg-required"
            label="Required field"
            required
            placeholder="Cannot be empty"
          />
          <Input
            id="pg-password"
            label="Password"
            type="password"
            placeholder="Enter password"
          />
        </div>
        <div className="pg__row" style={{ marginTop: 'var(--space-4)' }}>
          <span className="pg__row-label">Sizes</span>
          {INPUT_SIZES.map((s) => (
            <div key={s} style={{ flex: '0 0 200px' }}>
              <Input id={`pg-size-${s}`} label={`Size ${s}`} size={s} placeholder={s} />
            </div>
          ))}
        </div>
      </Section>

      <hr className="pg__divider" />

      {/* ── Card ── */}
      <Section title="Card">
        <div className="pg__card-grid">
          {CARD_VARIANTS.map((v) => (
            <Card
              key={v}
              variant={v}
              header={<strong style={{ color: 'var(--color-text-heading)', fontSize: 'var(--typography-label-size)' }}>Variant: {v}</strong>}
              footer={<span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>Footer area</span>}
            >
              <p style={{ margin: 0 }}>
                This card uses the <code style={{ fontFamily: 'var(--typography-font-mono)', fontSize: 'var(--font-size-xs)' }}>{v}</code> variant.
                All colors come from semantic tokens.
              </p>
            </Card>
          ))}
          <Card
            as="article"
            variant="raised"
            header={<strong style={{ color: 'var(--color-text-heading)', fontSize: 'var(--typography-label-size)' }}>Semantic &lt;article&gt;</strong>}
          >
            <p style={{ margin: 0 }}>This card renders as an <code style={{ fontFamily: 'var(--typography-font-mono)', fontSize: 'var(--font-size-xs)' }}>&lt;article&gt;</code> element.</p>
          </Card>
        </div>
      </Section>

      <hr className="pg__divider" />

      {/* ── Avatar ── */}
      <Section title="Avatar">
        <Row label="Initials">
          {AVATAR_SIZES.map((s) => (
            <Avatar key={s} name="Jane Doe" size={s} />
          ))}
        </Row>
        <Row label="Image">
          {AVATAR_SIZES.map((s) => (
            <Avatar
              key={s}
              name="React Logo"
              size={s}
              src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
            />
          ))}
        </Row>
        <Row label="Single name">
          {AVATAR_SIZES.map((s) => (
            <Avatar key={s} name="Alice" size={s} />
          ))}
        </Row>
      </Section>

      <hr className="pg__divider" />

      {/* ── Badge ── */}
      <Section title="Badge">
        <Row label="Variants (md)">
          {BADGE_VARIANTS.map((v) => (
            <Badge key={v} variant={v}>{v}</Badge>
          ))}
        </Row>
        <Row label="Sizes">
          {BADGE_SIZES.map((s) => (
            <Badge key={s} size={s} variant="primary">Size {s}</Badge>
          ))}
        </Row>
        <Row label="In context">
          <Avatar name="Jane Doe" size="md" />
          <span style={{ fontSize: 'var(--typography-body-size)', fontWeight: 'var(--font-weight-medium)' }}>Jane Doe</span>
          <Badge variant="success">Online</Badge>
          <Badge variant="primary" size="sm">Admin</Badge>
        </Row>
      </Section>

      <hr className="pg__divider" />

      {/* ── Layout Primitives ── */}
      <Section title="Layout Primitives">

        {/* Stack */}
        <Row label="Stack (gap 2/4/8)">
          {(['2', '4', '8'] as const).map((gap) => (
            <div key={gap} style={{ flex: '1', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)', minWidth: 120 }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', display: 'block', marginBottom: 'var(--space-2)' }}>gap="{gap}"</span>
              <Stack gap={gap}>
                {[1, 2, 3].map((n) => (
                  <div key={n} style={{ background: 'var(--color-primary-subtle)', borderRadius: 'var(--radius-xs)', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-default)' }}>
                    Item {n}
                  </div>
                ))}
              </Stack>
            </div>
          ))}
        </Row>

        {/* Cluster */}
        <Row label="Cluster (tags)">
          <Cluster gap="2">
            {['Design', 'System', 'Tokens', 'Layout', 'React', 'TypeScript', 'CSS'].map((tag) => (
              <Badge key={tag} variant="neutral">{tag}</Badge>
            ))}
          </Cluster>
        </Row>
        <Row label="Cluster (justify space-between)">
          <div style={{ width: '100%', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)' }}>
            <Cluster justify="space-between" align="center">
              <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-heading)' }}>Card Title</span>
              <Cluster gap="2">
                <Button variant="ghost" size="sm">Edit</Button>
                <Button variant="danger" size="sm">Delete</Button>
              </Cluster>
            </Cluster>
          </div>
        </Row>

        {/* Split */}
        <Row label="Split fractions">
          <Stack gap="3" style={{ width: '100%' }}>
            {(['1/3', '1/2', '2/3'] as const).map((fraction) => (
              <div key={fraction}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', display: 'block', marginBottom: 'var(--space-1)' }}>fraction="{fraction}"</span>
                <Split fraction={fraction} gap="3">
                  <div style={{ background: 'var(--color-primary-subtle)', borderRadius: 'var(--radius-xs)', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-default)', textAlign: 'center' }}>
                    Primary
                  </div>
                  <div style={{ background: 'var(--color-surface-overlay)', borderRadius: 'var(--radius-xs)', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-default)', textAlign: 'center' }}>
                    Secondary
                  </div>
                </Split>
              </div>
            ))}
          </Stack>
        </Row>

        {/* Grid */}
        <Row label="Grid (2 / 3 / 4 columns)">
          <Stack gap="3" style={{ width: '100%' }}>
            {([2, 3, 4] as const).map((cols) => (
              <div key={cols}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', display: 'block', marginBottom: 'var(--space-1)' }}>columns={cols}</span>
                <Grid columns={cols} gap="2">
                  {Array.from({ length: cols }).map((_, i) => (
                    <div key={i} style={{ background: 'var(--color-surface-overlay)', borderRadius: 'var(--radius-xs)', padding: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-default)', textAlign: 'center' }}>
                      Cell {i + 1}
                    </div>
                  ))}
                </Grid>
              </div>
            ))}
          </Stack>
        </Row>

        {/* Page shell composition */}
        <Row label="Page shell (lg max-width, Section + Stack)">
          <div style={{ width: '100%', border: '1px dashed var(--color-border-default)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-subtle)' }}>
            <Page maxWidth="lg" as="div" style={{ background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-sm)' }}>
              <LayoutSection spacing="sm" as="div">
                <Stack gap="2">
                  <h3 style={{ margin: 0, fontSize: 'var(--typography-subheading-size)', fontWeight: 'var(--typography-subheading-weight)', color: 'var(--color-text-heading)' }}>
                    Page › Section › Stack
                  </h3>
                  <p style={{ margin: 0, fontSize: 'var(--typography-body-sm-size)', color: 'var(--color-text-subtle)' }}>
                    Composable layout primitives. Padding and gaps consume spacing tokens; max-width comes from the layout tier token.
                  </p>
                  <Cluster gap="2">
                    <Badge variant="primary">Page</Badge>
                    <Badge variant="info">Section</Badge>
                    <Badge variant="success">Stack</Badge>
                    <Badge variant="warning">Cluster</Badge>
                  </Cluster>
                </Stack>
              </LayoutSection>
            </Page>
          </div>
        </Row>

      </Section>

      <hr className="pg__divider" />

      {/* ── PasswordField ── */}
      <Section title="PasswordField">
        <div className="pg__input-grid">
          <PasswordField
            id="pg-pwd-default"
            label="Password"
            placeholder="Enter password…"
            helperText="Min 8 characters"
          />
          <PasswordField
            id="pg-pwd-error"
            label="Password (error)"
            variant="error"
            defaultValue="short"
            errorText="Password must be at least 8 characters"
          />
          <PasswordField
            id="pg-pwd-disabled"
            label="Password (disabled)"
            disabled
            defaultValue="locked-value"
          />
          <PasswordField
            id="pg-pwd-required"
            label="Password (required)"
            required
            placeholder="Cannot be empty"
          />
        </div>
        <div className="pg__row" style={{ marginTop: 'var(--space-4)' }}>
          <span className="pg__row-label">Sizes</span>
          {(['sm', 'md', 'lg'] as const).map((s) => (
            <div key={s} style={{ flex: '0 0 200px' }}>
              <PasswordField id={`pg-pwd-size-${s}`} label={`Size ${s}`} size={s} placeholder={s} />
            </div>
          ))}
        </div>
      </Section>

      <hr className="pg__divider" />

      {/* ── DateField ── */}
      <Section title="DateField">
        <div className="pg__input-grid">
          <DateField
            id="pg-date-default"
            label="Date"
            helperText="Select a date"
          />
          <DateField
            id="pg-date-range"
            label="Date with range"
            min="2020-01-01"
            max="2030-12-31"
            helperText="Between 2020 and 2030"
          />
          <DateField
            id="pg-date-error"
            label="Date (error)"
            variant="error"
            errorText="Date is required"
          />
          <DateField
            id="pg-date-disabled"
            label="Date (disabled)"
            disabled
            defaultValue="2024-01-01"
          />
        </div>
        <div className="pg__row" style={{ marginTop: 'var(--space-4)' }}>
          <span className="pg__row-label">Sizes</span>
          {(['sm', 'md', 'lg'] as const).map((s) => (
            <div key={s} style={{ flex: '0 0 200px' }}>
              <DateField id={`pg-date-size-${s}`} label={`Size ${s}`} size={s} />
            </div>
          ))}
        </div>
      </Section>

      <hr className="pg__divider" />

      {/* ── DateTimeField ── */}
      <Section title="DateTimeField">
        <div className="pg__input-grid">
          <DateTimeField
            id="pg-datetime-default"
            label="Event Start"
            helperText="Select date and time"
          />
          <DateTimeField
            id="pg-datetime-range"
            label="Event Start (range)"
            min="2024-01-01T00:00"
            max="2030-12-31T23:59"
            helperText="Between 2024 and 2030"
          />
          <DateTimeField
            id="pg-datetime-step"
            label="Schedule Post"
            step={60}
            helperText="Minute precision (step=60)"
          />
          <DateTimeField
            id="pg-datetime-error"
            label="Event Start (error)"
            variant="error"
            errorText="Start time is required"
          />
          <DateTimeField
            id="pg-datetime-disabled"
            label="Event Start (disabled)"
            disabled
            defaultValue="2024-06-15T10:00"
          />
        </div>
        <div className="pg__row" style={{ marginTop: 'var(--space-4)' }}>
          <span className="pg__row-label">Sizes</span>
          {(['sm', 'md', 'lg'] as const).map((s) => (
            <div key={s} style={{ flex: '0 0 220px' }}>
              <DateTimeField id={`pg-datetime-size-${s}`} label={`Size ${s}`} size={s} />
            </div>
          ))}
        </div>
      </Section>

      <hr className="pg__divider" />

      {/* ── Dropdown ── */}
      <Section title="Dropdown">
        <div className="pg__input-grid">
          <Dropdown
            id="pg-dropdown-default"
            label="Favourite fruit"
            options={[
              { value: 'apple', label: 'Apple' },
              { value: 'banana', label: 'Banana' },
              { value: 'cherry', label: 'Cherry' },
            ]}
            placeholder="Choose a fruit…"
            helperText="Select your favourite"
          />
          <Dropdown
            id="pg-dropdown-error"
            label="Fruit (error)"
            options={[
              { value: 'apple', label: 'Apple' },
              { value: 'banana', label: 'Banana' },
            ]}
            variant="error"
            errorText="Selection is required"
          />
          <Dropdown
            id="pg-dropdown-disabled"
            label="Fruit (disabled)"
            options={[
              { value: 'apple', label: 'Apple' },
              { value: 'banana', label: 'Banana' },
            ]}
            disabled
            defaultValue="apple"
          />
          <Dropdown
            id="pg-dropdown-required"
            label="Fruit (required)"
            options={[
              { value: 'apple', label: 'Apple' },
              { value: 'banana', label: 'Banana', disabled: true },
            ]}
            placeholder="Must choose…"
            required
          />
        </div>
        <div className="pg__row" style={{ marginTop: 'var(--space-4)' }}>
          <span className="pg__row-label">Sizes</span>
          {DROPDOWN_SIZES.map((s) => (
            <div key={s} style={{ flex: '0 0 200px' }}>
              <Dropdown
                id={`pg-dropdown-size-${s}`}
                label={`Size ${s}`}
                size={s}
                options={[
                  { value: 'a', label: 'Option A' },
                  { value: 'b', label: 'Option B' },
                ]}
                placeholder={s}
              />
            </div>
          ))}
        </div>
        <div className="pg__row" style={{ marginTop: 'var(--space-4)' }}>
          <span className="pg__row-label">Variants</span>
          {DROPDOWN_VARIANTS.map((v) => (
            <div key={v} style={{ flex: '0 0 200px' }}>
              <Dropdown
                id={`pg-dropdown-variant-${v}`}
                label={`Variant: ${v}`}
                variant={v}
                options={[
                  { value: 'a', label: 'Option A' },
                  { value: 'b', label: 'Option B' },
                ]}
                placeholder={v}
              />
            </div>
          ))}
        </div>
      </Section>

      <hr className="pg__divider" />
      <Section title="Accordion">
        <Row label="Single (default)">
          <div className="pg__accordion-demo">
            <Accordion
              items={ACCORDION_SINGLE}
              aria-label="FAQ — single open"
            />
          </div>
        </Row>
        <Row label="Multi-open">
          <div className="pg__accordion-demo">
            <Accordion
              items={ACCORDION_MULTI}
              allowMultiple
              defaultExpanded={['a', 'b']}
              aria-label="Features — multi open"
            />
          </div>
        </Row>
        <Row label="Focused">
          <div className="pg__accordion-demo">
            <Accordion
              items={ACCORDION_MULTI}
              focused
              aria-label="Features — focused style"
            />
          </div>
        </Row>
      </Section>

     <hr className="pg__divider" />
     <Section title="TopNav">
       <Row label="default (brand + links + theme toggle)">
         <div style={{ width: '100%', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
           <TopNav>
             <TopNav.Brand><span>🌐 Socially</span></TopNav.Brand>
             <TopNav.NavLink href="#" active>Home</TopNav.NavLink>
             <TopNav.NavLink href="#">Explore</TopNav.NavLink>
             <TopNav.NavLink href="#">Messages</TopNav.NavLink>
             <TopNav.Actions>
               <ThemeToggle />
             </TopNav.Actions>
           </TopNav>
         </div>
       </Row>
       <Row label="no active link">
         <div style={{ width: '100%', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
           <TopNav>
             <TopNav.Brand><span>🌐 Socially</span></TopNav.Brand>
             <TopNav.NavLink href="#">Home</TopNav.NavLink>
             <TopNav.NavLink href="#">Explore</TopNav.NavLink>
             <TopNav.Actions>
               <ThemeToggle />
             </TopNav.Actions>
           </TopNav>
         </div>
       </Row>
     </Section>
   </div>
  );
}
