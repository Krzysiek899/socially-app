import { myProfileSchema, publicProfileSchema } from '../../pages/profile/dto/profileSchemas.ts';

type UserDirectoryEntry = {
  id: string;
  displayName: string;
  avatarUrl?: string;
};

type PublicProfileBase = {
  id: string;
  displayName: string;
  badge: string;
  avatarUrl?: string;
  bio: string;
  rating: number;
  reviewsCount: number;
  reviews: Array<{
    id: string;
    authorName: string;
    authorAvatarUrl?: string;
    rating: number;
    publishedAtLabel: string;
    content: string;
  }>;
  groups: Array<{
    id: string;
    name: string;
    meta: string;
  }>;
};

type MyProfileBase = {
  id: string;
  displayName: string;
  badge: string;
  avatarUrl?: string;
  bio: string;
  groups: Array<{
    id: string;
    name: string;
    iconKey: 'sport' | 'book' | 'tech';
  }>;
};

type MutationResult = { type: 'ok' } | { type: 'not_found' } | { type: 'conflict' };

const userDirectory = new Map<string, UserDirectoryEntry>([
  [
    'user-1',
    {
      id: 'user-1',
      displayName: 'Jan Kowalski',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    },
  ],
  [
    'org-anna',
    {
      id: 'org-anna',
      displayName: 'Anna Wójcik',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    },
  ],
  [
    'org-dawid',
    {
      id: 'org-dawid',
      displayName: 'Dawid Cieślak',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
    },
  ],
  [
    'friend-pawel',
    {
      id: 'friend-pawel',
      displayName: 'Paweł Nowak',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    },
  ],
]);

const myProfileBaseByUserId = new Map<string, MyProfileBase>([
  [
    'user-1',
    {
      id: 'user-1',
      displayName: 'Jan Kowalski',
      badge: 'Świetny organizator',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      bio: 'Pasjonat lokalnych inicjatyw i sportów zespołowych. Od 5 lat organizuję weekendowe turnieje piłki nożnej oraz wspólne wyjścia do kina. Zawsze dbam o to, by nikt nie czuł się wykluczony.',
      groups: [
        { id: 'group-1', name: 'Biegacze Powiśle', iconKey: 'sport' },
        { id: 'group-2', name: 'Klub Czytelniczy', iconKey: 'book' },
        { id: 'group-3', name: 'Tech Meetup WAW', iconKey: 'tech' },
      ],
    },
  ],
]);

const publicProfileBaseByUserId = new Map<string, PublicProfileBase>([
  [
    'org-anna',
    {
      id: 'org-anna',
      displayName: 'Anna Wójcik',
      badge: 'Świetny organizator',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
      bio: 'Organizuję kameralne wydarzenia muzyczne i dbam o to, żeby nowym osobom łatwo było wejść do społeczności.',
      rating: 4.8,
      reviewsCount: 34,
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
      groups: [
        { id: 'group-1', name: 'Jazz Kraków', meta: '5 wspólnych wydarzeń' },
        { id: 'group-2', name: 'Muzyka na żywo', meta: '2 wspólnych znajomych' },
      ],
    },
  ],
  [
    'org-dawid',
    {
      id: 'org-dawid',
      displayName: 'Dawid Cieślak',
      badge: 'Mentor społeczności',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
      bio: 'Łączę ludzi z branży frontendowej wokół meetupów i krótkich formatów wiedzy.',
      rating: 4.7,
      reviewsCount: 21,
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
      groups: [{ id: 'group-1', name: 'Frontend Warsaw', meta: '3 wspólne wydarzenia' }],
    },
  ],
]);

const relationPairKey = (left: string, right: string): string => [left, right].sort().join('::');
const relationRequestKey = (fromUserId: string, toUserId: string): string => `${fromUserId}->${toUserId}`;

const initialFriendships = new Set<string>([
  relationPairKey('user-1', 'org-dawid'),
  relationPairKey('org-dawid', 'org-anna'),
  relationPairKey('org-anna', 'friend-pawel'),
]);

const initialPendingRequests = new Set<string>([
  relationRequestKey('org-anna', 'user-1'),
]);

let friendships = new Set(initialFriendships);
let pendingRequests = new Set(initialPendingRequests);

const getFriendIds = (userId: string): Set<string> => {
  const friends = new Set<string>();

  friendships.forEach((relationKey) => {
    const [left, right] = relationKey.split('::');
    if (left === userId) {
      friends.add(right);
    }
    if (right === userId) {
      friends.add(left);
    }
  });

  return friends;
};

const relationState = (viewerUserId: string, targetUserId: string): 'none' | 'outgoing_pending' | 'incoming_pending' | 'friends' => {
  if (friendships.has(relationPairKey(viewerUserId, targetUserId))) {
    return 'friends';
  }

  if (pendingRequests.has(relationRequestKey(viewerUserId, targetUserId))) {
    return 'outgoing_pending';
  }

  if (pendingRequests.has(relationRequestKey(targetUserId, viewerUserId))) {
    return 'incoming_pending';
  }

  return 'none';
};

const hasKnownUser = (userId: string): boolean =>
  userDirectory.has(userId)
  && (myProfileBaseByUserId.has(userId) || publicProfileBaseByUserId.has(userId));

const toPublicFriendAction = (state: ReturnType<typeof relationState>) => {
  if (state === 'outgoing_pending') {
    return 'request_sent' as const;
  }
  if (state === 'incoming_pending') {
    return 'respond_to_request' as const;
  }
  if (state === 'friends') {
    return 'friends' as const;
  }
  return 'can_send_request' as const;
};

export const getMyProfileForUser = (userId: string) => {
  const base = myProfileBaseByUserId.get(userId);
  if (!base) {
    return null;
  }

  const friends = Array.from(getFriendIds(userId))
    .map((friendId) => userDirectory.get(friendId))
    .filter((entry): entry is UserDirectoryEntry => Boolean(entry))
    .map((entry) => ({
      id: entry.id,
      displayName: entry.displayName,
      avatarUrl: entry.avatarUrl,
    }));

  const incomingRequests = Array.from(pendingRequests)
    .map((requestKey) => requestKey.split('->'))
    .filter(([, toUserId]) => toUserId === userId)
    .map(([fromUserId]) => userDirectory.get(fromUserId))
    .filter((entry): entry is UserDirectoryEntry => Boolean(entry))
    .map((entry) => ({
      id: entry.id,
      displayName: entry.displayName,
      avatarUrl: entry.avatarUrl,
    }));

  return myProfileSchema.parse({
    ...base,
    friendsCount: friends.length,
    friends,
    incomingRequests,
    groupsCount: base.groups.length,
  });
};

export const getPublicProfileForUser = (viewerUserId: string, targetUserId: string) => {
  const base = publicProfileBaseByUserId.get(targetUserId);
  if (!base || !hasKnownUser(viewerUserId)) {
    return null;
  }

  const viewerFriendIds = getFriendIds(viewerUserId);
  const targetFriendIds = getFriendIds(targetUserId);
  const mutualFriendIds = Array.from(viewerFriendIds).filter((friendId) => targetFriendIds.has(friendId));

  const mutualFriends = mutualFriendIds
    .map((friendId) => userDirectory.get(friendId))
    .filter((entry): entry is UserDirectoryEntry => Boolean(entry))
    .map((entry) => ({
      id: entry.id,
      displayName: entry.displayName,
      avatarUrl: entry.avatarUrl,
    }));

  return publicProfileSchema.parse({
    ...base,
    mutualFriends,
    friendAction: toPublicFriendAction(relationState(viewerUserId, targetUserId)),
  });
};

export const sendFriendRequest = (fromUserId: string, toUserId: string): MutationResult => {
  if (!hasKnownUser(fromUserId) || !hasKnownUser(toUserId)) {
    return { type: 'not_found' };
  }

  if (fromUserId === toUserId || relationState(fromUserId, toUserId) !== 'none') {
    return { type: 'conflict' };
  }

  pendingRequests.add(relationRequestKey(fromUserId, toUserId));
  return { type: 'ok' };
};

export const acceptFriendRequest = (currentUserId: string, requesterUserId: string): MutationResult => {
  if (!hasKnownUser(currentUserId) || !hasKnownUser(requesterUserId)) {
    return { type: 'not_found' };
  }

  const requestKey = relationRequestKey(requesterUserId, currentUserId);
  if (!pendingRequests.has(requestKey)) {
    return { type: 'conflict' };
  }

  pendingRequests.delete(requestKey);
  friendships.add(relationPairKey(currentUserId, requesterUserId));
  return { type: 'ok' };
};

export const rejectFriendRequest = (currentUserId: string, requesterUserId: string): MutationResult => {
  if (!hasKnownUser(currentUserId) || !hasKnownUser(requesterUserId)) {
    return { type: 'not_found' };
  }

  const requestKey = relationRequestKey(requesterUserId, currentUserId);
  if (!pendingRequests.has(requestKey)) {
    return { type: 'conflict' };
  }

  pendingRequests.delete(requestKey);
  return { type: 'ok' };
};

export const unfriendUsers = (currentUserId: string, targetUserId: string): MutationResult => {
  if (!hasKnownUser(currentUserId) || !hasKnownUser(targetUserId)) {
    return { type: 'not_found' };
  }

  const friendKey = relationPairKey(currentUserId, targetUserId);
  if (!friendships.has(friendKey)) {
    return { type: 'conflict' };
  }

  friendships.delete(friendKey);
  return { type: 'ok' };
};

export const resetProfileStore = (): void => {
  friendships = new Set(initialFriendships);
  pendingRequests = new Set(initialPendingRequests);
};
