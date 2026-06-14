export type MyProfileFriend = {
  id: string;
  displayName: string;
  avatarUrl?: string;
};

export type MyProfileIncomingRequest = {
  id: string;
  displayName: string;
  avatarUrl?: string;
};

export type MyProfileGroupIconKey = 'sport' | 'book' | 'tech';

export type MyProfileGroup = {
  id: string;
  name: string;
  iconKey: MyProfileGroupIconKey;
};

export type MyProfile = {
  id: string;
  displayName: string;
  badge: string;
  avatarUrl?: string;
  bio: string;
  friendsCount: number;
  friends: MyProfileFriend[];
  incomingRequests: MyProfileIncomingRequest[];
  groupsCount: number;
  groups: MyProfileGroup[];
  isApproved: boolean; 
};

export type PublicProfileReview = {
  id: string;
  authorName: string;
  authorAvatarUrl?: string;
  rating: number;
  publishedAtLabel: string;
  content: string;
};

export type PublicProfileMutualFriend = {
  id: string;
  displayName: string;
  avatarUrl?: string;
};

export type PublicProfileGroup = {
  id: string;
  name: string;
  meta: string;
};

export type PublicProfileFriendAction =
  | 'can_send_request'
  | 'request_sent'
  | 'respond_to_request'
  | 'friends';

export type PublicProfile = {
  id: string;
  displayName: string;
  badge: string;
  avatarUrl?: string;
  bio: string;
  rating: number;
  reviewsCount: number;
  reviews: PublicProfileReview[];
  mutualFriends: PublicProfileMutualFriend[];
  groups: PublicProfileGroup[];
  friendAction: PublicProfileFriendAction;
};