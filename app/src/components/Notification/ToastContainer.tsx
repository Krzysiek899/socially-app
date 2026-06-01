import React from 'react';
import type { ToastItem } from './NotificationContext.tsx';

export interface ToastContainerProps {
  toasts:    ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer(props: ToastContainerProps): React.JSX.Element | null {
  void props;
  return null;
}
