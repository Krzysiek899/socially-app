/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useState } from 'react';
import { ToastContainer } from './ToastContainer.tsx';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export const TOAST_VARIANTS: ReadonlyArray<ToastVariant> = ['success', 'error', 'warning', 'info'];

export interface ToastOptions {
  message:   string;
  variant?:  ToastVariant;
  duration?: number;
}

export interface ToastItem {
  id:       string;
  message:  string;
  variant:  ToastVariant;
  duration: number;
}

interface NotificationContextValue {
  toasts:  ToastItem[];
  notify:  (options: ToastOptions) => void;
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const notify = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, {
      id,
      message: options.message,
      variant: options.variant ?? 'info',
      duration: options.duration ?? 4000,
    }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ toasts, notify, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return { notify: ctx.notify };
}
