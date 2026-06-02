import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import { DISCOVER_CATEGORY_CODES } from '../../features/discover/domain/discoverModels.ts';
import { discoverEventsResponseSchema } from '../../features/discover/dto/discoverSchemas.ts';

const discoverFiltersSchema = z.object({
  q: z.string().optional(),
  category: z.array(z.enum(DISCOVER_CATEGORY_CODES)).optional(),
  price: z.enum(['free', 'paid']).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const discoverEvents = discoverEventsResponseSchema.parse([
  {
    id: 'event-krakow-jazz-night',
    title: 'Jazz Night nad Wisłą',
    dateTime: '2026-06-20T17:30:00Z',
    description: 'Wieczorny koncert jazzowy i jam session na bulwarach.',
    category: 'MUSIC',
    address: {
      city: 'Kraków',
      street: 'Bulwar Czerwieński',
      buildingNumber: '1',
      postalCode: '31-069',
    },
    location: {
      lat: 50.0515,
      lng: 19.9366,
    },
    price: {
      amount: 0,
      currency: 'PLN',
      isFree: true,
    },
    organizer: {
      id: 'org-anna',
      displayName: 'Anna Wójcik',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    },
    attendeesCount: 12,
    attendees: [
      { id: 'u1', displayName: 'Paweł K.', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80' },
      { id: 'u2', displayName: 'Natalia S.', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80' },
      { id: 'u3', displayName: 'Michał R.' },
      { id: 'u4', displayName: 'Kasia W.' },
      { id: 'u5', displayName: 'Ola M.' },
      { id: 'u6', displayName: 'Tomek P.' },
      { id: 'u7', displayName: 'Marek Z.' },
      { id: 'u8', displayName: 'Iga B.' },
      { id: 'u9', displayName: 'Adrian N.' },
      { id: 'u10', displayName: 'Zofia T.' },
      { id: 'u11', displayName: 'Kuba G.' },
      { id: 'u12', displayName: 'Ewa C.' },
    ],
    photoUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 'event-warsaw-tech-meetup',
    title: 'Frontend Meetup Warszawa',
    dateTime: '2026-06-15T16:00:00Z',
    description: 'Spotkanie społeczności frontendowej z lightning talkami.',
    category: 'TECH',
    address: {
      city: 'Warszawa',
      street: 'Prosta',
      buildingNumber: '51',
      postalCode: '00-838',
    },
    location: {
      lat: 52.2326,
      lng: 20.9842,
    },
    price: {
      amount: 35,
      currency: 'PLN',
      isFree: false,
    },
    organizer: {
      id: 'org-dawid',
      displayName: 'Dawid Cieślak',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    },
    attendeesCount: 6,
    attendees: [
      { id: 'u13', displayName: 'Magda O.' },
      { id: 'u14', displayName: 'Bartek P.' },
      { id: 'u15', displayName: 'Sandra R.' },
      { id: 'u16', displayName: 'Mikołaj F.' },
      { id: 'u17', displayName: 'Laura K.' },
      { id: 'u18', displayName: 'Dominik H.' },
    ],
    photoUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 'event-gdansk-kayak',
    title: 'Poranny spływ kajakowy',
    dateTime: '2026-06-18T07:00:00Z',
    description: 'Rekreacyjny spływ kajakowy z instruktorem dla początkujących.',
    category: 'OUTDOOR',
    address: {
      city: 'Gdańsk',
      street: 'Sienna Grobla',
      buildingNumber: '7',
      postalCode: '80-760',
    },
    location: {
      lat: 54.3515,
      lng: 18.6719,
    },
    price: {
      amount: 70,
      currency: 'PLN',
      isFree: false,
    },
    organizer: {
      id: 'org-julia',
      displayName: 'Julia Lis',
    },
    attendeesCount: 4,
    attendees: [
      { id: 'u19', displayName: 'Karol M.' },
      { id: 'u20', displayName: 'Wiktoria N.' },
      { id: 'u21', displayName: 'Robert D.' },
      { id: 'u22', displayName: 'Agnieszka G.' },
    ],
  },
]);

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

    const event = discoverEvents.find((item) => item.id === params.eventId);
    if (!event) {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    return HttpResponse.json(event, { status: 200 });
  }),
];
