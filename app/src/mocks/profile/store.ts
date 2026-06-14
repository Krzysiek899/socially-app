import { groupDetailsSchema } from '../../pages/groups/dto/groupSchemas.ts';
import { myProfileSchema, publicProfileSchema } from '../../pages/profile/dto/profileSchemas.ts';

type UserDirectoryEntry = {
  id: string;
  displayName: string;
  avatarUrl?: string;
};

type GroupDirectoryEntry = {
  id: string;
  name: string;
  description: string;
  meta: string;
  iconKey: 'sport' | 'book' | 'tech';
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
};

type MyProfileBase = {
  id: string;
  displayName: string;
  badge: string;
  avatarUrl?: string;
  bio: string;
  isApproved: boolean;
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
  [
    'org-kasia',
    {
      id: 'org-kasia',
      displayName: 'Kasia Mazur',
      avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=160&q=80',
    },
  ],
  [
    'friend-julia',
    {
      id: 'friend-julia',
      displayName: 'Julia Krawiec',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
    },
  ],
  [
    'friend-emilia',
    {
      id: 'friend-emilia',
      displayName: 'Emilia Zawadzka',
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80',
    },
  ],
]);

const groupDirectory = new Map<string, GroupDirectoryEntry>([
  [
    'group-1',
    {
      id: 'group-1',
      name: 'Biegacze Powiśle',
      description: 'Spotkania biegowe nad Wisłą dla osób na każdym poziomie.',
      meta: 'Aktywność outdoor',
      iconKey: 'sport',
    },
  ],
  [
    'group-2',
    {
      id: 'group-2',
      name: 'Klub Czytelniczy',
      description: 'Cotygodniowe dyskusje o książkach i wymiana rekomendacji.',
      meta: 'Spotkania tematyczne',
      iconKey: 'book',
    },
  ],
  [
    'group-3',
    {
      id: 'group-3',
      name: 'Tech Meetup WAW',
      description: 'Społeczność meetupów technologicznych i krótkich prelekcji.',
      meta: 'Społeczność technologiczna',
      iconKey: 'tech',
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
      isApproved: false,
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
    },
  ],
  [
    'friend-pawel',
    {
      id: 'friend-pawel',
      displayName: 'Paweł Nowak',
      badge: 'Lider aktywności',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      bio: 'Organizuję sportowe spotkania po pracy i pomagam nowym osobom szybko wejść do grupy.',
      rating: 4.9,
      reviewsCount: 17,
      reviews: [
        {
          id: 'review-1',
          authorName: 'Ewelina M.',
          rating: 5,
          publishedAtLabel: 'Wczoraj',
          content: 'Bardzo pozytywna energia i super kontakt przed wydarzeniem.',
        },
        {
          id: 'review-2',
          authorName: 'Tomek B.',
          rating: 5,
          publishedAtLabel: '3 dni temu',
          content: 'Świetna organizacja drużyn i dbanie o każdego uczestnika.',
        },
        {
          id: 'review-3',
          authorName: 'Karol P.',
          rating: 4,
          publishedAtLabel: 'Tydzień temu',
          content: 'Wydarzenie dobrze przygotowane, jasna komunikacja zasad.',
        },
      ],
    },
  ],
  [
    'org-kasia',
    {
      id: 'org-kasia',
      displayName: 'Kasia Mazur',
      badge: 'Ambasadorka społeczności',
      avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=160&q=80',
      bio: 'Prowadzę lokalne aktywności sportowe i wydarzenia integracyjne dla nowych osób.',
      rating: 4.6,
      reviewsCount: 12,
      reviews: [
        {
          id: 'review-1',
          authorName: 'Michał R.',
          rating: 5,
          publishedAtLabel: '2 dni temu',
          content: 'Świetna atmosfera i bardzo konkretna organizacja.',
        },
        {
          id: 'review-2',
          authorName: 'Iga N.',
          rating: 4,
          publishedAtLabel: '6 dni temu',
          content: 'Wydarzenia punktualne i przyjazne dla początkujących.',
        },
      ],
    },
  ],
]);

const relationPairKey = (left: string, right: string): string => [left, right].sort().join('::');
const relationRequestKey = (fromUserId: string, toUserId: string): string => `${fromUserId}->${toUserId}`;

const initialFriendships = new Set<string>([
  relationPairKey('user-1', 'org-dawid'),
  relationPairKey('user-1', 'org-kasia'),
  relationPairKey('user-1', 'friend-emilia'),
  relationPairKey('org-dawid', 'org-anna'),
  relationPairKey('org-dawid', 'friend-pawel'),
  relationPairKey('org-anna', 'friend-pawel'),
]);

const initialPendingRequests = new Set<string>([
  relationRequestKey('org-anna', 'user-1'),
  relationRequestKey('friend-julia', 'user-1'),
  relationRequestKey('user-1', 'friend-pawel'),
]);

const groupMembershipKey = (userId: string, groupId: string): string => `${userId}::${groupId}`;

const initialGroupMemberships = new Set<string>([
  groupMembershipKey('user-1', 'group-1'),
  groupMembershipKey('user-1', 'group-2'),
  groupMembershipKey('user-1', 'group-3'),
  groupMembershipKey('org-anna', 'group-1'),
  groupMembershipKey('org-anna', 'group-2'),
  groupMembershipKey('org-dawid', 'group-3'),
  groupMembershipKey('org-kasia', 'group-1'),
  groupMembershipKey('friend-pawel', 'group-3'),
  groupMembershipKey('friend-emilia', 'group-2'),
]);

let friendships = new Set(initialFriendships);
let pendingRequests = new Set(initialPendingRequests);
let groupMemberships = new Set(initialGroupMemberships);

const toDisplayNameFromUserId = (userId: string): string => {
  const normalized = userId
    .replace(/[_\-]+/g, ' ')
    .trim();

  if (normalized.length === 0) {
    return 'Nowy użytkownik';
  }

  return normalized
    .split(/\s+/)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
};

const ensureMockProfileSeedForUser = (userId: string, preferredDisplayName?: string): void => {
  const normalizedPreferredDisplayName = preferredDisplayName?.trim();

  if (!userDirectory.has(userId)) {
    userDirectory.set(userId, {
      id: userId,
      displayName: normalizedPreferredDisplayName && normalizedPreferredDisplayName.length > 0
        ? normalizedPreferredDisplayName
        : toDisplayNameFromUserId(userId),
    });
  } else if (normalizedPreferredDisplayName && normalizedPreferredDisplayName.length > 0) {
    const existingDirectoryEntry = userDirectory.get(userId);
    if (existingDirectoryEntry) {
      userDirectory.set(userId, {
        ...existingDirectoryEntry,
        displayName: normalizedPreferredDisplayName,
      });
    }
  }

  const directoryEntry = userDirectory.get(userId);
  if (!directoryEntry) {
    return;
  }

  if (!myProfileBaseByUserId.has(userId)) {
    myProfileBaseByUserId.set(userId, {
      id: userId,
      displayName: directoryEntry.displayName,
      avatarUrl: directoryEntry.avatarUrl,
      badge: 'Nowy użytkownik',
      bio: 'Ten profil został utworzony automatycznie dla nowego konta Firebase.',
      isApproved: false,
    });
  } else if (normalizedPreferredDisplayName && normalizedPreferredDisplayName.length > 0) {
    const existingMyProfile = myProfileBaseByUserId.get(userId);
    if (existingMyProfile) {
      myProfileBaseByUserId.set(userId, {
        ...existingMyProfile,
        displayName: normalizedPreferredDisplayName,
      });
    }
  }

  if (!publicProfileBaseByUserId.has(userId)) {
    publicProfileBaseByUserId.set(userId, {
      id: userId,
      displayName: directoryEntry.displayName,
      avatarUrl: directoryEntry.avatarUrl,
      badge: 'Nowy użytkownik',
      bio: 'Nowy użytkownik Socially.',
      rating: 0,
      reviewsCount: 0,
      reviews: [],
    });
  } else if (normalizedPreferredDisplayName && normalizedPreferredDisplayName.length > 0) {
    const existingPublicProfile = publicProfileBaseByUserId.get(userId);
    if (existingPublicProfile) {
      publicProfileBaseByUserId.set(userId, {
        ...existingPublicProfile,
        displayName: normalizedPreferredDisplayName,
      });
    }
  }
};

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

const getGroupIdsForUser = (userId: string): string[] =>
  Array.from(groupMemberships)
    .map((membershipKey) => membershipKey.split('::'))
    .filter(([memberId]) => memberId === userId)
    .map(([, groupId]) => groupId);

const getGroupMembersCount = (groupId: string): number =>
  Array.from(groupMemberships)
    .map((membershipKey) => membershipKey.split('::'))
    .filter(([, memberGroupId]) => memberGroupId === groupId)
    .length;

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

export const getMyProfileForUser = (userId: string, preferredDisplayName?: string) => {
  ensureMockProfileSeedForUser(userId, preferredDisplayName);
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

  const groups = getGroupIdsForUser(userId)
    .map((groupId) => groupDirectory.get(groupId))
    .filter((entry): entry is GroupDirectoryEntry => Boolean(entry))
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      iconKey: entry.iconKey,
      membersCount: getGroupMembersCount(entry.id),
    }));

  return myProfileSchema.parse({
    ...base,
    friendsCount: friends.length,
    friends,
    incomingRequests,
    groupsCount: groups.length,
    groups,
  });
};

export const getPublicProfileForUser = (
  viewerUserId: string,
  targetUserId: string,
  preferredDisplayName?: string,
) => {
  ensureMockProfileSeedForUser(viewerUserId, preferredDisplayName);
  ensureMockProfileSeedForUser(targetUserId);
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

  const groups = getGroupIdsForUser(targetUserId)
    .map((groupId) => groupDirectory.get(groupId))
    .filter((entry): entry is GroupDirectoryEntry => Boolean(entry))
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      meta: entry.meta,
      iconKey: entry.iconKey,
      membersCount: getGroupMembersCount(entry.id),
    }));

  return publicProfileSchema.parse({
    ...base,
    groups,
    mutualFriends,
    friendAction: toPublicFriendAction(relationState(viewerUserId, targetUserId)),
  });
};

export const getGroupDetailsForUser = (viewerUserId: string, groupId: string) => {
  const group = groupDirectory.get(groupId);
  if (!group || !hasKnownUser(viewerUserId)) {
    return null;
  }

  const membersPreview = Array.from(groupMemberships)
    .map((membershipKey) => membershipKey.split('::'))
    .filter(([, memberGroupId]) => memberGroupId === groupId)
    .map(([memberUserId]) => userDirectory.get(memberUserId))
    .filter((entry): entry is UserDirectoryEntry => Boolean(entry))
    .map((entry) => ({
      id: entry.id,
      displayName: entry.displayName,
      avatarUrl: entry.avatarUrl,
    }));

  return groupDetailsSchema.parse({
    id: group.id,
    name: group.name,
    description: group.description,
    membersCount: membersPreview.length,
    membersPreview,
    isMember: groupMemberships.has(groupMembershipKey(viewerUserId, groupId)),
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

export const joinGroup = (viewerUserId: string, groupId: string): MutationResult => {
  if (!hasKnownUser(viewerUserId) || !groupDirectory.has(groupId)) {
    return { type: 'not_found' };
  }

  const membershipKey = groupMembershipKey(viewerUserId, groupId);
  if (groupMemberships.has(membershipKey)) {
    return { type: 'conflict' };
  }

  groupMemberships.add(membershipKey);
  return { type: 'ok' };
};

export const leaveGroup = (viewerUserId: string, groupId: string): MutationResult => {
  if (!hasKnownUser(viewerUserId) || !groupDirectory.has(groupId)) {
    return { type: 'not_found' };
  }

  const membershipKey = groupMembershipKey(viewerUserId, groupId);
  if (!groupMemberships.has(membershipKey)) {
    return { type: 'conflict' };
  }

  groupMemberships.delete(membershipKey);
  return { type: 'ok' };
};

export const submitReview = (
  reviewerId: string,
  targetUserId: string,
  rating: number,
  content: string,
): MutationResult | { type: 'ok'; review: any } => {
  if (!hasKnownUser(reviewerId) || !hasKnownUser(targetUserId)) {
    return { type: 'not_found' };
  }

  const targetProfile = publicProfileBaseByUserId.get(targetUserId);
  if (!targetProfile) {
    return { type: 'not_found' };
  }

  const reviewerData = userDirectory.get(reviewerId);
  if (!reviewerData) {
    return { type: 'not_found' };
  }

  const deterministicReviewId = `review-from-${reviewerId}`;
  const existingReviewIndex = targetProfile.reviews.findIndex((r) => r.id === deterministicReviewId);

  const updatedReviews = [...targetProfile.reviews];
  let newReviewsCount = targetProfile.reviewsCount;
  let newRating = targetProfile.rating;

  const currentTotalScore = targetProfile.rating * targetProfile.reviewsCount;

  if (existingReviewIndex !== -1) {
    const oldReview = targetProfile.reviews[existingReviewIndex];
    newRating = (currentTotalScore - oldReview.rating + rating) / targetProfile.reviewsCount;

    updatedReviews[existingReviewIndex] = {
      ...oldReview,
      rating,
      content,
      publishedAtLabel: 'Aktualizowano przed chwilą',
    };
  } else {
    const newReview = {
      id: deterministicReviewId,
      authorName: reviewerData.displayName,
      authorAvatarUrl: reviewerData.avatarUrl,
      rating,
      publishedAtLabel: 'Przed chwilą',
      content,
    };

    updatedReviews.unshift(newReview);
    newReviewsCount = targetProfile.reviewsCount + 1;
    newRating = (currentTotalScore + rating) / newReviewsCount;
  }

  publicProfileBaseByUserId.set(targetUserId, {
    ...targetProfile,
    reviewsCount: newReviewsCount,
    rating: newRating,
    reviews: updatedReviews,
  });

  return {
    type: 'ok',
    review: existingReviewIndex !== -1 ? updatedReviews[existingReviewIndex] : updatedReviews[0],
  };
};

export const updateMyProfileForUser = (
  userId: string,
  payload: { displayName?: string; bio?: string },
) => {
  if (!hasKnownUser(userId)) {
    return null;
  }

  const base = myProfileBaseByUserId.get(userId);
  if (!base) {
    return null;
  }

  const nextDisplayName = payload.displayName?.trim();
  const nextBio = payload.bio?.trim();

  const updatedBase: MyProfileBase = {
    ...base,
    ...(nextDisplayName && nextDisplayName.length > 0 ? { displayName: nextDisplayName } : {}),
    ...(typeof nextBio === 'string' ? { bio: nextBio } : {}),
  };

  myProfileBaseByUserId.set(userId, updatedBase);

  const directoryEntry = userDirectory.get(userId);
  if (directoryEntry && nextDisplayName && nextDisplayName.length > 0) {
    userDirectory.set(userId, {
      ...directoryEntry,
      displayName: nextDisplayName,
    });
  }

  const publicBase = publicProfileBaseByUserId.get(userId);
  if (publicBase) {
    publicProfileBaseByUserId.set(userId, {
      ...publicBase,
      ...(nextDisplayName && nextDisplayName.length > 0 ? { displayName: nextDisplayName } : {}),
      ...(typeof nextBio === 'string' ? { bio: nextBio } : {}),
    });
  }

  return getMyProfileForUser(userId, updatedBase.displayName);
};

export const approveMyProfileForUser = (userId: string) => {
  if (!hasKnownUser(userId)) {
    return null;
  }

  const base = myProfileBaseByUserId.get(userId);
  if (!base) {
    return null;
  }

  myProfileBaseByUserId.set(userId, {
    ...base,
    isApproved: true,
  });

  return getMyProfileForUser(userId);
};

export const resetProfileStore = (): void => {
  friendships = new Set(initialFriendships);
  pendingRequests = new Set(initialPendingRequests);
  groupMemberships = new Set(initialGroupMemberships);
};
