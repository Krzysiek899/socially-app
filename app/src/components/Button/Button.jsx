/**
 * Button — Primitive component
 *
 * @typedef {'primary'|'secondary'|'ghost'|'danger'} ButtonVariant
 * @typedef {'sm'|'md'|'lg'} ButtonSize
 */
import './Button.css';

/** @type {ReadonlyArray<ButtonVariant>} */
export const BUTTON_VARIANTS = /** @type {const} */ (['primary', 'secondary', 'ghost', 'danger']);

/** @type {ReadonlyArray<ButtonSize>} */
export const BUTTON_SIZES = /** @type {const} */ (['sm', 'md', 'lg']);

/**
 * Button primitive.
 *
 * Accepts only constrained `variant` and `size` values.
 * Does not accept a `className` prop to prevent ad-hoc styling drift.
 *
 * @param {{
 *   variant?:   ButtonVariant,
 *   size?:      ButtonSize,
 *   disabled?:  boolean,
 *   type?:      'button'|'submit'|'reset',
 *   onClick?:   React.MouseEventHandler<HTMLButtonElement>,
 *   children:   React.ReactNode,
 *   'aria-label'?: string,
 * }} props
 */
export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  onClick,
  children,
  'aria-label': ariaLabel,
}) {
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
