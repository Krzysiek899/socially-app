import React from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export const BUTTON_VARIANTS: ReadonlyArray<ButtonVariant> = ['primary', 'secondary', 'ghost', 'danger'];
export const BUTTON_SIZES: ReadonlyArray<ButtonSize> = ['sm', 'md', 'lg'];

export interface ButtonProps {
  variant?:     ButtonVariant;
  size?:        ButtonSize;
  disabled?:    boolean;
  type?:        'button' | 'submit' | 'reset';
  onClick?:     React.MouseEventHandler<HTMLButtonElement>;
  children:     React.ReactNode;
  'aria-label'?: string;
}

/**
 * Button primitive.
 *
 * Accepts only constrained `variant` and `size` values.
 * Does not accept a `className` prop to prevent ad-hoc styling drift.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  onClick,
  children,
  'aria-label': ariaLabel,
}: ButtonProps): React.JSX.Element {
  if (!BUTTON_VARIANTS.includes(variant)) {
    throw new Error(`Button: unknown variant "${variant}". Must be one of: ${BUTTON_VARIANTS.join(', ')}.`);
  }
  if (!BUTTON_SIZES.includes(size)) {
    throw new Error(`Button: unknown size "${size}". Must be one of: ${BUTTON_SIZES.join(', ')}.`);
  }

  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size}`}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
