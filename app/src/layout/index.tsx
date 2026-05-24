import React from 'react';
import './layout.css';
import type { LayoutMaxWidth } from './layout-tokens.ts';
import { LAYOUT_MAX_WIDTH_TOKENS, SPACING_TOKEN_MAP, SECTION_SPACING_MAP, SPLIT_FRACTION_MAP } from './layout-tokens.ts';
import type { SectionSpacing, SpacingStep, SplitFraction } from './layout-tokens.ts';

type Tag = keyof React.JSX.IntrinsicElements;

function resolveGap(step: SpacingStep | string): string {
  const token = SPACING_TOKEN_MAP[step];
  if (!token) return `var(--space-4)`;
  if (step === '0') return '0px';
  return `var(${token})`;
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export interface PageProps {
  /** Max-width tier for the page shell. Defaults to 'lg' (1024px). */
  maxWidth?: LayoutMaxWidth;
  as?:       Tag;
  style?:    React.CSSProperties;
  children:  React.ReactNode;
}

/**
 * Page — centered shell with fluid inline padding and a max-width tier.
 * Supports `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px),
 * and `full` (no max-width cap).
 */
export function Page({
  maxWidth = 'lg',
  as: Component = 'div',
  style,
  children,
  ...props
}: PageProps): React.JSX.Element {
  const maxWidthValue =
    maxWidth === 'full'
      ? 'none'
      : `var(${LAYOUT_MAX_WIDTH_TOKENS[maxWidth].token})`;

  return (
    <Component
      data-layout="page"
      data-max-width={maxWidth}
      style={{ '--layout-page-max-width': maxWidthValue, ...style } as React.CSSProperties}
      {...props}
    >
      {children}
    </Component>
  );
}

/* ── Section ────────────────────────────────────────────────────────────── */

export interface SectionProps {
  /** Vertical block padding scale. Defaults to 'md' (--space-8). */
  spacing?: SectionSpacing;
  as?:      Tag;
  style?:   React.CSSProperties;
  children: React.ReactNode;
}

/**
 * Section — vertical-rhythm section with configurable block padding.
 * Renders as `<section>` by default; override with `as`.
 */
export function Section({
  spacing = 'md',
  as: Component = 'section',
  style,
  children,
  ...props
}: SectionProps): React.JSX.Element {
  const step = SECTION_SPACING_MAP[spacing];
  return (
    <Component
      data-layout="section"
      data-spacing={spacing}
      style={{ '--layout-section-spacing': resolveGap(step), ...style } as React.CSSProperties}
      {...props}
    >
      {children}
    </Component>
  );
}

/* ── Stack ──────────────────────────────────────────────────────────────── */

export interface StackProps {
  /** Space between children using spacing-step tokens. Defaults to '4' (16px). */
  gap?:     SpacingStep | string;
  /** CSS align-items value. Defaults to 'stretch'. */
  align?:   React.CSSProperties['alignItems'];
  as?:      Tag;
  style?:   React.CSSProperties;
  children: React.ReactNode;
}

/**
 * Stack — vertical flex container with configurable gap and alignment.
 */
export function Stack({
  gap = '4',
  align,
  as: Component = 'div',
  style,
  children,
  ...props
}: StackProps): React.JSX.Element {
  return (
    <Component
      data-layout="stack"
      data-gap={gap}
      style={{
        '--layout-gap': resolveGap(gap),
        ...(align ? { '--layout-align': align } : {}),
        ...style,
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </Component>
  );
}

/* ── Cluster ────────────────────────────────────────────────────────────── */

export interface ClusterProps {
  /** Space between children using spacing-step tokens. Defaults to '2' (8px). */
  gap?:     SpacingStep | string;
  /** CSS align-items value. Defaults to 'center'. */
  align?:   React.CSSProperties['alignItems'];
  /** CSS justify-content value. Defaults to 'flex-start'. */
  justify?: React.CSSProperties['justifyContent'];
  as?:      Tag;
  style?:   React.CSSProperties;
  children: React.ReactNode;
}

/**
 * Cluster — horizontal flex container with wrapping for inline item groups.
 */
export function Cluster({
  gap = '2',
  align,
  justify,
  as: Component = 'div',
  style,
  children,
  ...props
}: ClusterProps): React.JSX.Element {
  return (
    <Component
      data-layout="cluster"
      data-gap={gap}
      style={{
        '--layout-gap': resolveGap(gap),
        ...(align   ? { '--layout-align':   align   } : {}),
        ...(justify ? { '--layout-justify': justify } : {}),
        ...style,
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </Component>
  );
}

/* ── Split ──────────────────────────────────────────────────────────────── */

export interface SplitProps {
  /** Column ratio applied to the first child. Defaults to '1/2' (equal halves). */
  fraction?: SplitFraction;
  /** Gap between columns using spacing-step tokens. Defaults to '4' (16px). */
  gap?:      SpacingStep | string;
  as?:       Tag;
  style?:    React.CSSProperties;
  children:  React.ReactNode;
}

/**
 * Split — two-column CSS grid with a configurable fraction ratio.
 * Stacks vertically below the sm breakpoint (640px).
 */
export function Split({
  fraction = '1/2',
  gap = '4',
  as: Component = 'div',
  style,
  children,
  ...props
}: SplitProps): React.JSX.Element {
  return (
    <Component
      data-layout="split"
      data-fraction={fraction}
      style={{
        '--layout-split-template': SPLIT_FRACTION_MAP[fraction],
        '--layout-gap': resolveGap(gap),
        ...style,
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </Component>
  );
}

/* ── Grid ───────────────────────────────────────────────────────────────── */

export interface GridProps {
  /** Number of columns. Defaults to 3. */
  columns?: number;
  /** Gap between cells using spacing-step tokens. Defaults to '4' (16px). */
  gap?:     SpacingStep | string;
  as?:      Tag;
  style?:   React.CSSProperties;
  children: React.ReactNode;
}

/**
 * Grid — multi-column CSS grid with responsive step-down behaviour.
 * 3- and 4-column grids collapse to 2 columns at sm–lg breakpoints,
 * and all grids collapse to 1 column below the sm breakpoint (640px).
 */
export function Grid({
  columns = 3,
  gap = '4',
  as: Component = 'div',
  style,
  children,
  ...props
}: GridProps): React.JSX.Element {
  return (
    <Component
      data-layout="grid"
      data-columns={columns}
      style={{
        '--layout-columns': columns,
        '--layout-gap': resolveGap(gap),
        ...style,
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </Component>
  );
}
