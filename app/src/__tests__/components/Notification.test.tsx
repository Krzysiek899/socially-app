import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  NotificationProvider,
  useNotifications,
  TOAST_VARIANTS,
} from '../../components/Notification/NotificationContext.tsx';
import type { ToastOptions } from '../../components/Notification/NotificationContext.tsx';

/* ── Shared helper ── */
function renderWithNotify(options: ToastOptions) {
  function App() {
    const { notify } = useNotifications();
    return <button onClick={() => notify(options)}>trigger</button>;
  }
  const utils = render(
    <NotificationProvider>
      <App />
    </NotificationProvider>
  );
  const trigger = () => fireEvent.click(screen.getByRole('button', { name: 'trigger' }));
  return { ...utils, trigger };
}

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

describe('TOAST_VARIANTS constant', () => {
  it('exposes all four variants', () => {
    expect(TOAST_VARIANTS).toEqual(['success', 'error', 'warning', 'info']);
  });
});

describe('notify() — rendering', () => {
  it('renders a toast with the correct message', () => {
    const { trigger } = renderWithNotify({ message: 'Hello world' });
    trigger();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('applies the correct CSS class for each variant', () => {
    TOAST_VARIANTS.forEach(variant => {
      const { trigger, unmount } = renderWithNotify({ message: 'Test', variant });
      trigger();
      expect(document.querySelector(`.toast--${variant}`)).toBeInTheDocument();
      unmount();
    });
  });

  it('defaults to variant "info" when omitted', () => {
    const { trigger } = renderWithNotify({ message: 'Info toast' });
    trigger();
    expect(document.querySelector('.toast--info')).toBeInTheDocument();
  });

  it('renders multiple toasts simultaneously', () => {
    function MultiApp() {
      const { notify } = useNotifications();
      return (
        <>
          <button onClick={() => notify({ message: 'First' })}>first</button>
          <button onClick={() => notify({ message: 'Second' })}>second</button>
        </>
      );
    }
    render(
      <NotificationProvider>
        <MultiApp />
      </NotificationProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'first' }));
    fireEvent.click(screen.getByRole('button', { name: 'second' }));
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('close button puts toast into exiting state and removes it after animationend', () => {
    const { trigger } = renderWithNotify({ message: 'Close me' });
    trigger();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(document.querySelector('.toast--exiting')).toBeInTheDocument();
    fireEvent(document.querySelector('.toast--exiting')!, new Event('animationend', { bubbles: true }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('auto-dismiss', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('toast is still present just before the duration elapses', () => {
    const { trigger } = renderWithNotify({ message: 'Hi', duration: 4000 });
    trigger();
    act(() => { jest.advanceTimersByTime(3999); });
    expect(screen.getByRole('alert')).not.toHaveClass('toast--exiting');
  });

  it('toast enters exiting state at exactly the duration', () => {
    const { trigger } = renderWithNotify({ message: 'Hi', duration: 4000 });
    trigger();
    act(() => { jest.advanceTimersByTime(4000); });
    expect(screen.getByRole('alert')).toHaveClass('toast--exiting');
  });

  it('toast is removed from DOM after exit animation completes', () => {
    const { trigger } = renderWithNotify({ message: 'Hi', duration: 4000 });
    trigger();
    act(() => { jest.advanceTimersByTime(4000); });
    const toast = screen.getByRole('alert');
    fireEvent(toast, new Event('animationend', { bubbles: true }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('defaults to 4000 ms when duration is omitted', () => {
    const { trigger } = renderWithNotify({ message: 'Hi' });
    trigger();
    act(() => { jest.advanceTimersByTime(3999); });
    expect(screen.getByRole('alert')).not.toHaveClass('toast--exiting');
    act(() => { jest.advanceTimersByTime(1); });
    expect(screen.getByRole('alert')).toHaveClass('toast--exiting');
  });
});

describe('exit animation', () => {
  it('toast has toast--exiting class while exit animation plays', () => {
    const { trigger } = renderWithNotify({ message: 'Bye' });
    trigger();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(document.querySelector('.toast--exiting')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('toast remains in DOM during exit animation and is removed after animationend', () => {
    const { trigger } = renderWithNotify({ message: 'Bye' });
    trigger();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent(screen.getByRole('alert'), new Event('animationend', { bubbles: true }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
