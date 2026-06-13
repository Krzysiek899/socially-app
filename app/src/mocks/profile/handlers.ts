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
      badge: 'Świetny organizator',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
      bio: 'Organizuję kameralne wydarzenia muzyczne i dbam o to, żeby nowym osobom łatwo było wejść do społeczności.',
      rating: 4.8,
      reviewsCount: 34,
      friendAction: 'can_send_request',
      reviews: [
        {
          id: 'review-1',
          authorName: 'Karolina D.',
          authorAvatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
          rating: 5,
          publishedAtLabel: '2 dni temu',
          content: 'Świetna organizacja i bardzo szybki kontakt.',
        },
        {
          id: 'review-2',
          authorName: 'Marek P.',
          authorAvatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
          rating: 4,
          publishedAtLabel: 'Tydzień temu',
          content: 'Bardzo otwarta atmosfera i dopięte szczegóły wydarzenia.',
        },
      ],
      mutualFriends: [
        {
          id: 'friend-1',
          displayName: 'Paweł Nowak',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
        },
        {
          id: 'friend-2',
          displayName: 'Julia Krawiec',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
        },
      ],
      groups: [
        {
          id: 'group-1',
          name: 'Jazz Kraków',
          meta: '5 wspólnych wydarzeń',
        },
        {
          id: 'group-2',
          name: 'Muzyka na żywo',
          meta: '2 wspólnych znajomych',
        },
      ],
    }),
  ],
  [
    'org-dawid',
    publicProfileSchema.parse({
      id: 'org-dawid',
      displayName: 'Dawid Cieślak',
      badge: 'Mentor społeczności',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
      bio: 'Łączę ludzi z branży frontendowej wokół meetupów i krótkich formatów wiedzy.',
      rating: 4.7,
      reviewsCount: 21,
      friendAction: 'can_send_request',
      reviews: [
        {
          id: 'review-1',
          authorName: 'Natalia S.',
          authorAvatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
          rating: 5,
          publishedAtLabel: '3 dni temu',
          content: 'Świetnie prowadzi spotkania i dobrze wprowadza nowe osoby do grupy.',
        },
      ],
      mutualFriends: [],
      groups: [
        {
          id: 'group-1',
          name: 'Frontend Warsaw',
          meta: '3 wspólne wydarzenia',
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
