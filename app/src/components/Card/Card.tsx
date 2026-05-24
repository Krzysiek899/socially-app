import React from 'react';
import './Card.css';

export type CardVariant = 'default' | 'raised' | 'subtle';

export const CARD_VARIANTS: ReadonlyArray<CardVariant> = ['default', 'raised', 'subtle'];

export interface CardProps {
  variant?:            CardVariant;
  header?:             React.ReactNode;
  footer?:             React.ReactNode;
  children:            React.ReactNode;
  as?:                 keyof React.JSX.IntrinsicElements;
  'aria-label'?:       string;
  'aria-labelledby'?:  string;
}

/**
 * Card primitive.
 *
 * Composes an optional header, body, and footer.
 * Does not accept `className` to prevent ad-hoc styling drift.
 */
export function Card({
  variant = 'default',
  header,
  footer,
  children,
  as: Tag = 'div',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: CardProps): React.JSX.Element {
  if (!CARD_VARIANTS.includes(variant)) {
    throw new Error(`Card: unknown variant "${variant}". Must be one of: ${CARD_VARIANTS.join(', ')}.`);
  }

  return (
    <Tag
      className={`card card--${variant}`}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {header && <div className="card__header">{header}</div>}
      <div className="card__body">{children}</div>
      {footer && <div className="card__footer">{footer}</div>}
    </Tag>
  );
}
