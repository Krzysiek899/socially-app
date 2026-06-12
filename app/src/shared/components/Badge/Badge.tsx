import React from 'react';
import './Badge.css';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export const BADGE_VARIANTS: ReadonlyArray<BadgeVariant> = ['primary', 'success', 'warning', 'danger', 'info', 'neutral'];
export const BADGE_SIZES: ReadonlyArray<BadgeSize> = ['sm', 'md'];

export interface BadgeProps {
  variant?:  BadgeVariant;
  size?:     BadgeSize;
  children:  React.ReactNode;
}

/**
 * Badge primitive.
 *
 * Purely presentational label with constrained variant/size API.
 * Does not accept `className` to prevent ad-hoc styling drift.
 */
export function Badge({ variant = 'neutral', size = 'md', children }: BadgeProps): React.JSX.Element {
  if (!BADGE_VARIANTS.includes(variant)) {
    throw new Error(`Badge: unknown variant "${variant}". Must be one of: ${BADGE_VARIANTS.join(', ')}.`);
  }
  if (!BADGE_SIZES.includes(size)) {
    throw new Error(`Badge: unknown size "${size}". Must be one of: ${BADGE_SIZES.join(', ')}.`);
  }

  return (
    <span className={`badge badge--${variant} badge--${size}`}>
      {children}
    </span>
  );
}
