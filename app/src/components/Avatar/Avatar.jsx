/**
 * Avatar — Primitive component
 *
 * @typedef {'sm'|'md'|'lg'|'xl'} AvatarSize
 */
import './Avatar.css';

/** @type {ReadonlyArray<AvatarSize>} */
export const AVATAR_SIZES = /** @type {const} */ (['sm', 'md', 'lg', 'xl']);

/**
 * Derive up-to-2-char initials from a display name.
 *
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Avatar primitive.
 *
 * Displays a profile image; falls back to initials derived from `name`.
 * Does not accept `className` to prevent ad-hoc styling drift.
 *
 * @param {{
 *   name:   string,
 *   src?:   string,
 *   size?:  AvatarSize,
 * }} props
 */
export function Avatar({ name, src, size = 'md' }) {
  if (!AVATAR_SIZES.includes(size)) {
    throw new Error(`Avatar: unknown size "${size}". Must be one of: ${AVATAR_SIZES.join(', ')}.`);
  }

  return (
    <span
      className={`avatar avatar--${size}`}
      role="img"
      aria-label={name}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="avatar__img"
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  );
}
