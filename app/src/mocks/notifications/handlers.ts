import { http, HttpResponse } from 'msw';
import { notificationsResponseSchema } from "../../pages/notification-center/dto/notificationSchemas.ts"

const initialNotifications = [
  {
    id: 'notif-1',
    type: 'USER_JOINED',
    title: 'Adam dołączył do twojego wydarzenia!',
    message: 'Adam Kowalski właśnie zapisał się na "Poranny Jogging w Parku".',
    timeAgo: '2 min temu',
    isRead: false,
    group: 'TODAY',
    referenceId: 'user-adam-123', 
    avatarUrl: 'https://i.pravatar.cc/150?u=adam',
  },
  {
    id: 'notif-2',
    type: 'NEW_EVENT',
    title: 'Pojawiło się nowe interesujące wydarzenie!',
    message: 'W Twojej okolicy organizowane jest: "Warsztaty Fotografii Miejskiej".',
    timeAgo: '1 godz temu',
    isRead: false,
    group: 'TODAY',
    referenceId: 'event-photo-456', 
    eventMeta: {
      time: '18:00 Today',
      price: 'Free'
    }
  },
  {
    id: 'notif-3',
    type: 'FRIEND_JOINED',
    title: 'Twój znajomy dołączył do wydarzenia!',
    message: 'Marta Nowak dołączyła do "Wieczór z Planszówkami".',
    timeAgo: '3 godz temu',
    isRead: true,
    group: 'TODAY',
    referenceId: 'user-marta-789', 
    avatarUrl: 'https://i.pravatar.cc/150?u=marta',
  },
  {
    id: 'notif-4',
    type: 'SYSTEM_APPROVAL',
    title: 'Twoje wydarzenie zostało zaakceptowane!',
    message: 'Moderator zatwierdził Twój post "Turniej Tenisa Amatorów". Jest on już widoczny dla wszystkich.',
    timeAgo: 'Wczoraj',
    isRead: true,
    group: 'YESTERDAY',
    referenceId: 'event-tennis-012', 
  }
];

export const notificationHandlers = [
  http.get('/api/notifications', () => {
    const data = notificationsResponseSchema.parse(initialNotifications);
    return HttpResponse.json(data, { status: 200 });
  }),
  
  http.patch('/api/notifications/:id/read', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({ success: true, id }, { status: 200 });
  })
];



