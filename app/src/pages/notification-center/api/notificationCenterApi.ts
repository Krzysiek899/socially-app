import { notificationsResponseSchema } from '../dto/notificationSchemas.ts';
import type { AppNotification } from '../domain/notificationModels.ts';

export const fetchNotificationsRequest = async (
  token: string,
  signal?: AbortSignal
): Promise<AppNotification[]> => {
  const response = await fetch('/api/notifications', {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });

  if (!response.ok) {
    throw new Error('notifications.errors.fetch_failed');
  }

  const data = await response.json();
  return notificationsResponseSchema.parse(data);
};

export const markAsReadRequest = async (
  id: string,
  token: string,
  signal?: AbortSignal
): Promise<void> => {
  const response = await fetch(`/api/notifications/${id}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });

  if (!response.ok) {
    throw new Error('notifications.errors.update_failed');
  }
};