import { renderHook, act } from '@testing-library/react';
import { useTheme, resolveTheme, getStoredPreference } from '../hooks/useTheme.ts';

// ─── matchMedia mock ───────────────────────────────────────────────────────
let mockDarkMode = false;

function makeMQ(matches) {
  return {
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
}

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn(() => makeMQ(mockDarkMode)),
  });
});

beforeEach(() => {
  mockDarkMode = false;
  window.matchMedia.mockImplementation(() => makeMQ(mockDarkMode));
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

// ─── resolveTheme (pure) ───────────────────────────────────────────────────
describe('resolveTheme()', () => {
  it('returns "light" for explicit light preference', () => {
    expect(resolveTheme('light')).toBe('light');
  });

  it('returns "dark" for explicit dark preference', () => {
    expect(resolveTheme('dark')).toBe('dark');
  });

  it('returns "light" for system when OS is light', () => {
    mockDarkMode = false;
    window.matchMedia.mockImplementation(() => makeMQ(false));
    expect(resolveTheme('system')).toBe('light');
  });

  it('returns "dark" for system when OS is dark', () => {
    mockDarkMode = true;
    window.matchMedia.mockImplementation(() => makeMQ(true));
    expect(resolveTheme('system')).toBe('dark');
  });
});

// ─── getStoredPreference (pure) ───────────────────────────────────────────
describe('getStoredPreference()', () => {
  it('returns "system" when localStorage is empty', () => {
    expect(getStoredPreference()).toBe('system');
  });

  it('returns stored "light" preference', () => {
    localStorage.setItem('socially-theme', 'light');
    expect(getStoredPreference()).toBe('light');
  });

  it('returns stored "dark" preference', () => {
    localStorage.setItem('socially-theme', 'dark');
    expect(getStoredPreference()).toBe('dark');
  });

  it('returns "system" for an unrecognised stored value', () => {
    localStorage.setItem('socially-theme', 'invalid');
    expect(getStoredPreference()).toBe('system');
  });
});

// ─── useTheme hook ─────────────────────────────────────────────────────────
describe('useTheme()', () => {
  it('defaults to system preference when nothing is stored', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.preference).toBe('system');
  });

  it('resolves system preference to "light" when OS is light', () => {
    window.matchMedia.mockImplementation(() => makeMQ(false));
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('resolves system preference to "dark" when OS is dark', () => {
    window.matchMedia.mockImplementation(() => makeMQ(true));
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('reads a persisted "light" preference from localStorage on init', () => {
    localStorage.setItem('socially-theme', 'light');
    const { result } = renderHook(() => useTheme());
    expect(result.current.preference).toBe('light');
    expect(result.current.theme).toBe('light');
  });

  it('reads a persisted "dark" preference from localStorage on init', () => {
    localStorage.setItem('socially-theme', 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.preference).toBe('dark');
    expect(result.current.theme).toBe('dark');
  });

  it('persists a manual "dark" override to localStorage', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme('dark');
    });
    expect(localStorage.getItem('socially-theme')).toBe('dark');
    expect(result.current.preference).toBe('dark');
    expect(result.current.theme).toBe('dark');
  });

  it('persists a manual "light" override to localStorage', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme('light');
    });
    expect(localStorage.getItem('socially-theme')).toBe('light');
    expect(result.current.theme).toBe('light');
  });

  it('sets data-theme attribute on <html> when theme changes', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme('dark');
    });
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('updates data-theme attribute when switching from dark to light', () => {
    localStorage.setItem('socially-theme', 'dark');
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme('light');
    });
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('supports returning to system preference', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme('dark');
    });
    act(() => {
      result.current.setTheme('system');
    });
    expect(result.current.preference).toBe('system');
    expect(localStorage.getItem('socially-theme')).toBe('system');
  });

  it('exposes a stable setTheme reference across re-renders', () => {
    const { result, rerender } = renderHook(() => useTheme());
    const firstRef = result.current.setTheme;
    rerender();
    expect(result.current.setTheme).toBe(firstRef);
  });
});
