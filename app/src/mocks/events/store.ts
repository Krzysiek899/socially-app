import { discoverEventSchema, discoverEventsResponseSchema } from '../../pages/discover/dto/discoverSchemas.ts';
import type { DiscoverEvent } from '../../pages/discover/domain/discoverModels.ts';
import type {
  AuthoredEvent,
  CreateEventPayload,
  JoinRequestAction,
  ParticipatingEvent,
  ParticipationState,
  UpdateJoinRulesPayload,
  UpdateAuthoredEventPayload,
} from '../../pages/event-management/domain/eventManagementModels.ts';
import { authoredEventSchema } from '../../pages/event-management/dto/eventManagementSchemas.ts';

type Coordinates = { lat: number; lng: number };
type AddressInput = CreateEventPayload['address'];
type ParticipationRecord = { userId: string; state: ParticipationState };

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
    id: 'event-krakow-mistrzejowice-sunset-run',
    title: 'Sunset Run — Mistrzejowice',
    dateTime: '2026-06-14T13:10:00Z',
    description: 'Lekki bieg osiedlowy po Mistrzejowicach i Plantach Mistrzejowickich.',
    category: 'SPORT',
    address: {
      city: 'Kraków',
      street: 'os. Piastów',
      buildingNumber: '53',
      postalCode: '31-625',
    },
    location: {
      lat: 50.0953,
      lng: 20.0008,
    },
    price: {
      amount: 0,
      currency: 'PLN',
      isFree: true,
    },
    organizer: {
      id: 'org-kasia',
      displayName: 'Kasia Nowak',
    },
    attendeesCount: 7,
    attendees: [
      { id: 'u23', displayName: 'Patryk L.' },
      { id: 'u24', displayName: 'Monika J.' },
      { id: 'u25', displayName: 'Sebastian W.' },
      { id: 'u26', displayName: 'Natalia D.' },
      { id: 'u27', displayName: 'Damian K.' },
      { id: 'u28', displayName: 'Maja C.' },
      { id: 'u29', displayName: 'Krzysztof P.' },
    ],
  },
  {
    id: 'event-krakow-center-coffee-walk',
    title: 'Coffee Walk — Centrum Krakowa',
    dateTime: '2026-06-14T12:50:00Z',
    description: 'Spacer i networking wokół Rynku Głównego z krótkim przystankiem na kawę.',
    category: 'COMMUNITY',
    address: {
      city: 'Kraków',
      street: 'Rynek Główny',
      buildingNumber: '1',
      postalCode: '31-042',
    },
    location: {
      lat: 50.0619,
      lng: 19.9373,
    },
    price: {
      amount: 0,
      currency: 'PLN',
      isFree: true,
    },
    organizer: {
      id: 'org-michal',
      displayName: 'Michał Zając',
    },
    attendeesCount: 5,
    attendees: [
      { id: 'u30', displayName: 'Ewelina K.' },
      { id: 'u31', displayName: 'Adam S.' },
      { id: 'u32', displayName: 'Iwona T.' },
      { id: 'u33', displayName: 'Łukasz R.' },
      { id: 'u34', displayName: 'Paulina B.' },
    ],
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

const authoredEventsByUser = new Map<string, AuthoredEvent[]>([
  [
    'user-1',
    [
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
          { id: 'participant-ola', displayName: 'Ola Brzezińska' },
          { id: 'participant-piotr', displayName: 'Piotr Stępień' },
          { id: 'friend-emilia', displayName: 'Emilia Zawadzka' },
        ],
        management: {
          isActive: true,
          capacity: 8,
          joinRules: {
            visibility: 'PUBLIC',
            approvalRequired: true,
          },
          participants: [
            { id: 'participant-ola', displayName: 'Ola Brzezińska' },
            { id: 'participant-piotr', displayName: 'Piotr Stępień' },
            { id: 'friend-emilia', displayName: 'Emilia Zawadzka' },
          ],
          joinRequests: [
            {
              id: 'request-1',
              userId: 'request-krzysztof',
              displayName: 'Krzysztof Malec',
              requestedAt: '2026-06-13T12:00:00.000Z',
            },
            {
              id: 'request-2',
              userId: 'request-julia',
              displayName: 'Julia Krawiec',
              requestedAt: '2026-06-13T12:30:00.000Z',
            },
          ],
        },
      },
      {
        id: 'event-user-1-design-critique',
        title: 'Design Critique: Onboarding',
        dateTime: '2026-08-10T17:30:00Z',
        description: 'Przegląd ekranów onboardingowych i wspólna sesja feedbacku.',
        category: 'TECH',
        address: {
          city: 'Warszawa',
          street: 'Tamka',
          buildingNumber: '12',
          postalCode: '00-349',
        },
        location: {
          lat: 52.2405,
          lng: 21.0216,
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
        attendeesCount: 2,
        attendees: [
          { id: 'friend-julia', displayName: 'Julia Krawiec' },
          { id: 'participant-lena', displayName: 'Lena Kubiak' },
        ],
        management: {
          isActive: true,
          capacity: 20,
          joinRules: {
            visibility: 'PUBLIC',
            approvalRequired: true,
          },
          participants: [
            { id: 'friend-julia', displayName: 'Julia Krawiec' },
            { id: 'participant-lena', displayName: 'Lena Kubiak' },
          ],
          joinRequests: [
            {
              id: 'request-3',
              userId: 'friend-pawel',
              displayName: 'Paweł Nowak',
              requestedAt: '2026-08-01T11:20:00.000Z',
            },
          ],
        },
      },
    ].map((event) => authoredEventSchema.parse(event)),
  ],
]);

const knownUserById: Record<string, { displayName: string; avatarUrl?: string }> = {
  'user-1': {
    displayName: 'Jan Kowalski',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
  },
  'org-anna': {
    displayName: 'Anna Wójcik',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  },
  'org-dawid': {
    displayName: 'Dawid Cieślak',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
  },
  'org-kasia': {
    displayName: 'Kasia Mazur',
  },
  'friend-pawel': {
    displayName: 'Paweł Nowak',
  },
  'friend-julia': {
    displayName: 'Julia Krawiec',
  },
  'friend-emilia': {
    displayName: 'Emilia Zawadzka',
  },
  'participant-ola': {
    displayName: 'Ola Brzezińska',
  },
  'participant-piotr': {
    displayName: 'Piotr Stępień',
  },
  'participant-lena': {
    displayName: 'Lena Kubiak',
  },
  'request-krzysztof': {
    displayName: 'Krzysztof Malec',
  },
  'request-julia': {
    displayName: 'Julia Krawiec',
  },
};

export const upsertKnownUser = (
  userId: string,
  user: { displayName?: string; avatarUrl?: string },
): void => {
  const normalizedDisplayName = user.displayName?.trim();
  const nextDisplayName = normalizedDisplayName && normalizedDisplayName.length > 0
    ? normalizedDisplayName
    : knownUserById[userId]?.displayName;

  if (!nextDisplayName) {
    return;
  }

  knownUserById[userId] = {
    displayName: nextDisplayName,
    avatarUrl: user.avatarUrl ?? knownUserById[userId]?.avatarUrl,
  };
};

const participationByEventId = new Map<string, ParticipationRecord[]>([
  [
    'event-warsaw-tech-meetup',
    [
      { userId: 'user-1', state: 'pending' },
    ],
  ],
  [
    'event-krakow-jazz-night',
    [
      { userId: 'user-1', state: 'joined' },
    ],
  ],
  [
    'event-krakow-center-coffee-walk',
    [
      { userId: 'user-1', state: 'joined' },
    ],
  ],
]);

const getAllAuthoredEvents = () =>
  Array.from(authoredEventsByUser.values()).flat() as AuthoredEvent[];

const buildDefaultManagementState = (capacity: number | null) => ({
  isActive: true,
  capacity,
  joinRules: {
    visibility: 'PUBLIC' as const,
    approvalRequired: true,
  },
  participants: [] as AuthoredEvent['management']['participants'],
  joinRequests: [] as AuthoredEvent['management']['joinRequests'],
});

const upsertParticipation = (eventId: string, userId: string, state: ParticipationState) => {
  const existing = participationByEventId.get(eventId) ?? [];
  const withoutUser = existing.filter((item) => item.userId !== userId);
  participationByEventId.set(eventId, [...withoutUser, { userId, state }]);
};

const removeParticipation = (eventId: string, userId: string) => {
  const existing = participationByEventId.get(eventId) ?? [];
  const next = existing.filter((item) => item.userId !== userId);
  if (next.length === 0) {
    participationByEventId.delete(eventId);
    return;
  }

  participationByEventId.set(eventId, next);
};

const getParticipationState = (eventId: string, userId: string): ParticipationState | null =>
  participationByEventId.get(eventId)?.find((item) => item.userId === userId)?.state ?? null;

export const getParticipationStateForUser = (eventId: string, userId: string): ParticipationState | null =>
  getParticipationState(eventId, userId);

const withJoinedParticipationApplied = (event: AuthoredEvent | DiscoverEvent): AuthoredEvent | DiscoverEvent => {
  const joined = (participationByEventId.get(event.id) ?? []).filter((item) => item.state === 'joined');
  if (joined.length === 0) {
    return event;
  }

  const existingIds = new Set(event.attendees.map((attendee) => attendee.id));
  const joinedAttendees = joined
    .filter((item) => !existingIds.has(item.userId))
    .map((item) => ({
      id: item.userId,
      displayName: knownUserById[item.userId]?.displayName ?? 'Socially User',
      avatarUrl: knownUserById[item.userId]?.avatarUrl,
    }));

  if (joinedAttendees.length === 0) {
    return event;
  }

  return {
    ...event,
    attendees: [...event.attendees, ...joinedAttendees],
    attendeesCount: event.attendeesCount + joinedAttendees.length,
  };
};

export const getAllDiscoverEvents = () =>
  discoverEventsResponseSchema.parse(
    [...discoverSeedEvents, ...getAllAuthoredEvents()].map((event) => {
      const eventWithParticipation = withJoinedParticipationApplied(event);
      if ('management' in eventWithParticipation) {
        return {
          ...eventWithParticipation,
          participantCapacity: eventWithParticipation.management.capacity,
        };
      }

      return eventWithParticipation;
    }),
  );

export const getDiscoverEventById = (eventId: string) =>
  getAllDiscoverEvents().find((event) => event.id === eventId);

export const getAuthoredEventsForUser = (userId: string) =>
  (authoredEventsByUser.get(userId) ?? []).map((event) => authoredEventSchema.parse(event));

export const getAuthoredEventByIdForUser = (userId: string, eventId: string) =>
  getAuthoredEventsForUser(userId).find((event) => event.id === eventId);

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

  const managedEvent = authoredEventSchema.parse({
    ...createdEvent,
    management: buildDefaultManagementState(payload.capacity),
  });

  const currentEvents = authoredEventsByUser.get(userId) ?? [];
  authoredEventsByUser.set(userId, [managedEvent, ...currentEvents]);
  return managedEvent;
};

export const getParticipatingEventsForUser = (userId: string): ParticipatingEvent[] =>
  getAllDiscoverEvents()
    .map((event) => {
      const state = getParticipationState(event.id, userId);
      if (!state) {
        return null;
      }

      return {
        ...event,
        participation: { state },
      } satisfies ParticipatingEvent;
    })
    .filter((event): event is ParticipatingEvent => event !== null);

export const joinEventForUser = (userId: string, eventId: string) => {
  const event = getDiscoverEventById(eventId);
  if (!event) {
    return { type: 'not_found' as const };
  }

  if (event.organizer.id === userId) {
    return { type: 'forbidden' as const };
  }

  const currentState = getParticipationState(eventId, userId);
  if (currentState === 'joined' || currentState === 'pending') {
    return { type: 'conflict' as const };
  }

  const authoredOwnerEntry = Array.from(authoredEventsByUser.entries()).find(([, events]) =>
    events.some((item) => item.id === eventId));
  const authoredEvent = authoredOwnerEntry
    ? authoredOwnerEntry[1].find((item) => item.id === eventId) ?? null
    : null;
  const requiresApproval = authoredEvent?.management.joinRules.approvalRequired ?? false;

  if (requiresApproval && authoredOwnerEntry && authoredEvent) {
    const requestId = `request-${eventId}-${userId}`;
    const requestExists = authoredEvent.management.joinRequests.some((item) => item.userId === userId);
    if (!requestExists) {
      const request = {
        id: requestId,
        userId,
        displayName: knownUserById[userId]?.displayName ?? 'Socially User',
        avatarUrl: knownUserById[userId]?.avatarUrl,
        requestedAt: new Date().toISOString(),
      };
      const updatedEvent = authoredEventSchema.parse({
        ...authoredEvent,
        management: {
          ...authoredEvent.management,
          joinRequests: [...authoredEvent.management.joinRequests, request],
        },
      });
      const next = authoredOwnerEntry[1].map((item) => (item.id === eventId ? updatedEvent : item));
      authoredEventsByUser.set(authoredOwnerEntry[0], next);
    }
    upsertParticipation(eventId, userId, 'pending');
    return { type: 'ok' as const, state: 'pending' as const };
  }

  upsertParticipation(eventId, userId, 'joined');
  return { type: 'ok' as const, state: 'joined' as const };
};

export const leaveEventForUser = (userId: string, eventId: string) => {
  const event = getDiscoverEventById(eventId);
  if (!event) {
    return { type: 'not_found' as const };
  }

  removeParticipation(eventId, userId);

  const authoredOwnerEntry = Array.from(authoredEventsByUser.entries()).find(([, events]) =>
    events.some((item) => item.id === eventId));
  const authoredEvent = authoredOwnerEntry
    ? authoredOwnerEntry[1].find((item) => item.id === eventId) ?? null
    : null;
  if (authoredOwnerEntry && authoredEvent) {
    const updatedEvent = authoredEventSchema.parse({
      ...authoredEvent,
      management: {
        ...authoredEvent.management,
        joinRequests: authoredEvent.management.joinRequests.filter((item) => item.userId !== userId),
      },
    });
    const next = authoredOwnerEntry[1].map((item) => (item.id === eventId ? updatedEvent : item));
    authoredEventsByUser.set(authoredOwnerEntry[0], next);
  }

  return { type: 'ok' as const };
};

export const updateAuthoredEventForUser = (
  userId: string,
  eventId: string,
  payload: UpdateAuthoredEventPayload,
) => {
  const currentEvents = authoredEventsByUser.get(userId) ?? [];
  const eventIndex = currentEvents.findIndex((event) => event.id === eventId);
  if (eventIndex < 0) {
    return { type: 'not_found' as const };
  }

  const existingEvent = currentEvents[eventIndex];
  const currentParticipantsCount = existingEvent.management.participants.length;
  if (payload.capacity !== null && payload.capacity < currentParticipantsCount) {
    return { type: 'capacity_invalid' as const };
  }

  const updatedEvent = authoredEventSchema.parse({
    ...existingEvent,
    title: payload.title,
    description: payload.description,
    dateTime: payload.dateTime,
    address: payload.address,
    price: payload.price,
    management: {
      ...existingEvent.management,
      capacity: payload.capacity,
    },
  });

  const nextEvents = [...currentEvents];
  nextEvents[eventIndex] = updatedEvent;
  authoredEventsByUser.set(userId, nextEvents);
  return { type: 'ok' as const, event: updatedEvent };
};

export const updateJoinRulesForUser = (
  userId: string,
  eventId: string,
  payload: UpdateJoinRulesPayload,
) => {
  const currentEvents = authoredEventsByUser.get(userId) ?? [];
  const eventIndex = currentEvents.findIndex((event) => event.id === eventId);
  if (eventIndex < 0) {
    return { type: 'not_found' as const };
  }

  const existingEvent = currentEvents[eventIndex];
  const updatedEvent = authoredEventSchema.parse({
    ...existingEvent,
    management: {
      ...existingEvent.management,
      joinRules: payload,
    },
  });

  const nextEvents = [...currentEvents];
  nextEvents[eventIndex] = updatedEvent;
  authoredEventsByUser.set(userId, nextEvents);
  return { type: 'ok' as const, event: updatedEvent };
};

export const handleJoinRequestForUser = (
  userId: string,
  eventId: string,
  requestId: string,
  action: JoinRequestAction,
) => {
  const currentEvents = authoredEventsByUser.get(userId) ?? [];
  const eventIndex = currentEvents.findIndex((event) => event.id === eventId);
  if (eventIndex < 0) {
    return { type: 'not_found' as const };
  }

  const existingEvent = currentEvents[eventIndex];
  const request = existingEvent.management.joinRequests.find((item) => item.id === requestId);
  if (!request) {
    return { type: 'request_not_found' as const };
  }

  const nextJoinRequests = existingEvent.management.joinRequests.filter((item) => item.id !== requestId);
  const nextParticipants = action === 'approve'
    ? [...existingEvent.management.participants, {
      id: request.userId,
      displayName: request.displayName,
      avatarUrl: request.avatarUrl,
    }]
    : existingEvent.management.participants;

  if (action === 'approve') {
    upsertParticipation(eventId, request.userId, 'joined');
  } else {
    removeParticipation(eventId, request.userId);
  }

  const updatedEvent = authoredEventSchema.parse({
    ...existingEvent,
    attendeesCount: nextParticipants.length,
    attendees: nextParticipants,
    management: {
      ...existingEvent.management,
      participants: nextParticipants,
      joinRequests: nextJoinRequests,
    },
  });

  const nextEvents = [...currentEvents];
  nextEvents[eventIndex] = updatedEvent;
  authoredEventsByUser.set(userId, nextEvents);
  return { type: 'ok' as const, event: updatedEvent };
};
