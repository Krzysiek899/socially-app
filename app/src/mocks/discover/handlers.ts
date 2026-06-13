import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import { DISCOVER_CATEGORY_CODES } from '../../pages/discover/domain/discoverModels.ts';
import { discoverEventsResponseSchema } from '../../pages/discover/dto/discoverSchemas.ts';
import { getAllDiscoverEvents, getDiscoverEventById } from '../events/store.ts';

const discoverFiltersSchema = z.object({
  q: z.string().optional(),
  category: z.array(z.enum(DISCOVER_CATEGORY_CODES)).optional(),
  price: z.enum(['free', 'paid']).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const parseDiscoverFilters = (url: URL) =>
  discoverFiltersSchema.parse({
    q: url.searchParams.get('q') ?? undefined,
    category: url.searchParams.getAll('category'),
    price: url.searchParams.get('price') ?? undefined,
    dateFrom: url.searchParams.get('dateFrom') ?? undefined,
    dateTo: url.searchParams.get('dateTo') ?? undefined,
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
      .sort((left, right) => left.dateTime.localeCompare(right.dateTime));

    return HttpResponse.json(discoverEventsResponseSchema.parse(filteredEvents), { status: 200 });
  }),
  http.get('/api/discover/events/:eventId', async ({ request, params }) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer token-')) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    const event = typeof params.eventId === 'string' ? getDiscoverEventById(params.eventId) : undefined;
    if (!event) {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    return HttpResponse.json(event, { status: 200 });
  }),
];
