import { z } from 'zod';

export const notificationSchema = z.object({
  id: z.string(),
  type: z.enum(['USER_JOINED', 'NEW_EVENT', 'FRIEND_JOINED', 'SYSTEM_APPROVAL']),
  title: z.string(),
  message: z.string(),
  timeAgo: z.string(),
  isRead: z.boolean(),
  group: z.enum(['TODAY', 'YESTERDAY', 'OLDER']),
  referenceId: z.string(), // 👈 ADD THIS LINE
  avatarUrl: z.string().optional(),
  eventMeta: z.object({
    time: z.string(),
    price: z.string()
  }).optional()
});

export const notificationsResponseSchema = z.array(notificationSchema);
export type NotificationDto = z.infer<typeof notificationSchema>;