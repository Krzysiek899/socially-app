import { NotificationDto } from '../dto/notificationSchemas.ts';

export type AppNotification = NotificationDto;

export interface NotificationGroup {
  label: string;
  items: AppNotification[];
}