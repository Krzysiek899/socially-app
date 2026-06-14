import { http, HttpResponse, delay } from 'msw';
import { myProfileSchema, publicProfileSchema } from '../../pages/profile/dto/profileSchemas.ts';
import type { PublicProfileReview } from '../../pages/profile/domain/profileModels.ts';

const myProfiles = new Map([
  ['user-1', myProfileSchema.parse({
    id: 'user-1',
    displayName: 'Jan Kowalski',
    badge: 'Świetny organizator',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    bio: 'Pasjonat lokalnych inicjatyw i sportów zespołowych. Od 5 lat organizuję weekendowe turnieje piłki nożnej oraz wspólne wyjścia do kina. Zawsze dbam o to, by nikt nie czuł się wykluczony.',
    friendsCount: 124,
    isApproved: false, 
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
      rating: 4.5,
      reviewsCount: 2,
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
        { id: 'friend-1', displayName: 'Paweł Nowak', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80' },
        { id: 'friend-2', displayName: 'Julia Krawiec', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80' },
      ],
      groups: [
        { id: 'group-1', name: 'Jazz Kraków', meta: '5 wspólnych wydarzeń' },
        { id: 'group-2', name: 'Muzyka na żywo', meta: '2 wspólnych znajomych' },
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
      rating: 5.0,
      reviewsCount: 1,
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
        { id: 'group-1', name: 'Frontend Warsaw', meta: '3 wspólne wydarzenia' },
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
  // 1. GET MY PROFILE
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

  // 2. GET PUBLIC PROFILE
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

    const sanitizedProfile = {
      ...profile,
      reviews: profile.reviews.filter(
        (review) => review.content && review.content.trim().length > 0
      ),
    };

    return HttpResponse.json(sanitizedProfile, { status: 200 });
  }),

  // 3. POST NEW REVIEW
  http.post('/api/profile/users/:userId/reviews', async ({ request, params }) => {
    const authorizedUserId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!authorizedUserId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    const requestedUserId = typeof params.userId === 'string' ? params.userId : '';
    const profile = publicProfiles.get(requestedUserId);
    
    if (!profile) {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    const requestBody = (await request.json()) as { rating: number; content: string };
    await delay(800);

    const deterministicReviewId = `review-from-${authorizedUserId}`;
    const existingReviewIndex = profile.reviews.findIndex((r) => r.id === deterministicReviewId);

    let updatedReviews = [...profile.reviews];
    let newReviewsCount = profile.reviewsCount;
    let newRating = profile.rating;

    const currentTotalScore = profile.rating * profile.reviewsCount;

    if (existingReviewIndex !== -1) {
      const oldReview = profile.reviews[existingReviewIndex];
      newRating = (currentTotalScore - oldReview.rating + requestBody.rating) / profile.reviewsCount;

      updatedReviews[existingReviewIndex] = {
        ...oldReview,
        rating: requestBody.rating,
        content: requestBody.content,
        publishedAtLabel: 'Aktualizowano przed chwilą',
      };

      publicProfiles.set(requestedUserId, {
        ...profile,
        rating: newRating,
        reviews: updatedReviews,
      });

      return HttpResponse.json(updatedReviews[existingReviewIndex], { status: 200 });
    } else {
      const newReviewMock: PublicProfileReview = {
        id: deterministicReviewId,
        authorName: 'Ty (Testowy Użytkownik)', 
        authorAvatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        rating: requestBody.rating,
        publishedAtLabel: 'Przed chwilą',
        content: requestBody.content,
      };

      updatedReviews = [newReviewMock, ...profile.reviews];
      newReviewsCount = profile.reviewsCount + 1;
      newRating = (currentTotalScore + requestBody.rating) / newReviewsCount;

      publicProfiles.set(requestedUserId, {
        ...profile,
        reviewsCount: newReviewsCount,
        rating: newRating,
        reviews: updatedReviews,
      });

      return HttpResponse.json(newReviewMock, { status: 201 });
    }
  }),

 
  http.patch('/api/profile/me', async ({ request }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });

    const profile = myProfiles.get(userId);
    if (!profile) return HttpResponse.json({ message: 'not_found' }, { status: 404 });

    const body = await request.json() as { displayName?: string; bio?: string };
    
    const updatedProfile = {
      ...profile,
      ...body,
    };

    myProfiles.set(userId, updatedProfile);
    return HttpResponse.json(updatedProfile, { status: 200 });
  }),

  http.patch('/api/profile/me/approve', async ({ request }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });

    const profile = myProfiles.get(userId);
    if (!profile) return HttpResponse.json({ message: 'not_found' }, { status: 404 });

    const updatedProfile = {
      ...profile,
      isApproved: true,
    };

    myProfiles.set(userId, updatedProfile);
    return HttpResponse.json({ success: true, isApproved: true }, { status: 200 });
  })
];