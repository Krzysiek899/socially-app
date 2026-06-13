export type GroupMemberPreview = {
  id: string;
  displayName: string;
  avatarUrl?: string;
};

export type GroupDetails = {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  membersPreview: GroupMemberPreview[];
  isMember: boolean;
};
