import React, { useState } from 'react';
import './Playground.css';
import {
  Button,  BUTTON_VARIANTS, BUTTON_SIZES,
  Input,   INPUT_SIZES,
  Card,    CARD_VARIANTS,
  Avatar,  AVATAR_SIZES,
  Badge,   BADGE_VARIANTS, BADGE_SIZES,
} from '../components/index.ts';
import type { ThemePreference } from '../hooks/useTheme.ts';
import { useTheme } from '../hooks/useTheme.ts';

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
export function Playground() {
  const { theme, preference, setTheme } = useTheme();
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="pg">
      {/* Header */}
      <header className="pg__header">
        <div>
          <h1 className="pg__title">Component Playground</h1>
          <p className="pg__subtitle">Socially Design System — Primitive Components v1</p>
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
    </div>
  );
}
