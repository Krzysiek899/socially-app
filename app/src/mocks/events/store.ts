import { discoverEventSchema, discoverEventsResponseSchema } from '../../pages/discover/dto/discoverSchemas.ts';
import type { CreateEventPayload } from '../../pages/event-management/domain/eventManagementModels.ts';

type Coordinates = { lat: number; lng: number };
type AddressInput = CreateEventPayload['address'];

const knownCoordinatesByCity: Record<string, Coordinates> = {
  warszawa: { lat: 52.2297, lng: 21.0122 },
  krakow: { lat: 50.0614, lng: 19.9366 },
  kraków: { lat: 50.0614, lng: 19.9366 },
  gdansk: { lat: 54.352, lng: 18.6466 },
  gdańsk: { lat: 54.352, lng: 18.6466 },
};

const normalizeValue = (value: string): string => value.trim().toLowerCase();
const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);

const isPostalCodeValid = (postalCode: string | undefined): boolean => {
  if (!postalCode) {
    return true;
  }

  return /^\d{2}-\d{3}$/.test(postalCode.trim());
};

export const resolveAddressCoordinates = (address: AddressInput): Coordinates | null => {
  if (!isPostalCodeValid(address.postalCode)) {
    return null;
  }

  if (!address.street.trim() || !address.buildingNumber.trim()) {
    return null;
  }

  const cityKey = normalizeValue(address.city);
  return knownCoordinatesByCity[cityKey] ?? null;
};

const discoverSeedEvents = discoverEventsResponseSchema.parse([
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

const authoredEventsByUser = new Map([
  [
    'user-1',
    discoverEventsResponseSchema.parse([
      {
        id: 'event-user-1-community-breakfast',
        title: 'Śniadanie społecznościowe',
        dateTime: '2026-07-02T08:30:00Z',
        description: 'Poranne spotkanie dla lokalnej społeczności z networkingiem.',
        category: 'COMMUNITY',
        address: {
          city: 'Warszawa',
          street: 'Marszałkowska',
          buildingNumber: '99',
          postalCode: '00-693',
        },
        location: {
          lat: 52.2297,
          lng: 21.0122,
        },
        price: {
          amount: 0,
          currency: 'PLN',
          isFree: true,
        },
        organizer: {
          id: 'user-1',
          displayName: 'Jan Kowalski',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
        },
        attendeesCount: 3,
        attendees: [
          { id: 'attendee-1', displayName: 'Ola M.' },
          { id: 'attendee-2', displayName: 'Adam P.' },
          { id: 'attendee-3', displayName: 'Karolina Z.' },
        ],
      },
    ]),
  ],
]);

const getAllAuthoredEvents = () =>
  Array.from(authoredEventsByUser.values()).flat();

export const getAllDiscoverEvents = () =>
  discoverEventsResponseSchema.parse([...discoverSeedEvents, ...getAllAuthoredEvents()]);

export const getDiscoverEventById = (eventId: string) =>
  getAllDiscoverEvents().find((event) => event.id === eventId);

export const getAuthoredEventsForUser = (userId: string) =>
  discoverEventsResponseSchema.parse(authoredEventsByUser.get(userId) ?? []);

export const searchAddressCandidates = (query: string) => {
  const normalizedQuery = normalizeValue(query);
  if (normalizedQuery.length < 3) {
    return [];
  }

  const allEvents = getAllDiscoverEvents();
  const unique = new Map<string, {
    id: string;
    label: string;
    location: { lat: number; lng: number };
    address: { city: string; street: string; buildingNumber: string; postalCode?: string };
  }>();

  for (const event of allEvents) {
    const label = `${event.address.street} ${event.address.buildingNumber}, ${event.address.city}`;
    const haystack = normalizeValue(`${label} ${event.address.postalCode ?? ''}`);
    if (!haystack.includes(normalizedQuery)) {
      continue;
    }

    const key = `${event.address.city}|${event.address.street}|${event.address.buildingNumber}|${event.address.postalCode ?? ''}`;
    if (!unique.has(key)) {
      unique.set(key, {
        id: `geo-${slugify(key)}`,
        label,
        location: event.location,
        address: event.address,
      });
    }
  }

  return Array.from(unique.values()).slice(0, 5);
};

export const createAuthoredEventForUser = (
  userId: string,
  payload: CreateEventPayload,
  organizer: { displayName: string; avatarUrl?: string },
) => {
  const coordinates = resolveAddressCoordinates(payload.address);
  if (!coordinates) {
    return null;
  }

  const sameCity = Math.abs(coordinates.lat - payload.location.lat) < 2 && Math.abs(coordinates.lng - payload.location.lng) < 2;
  if (!sameCity) {
    return null;
  }

  const createdEvent = discoverEventSchema.parse({
    id: `event-${slugify(payload.title)}-${Date.now()}`,
    title: payload.title,
    description: payload.description,
    dateTime: payload.dateTime,
    category: payload.category,
    address: payload.address,
    location: payload.location,
    price: payload.price,
    organizer: {
      id: userId,
      displayName: organizer.displayName,
      avatarUrl: organizer.avatarUrl,
    },
    attendeesCount: 0,
    attendees: [],
  });

  const currentEvents = authoredEventsByUser.get(userId) ?? [];
  authoredEventsByUser.set(userId, [createdEvent, ...currentEvents]);
  return createdEvent;
};
