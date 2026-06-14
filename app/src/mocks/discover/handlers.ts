import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import { DISCOVER_CATEGORY_CODES } from '../../pages/discover/domain/discoverModels.ts';
import { isEventStartingWithinMinutes } from '../../pages/discover/domain/hereNow.ts';
import { discoverEventsResponseSchema } from '../../pages/discover/dto/discoverSchemas.ts';
import { getAllDiscoverEvents, getDiscoverEventById, getParticipationStateForUser } from '../events/store.ts';

const discoverFiltersSchema = z.object({
  q: z.string().optional(),
  category: z.array(z.enum(DISCOVER_CATEGORY_CODES)).optional(),
  price: z.enum(['free', 'paid']).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startsWithinMinutes: z.coerce.number().int().positive().optional(),
});

const parseDiscoverFilters = (url: URL) =>
  discoverFiltersSchema.parse({
    q: url.searchParams.get('q') ?? undefined,
    category: url.searchParams.getAll('category'),
    price: url.searchParams.get('price') ?? undefined,
    dateFrom: url.searchParams.get('dateFrom') ?? undefined,
    dateTo: url.searchParams.get('dateTo') ?? undefined,
    startsWithinMinutes: url.searchParams.get('startsWithinMinutes') ?? undefined,
  });

const matchesDateFrom = (eventDateTime: string, dateFrom?: string) => {
  if (!dateFrom) {
    return true;
  }

  return eventDateTime >= `${dateFrom}T00:00:00Z`;
};

const matchesDateTo = (eventDateTime: string, dateTo?: string) => {
  if (!dateTo) {
    return true;
  }

  return eventDateTime <= `${dateTo}T23:59:59Z`;
};

export const discoverHandlers = [
  http.get('/api/discover/events', async ({ request }) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer token-')) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }
    const userId = authHeader.slice('Bearer token-'.length);

    const url = new URL(request.url);
    const filters = parseDiscoverFilters(url);
    const normalizedSearch = filters.q?.trim().toLowerCase() ?? '';

    const discoverEvents = getAllDiscoverEvents();
    const filteredEvents = discoverEvents
      .filter((event) => {
        if (normalizedSearch.length === 0) {
          return true;
        }

        return (
          event.title.toLowerCase().includes(normalizedSearch) ||
          event.description.toLowerCase().includes(normalizedSearch)
        );
      })
      .filter((event) => {
        if (!filters.category || filters.category.length === 0) {
          return true;
        }

        return filters.category.includes(event.category);
      })
      .filter((event) => {
        if (!filters.price) {
          return true;
        }

        if (filters.price === 'free') {
          return event.price.isFree;
        }

        return !event.price.isFree;
      })
      .filter((event) => matchesDateFrom(event.dateTime, filters.dateFrom))
      .filter((event) => matchesDateTo(event.dateTime, filters.dateTo))
      .filter((event) => {
        if (!filters.startsWithinMinutes) {
          return true;
        }

        return isEventStartingWithinMinutes(event.dateTime, new Date().toISOString(), filters.startsWithinMinutes);
      })
      .sort((left, right) => left.dateTime.localeCompare(right.dateTime));

    return HttpResponse.json(discoverEventsResponseSchema.parse(
      filteredEvents.map((event) => {
        const participationState = getParticipationStateForUser(event.id, userId);
        if (!participationState) {
          return event;
        }

        return {
          ...event,
          participation: { state: participationState },
        };
      }),
    ), { status: 200 });
  }),
  http.get('/api/discover/events/:eventId', async ({ request, params }) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer token-')) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }
    const userId = authHeader.slice('Bearer token-'.length);

    const event = typeof params.eventId === 'string' ? getDiscoverEventById(params.eventId) : undefined;
    if (!event) {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    const participationState = getParticipationStateForUser(event.id, userId);

    return HttpResponse.json(participationState
      ? { ...event, participation: { state: participationState } }
      : event, { status: 200 });
  }),
];
