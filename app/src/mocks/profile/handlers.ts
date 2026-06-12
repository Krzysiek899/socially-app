import { http, HttpResponse } from 'msw';
import { myProfileSchema, publicProfileSchema } from '../../pages/profile/dto/profileSchemas.ts';

const myProfiles = new Map([
  ['user-1', myProfileSchema.parse({
    id: 'user-1',
    displayName: 'Jan Kowalski',
    badge: 'Świetny organizator',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    bio: 'Pasjonat lokalnych inicjatyw i sportów zespołowych. Od 5 lat organizuję weekendowe turnieje piłki nożnej oraz wspólne wyjścia do kina. Zawsze dbam o to, by nikt nie czuł się wykluczony.',
    friendsCount: 124,
    friends: [
      { id: 'friend-1', displayName: 'Anna Nowak', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80' },
      { id: 'friend-2', displayName: 'Marek Wiśniewski', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80' },
      { id: 'friend-3', displayName: 'Kasia Kowalczyk', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80' },
    ],
    groupsCount: 8,
    groups: [
      { id: 'group-1', name: 'Biegacze Powiśle', iconKey: 'sport' },
      { id: 'group-2', name: 'Klub Czytelniczy', iconKey: 'book' },
      { id: 'group-3', name: 'Tech Meetup WAW', iconKey: 'tech' },
    ],
  })],
]);

const publicProfiles = new Map([
  [
    'org-anna',
    publicProfileSchema.parse({
      id: 'org-anna',
      displayName: 'Anna Wójcik',
      handle: '@anna_wojcik',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
      city: 'Kraków',
      joinedAt: '2023-03-15T10:00:00.000Z',
      bio: 'Organizuję kameralne wydarzenia muzyczne i dbam o to, żeby nowym osobom łatwo było wejść do społeczności.',
      badges: ['Zweryfikowana organizatorka', 'Wysoka responsywność'],
      interests: ['Jazz', 'Jam session', 'Lokalne społeczności'],
      stats: [
        { label: 'Ocena', value: '4.8' },
        { label: 'Opinie', value: '34' },
        { label: 'Dołączone', value: '12' },
        { label: 'Zorganizowane', value: '9' },
      ],
      sections: [
        {
          id: 'upcoming',
          title: 'Nadchodzące aktywności',
          description: 'Najbliższe spotkania, które pokazują aktualny rytm aktywności użytkownika.',
          emptyText: 'Brak nadchodzących aktywności do pokazania.',
          items: [
            {
              id: 'event-krakow-jazz-night',
              title: 'Jazz Night nad Wisłą',
              subtitle: 'Wieczorny koncert jazzowy i jam session na bulwarach.',
              meta: '20 czerwca · Kraków',
              badge: 'Organizuje',
            },
          ],
        },
        {
          id: 'community',
          title: 'Ślady zaufania w społeczności',
          description: 'Ostatnie sygnały, które pomagają ocenić styl uczestnictwa i organizacji.',
          emptyText: 'Brak dodatkowych aktywności do pokazania.',
          items: [
            {
              id: 'recent-review',
              title: 'Odpowiada szybko na pytania uczestników',
              subtitle: 'Uczestnicy podkreślają sprawną komunikację przed wydarzeniem.',
              meta: 'Ostatnia opinia · 2 dni temu',
            },
            {
              id: 'recent-hosting',
              title: 'Regularnie prowadzi wydarzenia muzyczne',
              subtitle: 'Prowadzi formaty, które zachęcają nowych uczestników do powrotu.',
              meta: '9 wydarzeń w ostatnich 6 miesiącach',
            },
          ],
        },
      ],
    }),
  ],
  [
    'org-dawid',
    publicProfileSchema.parse({
      id: 'org-dawid',
      displayName: 'Dawid Cieślak',
      handle: '@dawid_cieslak',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
      city: 'Warszawa',
      joinedAt: '2022-11-09T12:00:00.000Z',
      bio: 'Łączę ludzi z branży frontendowej wokół meetupów i krótkich formatów wiedzy.',
      badges: ['Mentor społeczności'],
      interests: ['JavaScript', 'React', 'Mentoring'],
      stats: [
        { label: 'Ocena', value: '4.7' },
        { label: 'Opinie', value: '21' },
        { label: 'Dołączone', value: '8' },
        { label: 'Zorganizowane', value: '6' },
      ],
      sections: [
        {
          id: 'upcoming',
          title: 'Nadchodzące aktywności',
          description: 'Najbliższe wydarzenia widoczne dla innych użytkowników.',
          emptyText: 'Brak nadchodzących aktywności do pokazania.',
          items: [
            {
              id: 'event-warsaw-tech-meetup',
              title: 'Frontend Meetup Warszawa',
              subtitle: 'Spotkanie społeczności frontendowej z lightning talkami.',
              meta: '15 czerwca · Warszawa',
              badge: 'Organizuje',
            },
          ],
        },
        {
          id: 'community',
          title: 'Kontekst społeczności',
          description: 'Wybrane sygnały reputacyjne związane z uczestnictwem i organizacją.',
          emptyText: 'Brak dodatkowego kontekstu do pokazania.',
          items: [],
        },
      ],
    }),
  ],
]);

const getAuthorizedUserId = (authorization: string | null): string | null => {
  if (!authorization?.startsWith('Bearer token-')) {
    return null;
  }

  return authorization.slice('Bearer token-'.length);
};

export const profileHandlers = [
  http.get('/api/profile/me', async ({ request }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    const profile = myProfiles.get(userId);
    if (!profile) {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    return HttpResponse.json(profile, { status: 200 });
  }),
  http.get('/api/profile/users/:userId', async ({ request, params }) => {
    const authorizedUserId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!authorizedUserId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    const requestedUserId = typeof params.userId === 'string' ? params.userId : '';
    const profile = publicProfiles.get(requestedUserId);
    if (!profile) {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    return HttpResponse.json(profile, { status: 200 });
  }),
];
