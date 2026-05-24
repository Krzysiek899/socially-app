import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'socially-theme';

export type ThemePreference = 'light' | 'dark' | 'system';
export type Theme = 'light' | 'dark';

/** Valid theme preference values. */
export const THEME_PREFERENCES = {
  LIGHT:  'light',
  DARK:   'dark',
  SYSTEM: 'system',
} as const satisfies Record<string, ThemePreference>;

/**
 * Resolve the concrete theme from a stored preference.
 * Pure function — safe to call outside React.
 */
export function resolveTheme(preference: ThemePreference): Theme {
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
 */
export function getStoredPreference(): ThemePreference {
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

export interface UseThemeReturn {
  theme:      Theme;
  preference: ThemePreference;
  setTheme:   (pref: ThemePreference) => void;
}

/**
 * React hook for theme preference management.
 */
export function useTheme(): UseThemeReturn {
  const [preference, setPreferenceState] = useState<ThemePreference>(getStoredPreference);

  const theme = resolveTheme(preference);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

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

  const setTheme = useCallback((newPreference: ThemePreference) => {
    try {
      localStorage.setItem(STORAGE_KEY, newPreference);
    } catch {
      // localStorage may be unavailable
    }
    setPreferenceState(newPreference);
  }, []);

  return { theme, preference, setTheme };
}
