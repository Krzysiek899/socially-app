import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';
import { Button } from '../Button/Button.tsx';
import './ThemeToggle.css';

export function ThemeToggle(): React.JSX.Element {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {isDark
          ? <Sun data-testid="sun-icon" />
          : <Moon data-testid="moon-icon" />}
      </span>
    </Button>
  );
}
