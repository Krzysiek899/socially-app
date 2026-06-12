import React from 'react';
import './Avatar.css';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export const AVATAR_SIZES: ReadonlyArray<AvatarSize> = ['sm', 'md', 'lg', 'xl'];

export interface AvatarProps {
  name:  string;
  src?:  string;
  size?: AvatarSize;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Avatar primitive.
 *
 * Displays a profile image; falls back to initials derived from `name`.
 * Does not accept `className` to prevent ad-hoc styling drift.
 */
export function Avatar({ name, src, size = 'md' }: AvatarProps): React.JSX.Element {
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
