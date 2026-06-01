import React from 'react';
import ReactDOM from 'react-dom';
import { Toast } from './Toast.tsx';
import type { ToastItem } from './NotificationContext.tsx';

export interface ToastContainerProps {
  toasts:    ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps): React.JSX.Element | null {
  if (toasts.length === 0) return null;
  return ReactDOM.createPortal(
    <div className="toast-container" aria-label="Notifications">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  );
}
