import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'socially-theme';

/** Valid theme preference values. */
export const THEME_PREFERENCES = /** @type {const} */ ({
  LIGHT:  'light',
  DARK:   'dark',
  SYSTEM: 'system',
});

/**
 * Resolve the concrete theme ('light' | 'dark') from a stored preference.
 * Pure function — safe to call outside React.
 *
 * @param {'light'|'dark'|'system'} preference
 * @returns {'light'|'dark'}
 */
export function resolveTheme(preference) {
  if (preference === 'system') {
    return typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return preference === 'dark' ? 'dark' : 'light';
}

/**
 * Read the stored preference from localStorage (SSR-safe).
 * Falls back to 'system' when nothing is stored.
 *
 * @returns {'light'|'dark'|'system'}
 */
export function getStoredPreference() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage may be unavailable (private browsing, etc.)
  }
  return 'system';
}

/**
 * React hook for theme preference management.
 *
 * - Reads initial preference from localStorage (falls back to 'system').
 * - Resolves 'system' to the actual OS preference via matchMedia.
 * - Writes `data-theme` attribute to `<html>` on every resolved-theme change.
 * - Listens for OS preference changes when preference is 'system'.
 * - Persists manual overrides to localStorage.
 *
 * @returns {{
 *   theme:      'light'|'dark',
 *   preference: 'light'|'dark'|'system',
 *   setTheme:   (pref: 'light'|'dark'|'system') => void,
 * }}
 */
export function useTheme() {
  const [preference, setPreferenceState] = useState(getStoredPreference);

  const theme = resolveTheme(preference);

  // Apply data-theme attribute to <html> and listen for OS preference changes.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

    // When following system preference, listen for OS changes.
    if (preference !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      document.documentElement.setAttribute(
        'data-theme',
        mq.matches ? 'dark' : 'light',
      );
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, preference]);

  const setTheme = useCallback((newPreference) => {
    try {
      localStorage.setItem(STORAGE_KEY, newPreference);
    } catch {
      // localStorage may be unavailable
    }
    setPreferenceState(newPreference);
  }, []);

  return { theme, preference, setTheme };
}
