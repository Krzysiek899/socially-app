/**
 * Badge — Primitive component
 *
 * @typedef {'primary'|'success'|'warning'|'danger'|'info'|'neutral'} BadgeVariant
 * @typedef {'sm'|'md'} BadgeSize
 */
import './Badge.css';

/** @type {ReadonlyArray<BadgeVariant>} */
export const BADGE_VARIANTS = /** @type {const} */ (['primary', 'success', 'warning', 'danger', 'info', 'neutral']);

/** @type {ReadonlyArray<BadgeSize>} */
export const BADGE_SIZES = /** @type {const} */ (['sm', 'md']);

/**
 * Badge primitive.
 *
 * Purely presentational label with constrained variant/size API.
 * Does not accept `className` to prevent ad-hoc styling drift.
 *
 * @param {{
 *   variant?:  BadgeVariant,
 *   size?:     BadgeSize,
 *   children:  React.ReactNode,
 * }} props
 */
export function Badge({ variant = 'neutral', size = 'md', children }) {
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
