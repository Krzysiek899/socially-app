import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  NotificationProvider,
  useNotifications,
  TOAST_VARIANTS,
} from '../../components/Notification/NotificationContext.tsx';
import type { ToastOptions } from '../../components/Notification/NotificationContext.tsx';

void act;
void TOAST_VARIANTS;

/* ── Shared helper (used by multiple describe blocks) ── */
function renderWithNotify(options: ToastOptions) {
  function App() {
    const { notify } = useNotifications();
    return (
      <button onClick={() => notify(options)}>trigger</button>
    );
  }
  const utils = render(
    <NotificationProvider>
      <App />
    </NotificationProvider>
  );
  const trigger = () => fireEvent.click(screen.getByRole('button', { name: 'trigger' }));
  return { ...utils, trigger };
}

void renderWithNotify;

/* ── Tests ── */

describe('useNotifications — outside provider', () => {
  it('throws a descriptive error when called outside NotificationProvider', () => {
    function BadComponent() {
      useNotifications();
      return null;
    }
    expect(() => render(<BadComponent />)).toThrow(
      /useNotifications must be used within a NotificationProvider/i
    );
  });
});
