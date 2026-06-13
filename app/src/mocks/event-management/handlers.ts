import { http, HttpResponse } from 'msw';
import {
  createEventPayloadSchema,
  geocodeSearchPayloadSchema,
  handleJoinRequestPayloadSchema,
  reverseGeocodePayloadSchema,
  updateJoinRulesPayloadSchema,
  updateAuthoredEventPayloadSchema,
} from '../../pages/event-management/dto/eventManagementSchemas.ts';
import type { GeocodeResult } from '../../pages/event-management/domain/eventManagementModels.ts';
import {
  createAuthoredEventForUser,
  getAuthoredEventByIdForUser,
  getAuthoredEventsForUser,
  getParticipatingEventsForUser,
  handleJoinRequestForUser,
  joinEventForUser,
  leaveEventForUser,
  updateJoinRulesForUser,
  updateAuthoredEventForUser,
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

type NominatimItem = {
  place_id?: number;
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    road?: string;
    pedestrian?: string;
    footway?: string;
    path?: string;
    house_number?: string;
    postcode?: string;
  };
};

const toGeocodeResult = (item: NominatimItem): GeocodeResult | null => {
  const city = item.address?.city ?? item.address?.town ?? item.address?.village ?? item.address?.municipality;
  const street = item.address?.road ?? item.address?.pedestrian ?? item.address?.footway ?? item.address?.path;
  const buildingNumber = item.address?.house_number;

  if (!city || !street || !buildingNumber || !item.lat || !item.lon) {
    return null;
  }

  const lat = Number(item.lat);
  const lng = Number(item.lon);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  return {
    id: `osm-${item.place_id ?? `${street}-${buildingNumber}-${city}`}`,
    label: `${street} ${buildingNumber}, ${city}`,
    location: { lat, lng },
    address: {
      city,
      street,
      buildingNumber,
      postalCode: item.address?.postcode,
    },
  };
};

const fetchNominatimResults = async (query: string): Promise<GeocodeResult[]> => {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '7');
  url.searchParams.set('countrycodes', 'pl');
  url.searchParams.set('q', query);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    return [];
  }

  const body = await response.json();
  if (!Array.isArray(body)) {
    return [];
  }

  const parsed = body
    .map((item) => toGeocodeResult(item as NominatimItem))
    .filter((item): item is GeocodeResult => item !== null);

  return parsed.slice(0, 5);
};

const fetchNominatimReverseResult = async (location: { lat: number; lng: number }): Promise<GeocodeResult | null> => {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('zoom', '18');
  url.searchParams.set('lat', String(location.lat));
  url.searchParams.set('lon', String(location.lng));

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    return null;
  }

  const body = await response.json();
  if (body === null || typeof body !== 'object') {
    return null;
  }

  return toGeocodeResult(body as NominatimItem);
};

export const eventManagementHandlers = [
  http.get('/api/events/authored', async ({ request }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    return HttpResponse.json(getAuthoredEventsForUser(userId), { status: 200 });
  }),
  http.get('/api/events/participating', async ({ request }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    return HttpResponse.json(getParticipatingEventsForUser(userId), { status: 200 });
  }),
  http.get('/api/events/authored/:eventId', async ({ request, params }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    if (typeof params.eventId !== 'string') {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    const event = getAuthoredEventByIdForUser(userId, params.eventId);
    if (!event) {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    return HttpResponse.json(event, { status: 200 });
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

    const query = payloadResult.data.query;

    let results: GeocodeResult[] = [];
    try {
      results = await fetchNominatimResults(query);
    } catch {
      results = [];
    }

    if (results.length === 0) {
      return HttpResponse.json({ message: 'location_not_found' }, { status: 404 });
    }

    return HttpResponse.json({ results }, { status: 200 });
  }),
  http.post('/api/events/reverse-geocode', async ({ request }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    const payloadResult = reverseGeocodePayloadSchema.safeParse(await request.json());
    if (!payloadResult.success) {
      return HttpResponse.json({ message: 'request_invalid' }, { status: 400 });
    }

    const location = payloadResult.data;
    let result: GeocodeResult | null = null;

    try {
      result = await fetchNominatimReverseResult(location);
    } catch {
      result = null;
    }

    if (!result) {
      return HttpResponse.json({ message: 'location_not_found' }, { status: 404 });
    }

    return HttpResponse.json({ result }, { status: 200 });
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
  http.patch('/api/events/authored/:eventId', async ({ request, params }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    if (typeof params.eventId !== 'string') {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    const payloadResult = updateAuthoredEventPayloadSchema.safeParse(await request.json());
    if (!payloadResult.success) {
      return HttpResponse.json({ message: 'request_invalid' }, { status: 400 });
    }

    const result = updateAuthoredEventForUser(userId, params.eventId, payloadResult.data);
    if (result.type === 'not_found') {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }
    if (result.type === 'capacity_invalid') {
      return HttpResponse.json({ message: 'capacity_invalid' }, { status: 409 });
    }

    return HttpResponse.json(result.event, { status: 200 });
  }),
  http.patch('/api/events/authored/:eventId/join-rules', async ({ request, params }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    if (typeof params.eventId !== 'string') {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    const payloadResult = updateJoinRulesPayloadSchema.safeParse(await request.json());
    if (!payloadResult.success) {
      return HttpResponse.json({ message: 'request_invalid' }, { status: 400 });
    }

    const result = updateJoinRulesForUser(userId, params.eventId, payloadResult.data);
    if (result.type === 'not_found') {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    return HttpResponse.json(result.event, { status: 200 });
  }),
  http.post('/api/events/authored/:eventId/requests/:requestId', async ({ request, params }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    if (typeof params.eventId !== 'string' || typeof params.requestId !== 'string') {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    const payloadResult = handleJoinRequestPayloadSchema.safeParse(await request.json());
    if (!payloadResult.success) {
      return HttpResponse.json({ message: 'request_invalid' }, { status: 400 });
    }

    const result = handleJoinRequestForUser(userId, params.eventId, params.requestId, payloadResult.data.action);
    if (result.type === 'not_found' || result.type === 'request_not_found') {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    return HttpResponse.json(result.event, { status: 200 });
  }),
  http.post('/api/events/:eventId/join', async ({ request, params }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    if (typeof params.eventId !== 'string') {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    const result = joinEventForUser(userId, params.eventId);
    if (result.type === 'not_found') {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    if (result.type === 'forbidden') {
      return HttpResponse.json({ message: 'forbidden' }, { status: 403 });
    }

    if (result.type === 'conflict') {
      return HttpResponse.json({ message: 'capacity_invalid' }, { status: 409 });
    }

    return HttpResponse.json({ state: result.state }, { status: 200 });
  }),
  http.delete('/api/events/:eventId/participation', async ({ request, params }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    if (typeof params.eventId !== 'string') {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    const result = leaveEventForUser(userId, params.eventId);
    if (result.type === 'not_found') {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    return HttpResponse.json({ ok: true }, { status: 200 });
  }),
];
