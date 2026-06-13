import { http, HttpResponse } from 'msw';
import {
  createEventPayloadSchema,
  geocodeSearchPayloadSchema,
} from '../../pages/event-management/dto/eventManagementSchemas.ts';
import {
  createAuthoredEventForUser,
  getAuthoredEventsForUser,
  searchAddressCandidates,
} from '../events/store.ts';

const organizerByUserId: Record<string, { displayName: string; avatarUrl?: string }> = {
  'user-1': {
    displayName: 'Jan Kowalski',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
  },
};

const getAuthorizedUserId = (authorization: string | null): string | null => {
  if (!authorization?.startsWith('Bearer token-')) {
    return null;
  }

  return authorization.slice('Bearer token-'.length);
};

export const eventManagementHandlers = [
  http.get('/api/events/authored', async ({ request }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    return HttpResponse.json(getAuthoredEventsForUser(userId), { status: 200 });
  }),
  http.post('/api/events/geocode', async ({ request }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    const payloadResult = geocodeSearchPayloadSchema.safeParse(await request.json());
    if (!payloadResult.success) {
      return HttpResponse.json({ message: 'request_invalid' }, { status: 400 });
    }

    const results = searchAddressCandidates(payloadResult.data.query);
    if (results.length === 0) {
      return HttpResponse.json({ message: 'location_not_found' }, { status: 404 });
    }

    return HttpResponse.json({ results }, { status: 200 });
  }),
  http.post('/api/events', async ({ request }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    const payloadResult = createEventPayloadSchema.safeParse(await request.json());
    if (!payloadResult.success) {
      return HttpResponse.json({ message: 'request_invalid' }, { status: 400 });
    }

    const payload = payloadResult.data;
    const organizer = organizerByUserId[userId] ?? { displayName: 'Socially User' };
    const createdEvent = createAuthoredEventForUser(userId, payload, organizer);
    if (!createdEvent) {
      return HttpResponse.json({ message: 'address_unresolvable' }, { status: 422 });
    }

    return HttpResponse.json(createdEvent, { status: 201 });
  }),
];
