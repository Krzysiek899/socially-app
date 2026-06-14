import { http, HttpResponse } from 'msw';
import { notificationsResponseSchema } from '../../pages/notification-center/dto/notificationSchemas.ts';

const initialNotifications = [
  {
    id: 'notif-1',
    type: 'USER_JOINED',
    title: 'Julia dołączyła do Twojego wydarzenia!',
    message: 'Julia Krawiec zapisała się na "Design Critique: Onboarding".',
    timeAgo: '2 min temu',
    isRead: false,
    group: 'TODAY',
    referenceId: 'friend-julia',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'notif-2',
    type: 'NEW_EVENT',
    title: 'Pojawiło się nowe interesujące wydarzenie!',
    message: 'W Twojej okolicy organizowane jest: "Jazz Night nad Wisłą".',
    timeAgo: '1 godz temu',
    isRead: false,
    group: 'TODAY',
    referenceId: 'event-krakow-jazz-night',
    eventMeta: {
      time: '20:00 Dzisiaj',
      price: 'Darmowe',
    },
  },
  {
    id: 'notif-3',
    type: 'FRIEND_JOINED',
    title: 'Twój znajomy dołączył do wydarzenia!',
    message: 'Kasia Mazur dołączyła do "Coffee Walk — Centrum Krakowa".',
    timeAgo: '3 godz temu',
    isRead: true,
    group: 'TODAY',
    referenceId: 'org-kasia',
    avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'notif-4',
    type: 'SYSTEM_APPROVAL',
    title: 'Twoje wydarzenie zostało zaakceptowane!',
    message: 'Moderator zatwierdził wydarzenie "Design Critique: Onboarding". Jest już widoczne dla wszystkich.',
    timeAgo: 'Wczoraj',
    isRead: true,
    group: 'YESTERDAY',
    referenceId: 'event-user-1-design-critique',
  },
];

export const notificationHandlers = [
  http.get('/api/notifications', () => {
    const data = notificationsResponseSchema.parse(initialNotifications);
    return HttpResponse.json(data, { status: 200 });
  }),

  http.patch('/api/notifications/:id/read', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({ success: true, id }, { status: 200 });
  }),
];
