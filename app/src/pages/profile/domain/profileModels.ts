export type MyProfileFriend = {
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
  groupsCount: number;
  groups: MyProfileGroup[];
};

export type PublicProfileStat = {
  label: string;
  value: string;
};

export type PublicProfileSectionItem = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  badge?: string;
};

export type PublicProfileSection = {
  id: string;
  title: string;
  description: string;
  emptyText: string;
  items: PublicProfileSectionItem[];
};

export type PublicProfile = {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl?: string;
  city: string;
  joinedAt: string;
  bio: string;
  badges: string[];
  interests: string[];
  stats: PublicProfileStat[];
  sections: PublicProfileSection[];
};
