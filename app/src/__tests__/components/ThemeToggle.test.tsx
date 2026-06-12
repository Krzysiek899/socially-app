import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../../shared/components/ThemeToggle/ThemeToggle.tsx';
import * as useThemeModule from '../../hooks/useTheme.ts';

const mockSetTheme = jest.fn();

function mockTheme(theme: 'light' | 'dark') {
  jest.spyOn(useThemeModule, 'useTheme').mockReturnValue({
    theme,
    preference: theme,
    setTheme: mockSetTheme,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ThemeToggle — icon', () => {
  it('shows moon icon when theme is light', () => {
    mockTheme('light');
    render(<ThemeToggle />);
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
  });

  it('shows sun icon when theme is dark', () => {
    mockTheme('dark');
    render(<ThemeToggle />);
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
  });
});

describe('ThemeToggle — interaction', () => {
  it('calls setTheme("dark") when clicked in light mode', () => {
    mockTheme('light');
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: /toggle theme/i }));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme("light") when clicked in dark mode', () => {
    mockTheme('dark');
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: /toggle theme/i }));
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });
});

describe('ThemeToggle — accessibility', () => {
  it('has aria-label "Toggle theme"', () => {
    mockTheme('light');
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Toggle theme');
  });
});
