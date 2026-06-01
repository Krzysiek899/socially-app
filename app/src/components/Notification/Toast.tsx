import React, { useEffect, useState } from 'react';
import './Notification.css';
import type { ToastItem } from './NotificationContext.tsx';

export interface ToastProps extends ToastItem {
  onDismiss: (id: string) => void;
}

const ICONS: Record<string, string> = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

export function Toast({ id, message, variant, duration, onDismiss }: ToastProps): React.JSX.Element {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const handleAnimationEnd = () => {
    if (exiting) onDismiss(id);
  };

  return (
    <div
      className={`toast toast--${variant}${exiting ? ' toast--exiting' : ''}`}
      role="alert"
      aria-live="polite"
      onAnimationEnd={handleAnimationEnd}
    >
      <span className="toast__icon" aria-hidden="true">{ICONS[variant]}</span>
      <span className="toast__message">{message}</span>
      <button
        type="button"
        className="toast__close"
        onClick={() => setExiting(true)}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}
