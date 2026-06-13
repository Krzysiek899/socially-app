import type {
  DiscoverCategoryCode,
  DiscoverEvent,
  DiscoverEventAttendee,
} from '../../discover/domain/discoverModels.ts';

export const JOIN_VISIBILITY_OPTIONS = ['FRIENDS', 'GROUP', 'PUBLIC'] as const;
export type JoinVisibility = (typeof JOIN_VISIBILITY_OPTIONS)[number];

export type JoinRequest = {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  requestedAt: string;
};

export type AuthoredEvent = DiscoverEvent & {
  management: {
    isActive: boolean;
    capacity: number | null;
    joinRules: {
      visibility: JoinVisibility;
      approvalRequired: boolean;
    };
    participants: DiscoverEventAttendee[];
    joinRequests: JoinRequest[];
  };
};

export type CreateEventPayload = {
  title: string;
  description: string;
  dateTime: string;
  category: DiscoverCategoryCode;
  address: {
    city: string;
    street: string;
    buildingNumber: string;
    postalCode?: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  price: {
    amount: number;
    currency: 'PLN';
    isFree: boolean;
  };
  capacity: number | null;
};

export type GeocodeResult = {
  id: string;
  label: string;
  location: {
    lat: number;
    lng: number;
  };
  address: {
    city: string;
    street: string;
    buildingNumber: string;
    postalCode?: string;
  };
};

export type UpdateAuthoredEventPayload = {
  title: string;
  description: string;
  dateTime: string;
  address: {
    city: string;
    street: string;
    buildingNumber: string;
    postalCode?: string;
  };
  price: {
    amount: number;
    currency: 'PLN';
    isFree: boolean;
  };
  capacity: number | null;
};

export type UpdateJoinRulesPayload = {
  visibility: JoinVisibility;
  approvalRequired: boolean;
};

export type JoinRequestAction = 'approve' | 'reject';

export type HandleJoinRequestPayload = {
  action: JoinRequestAction;
};

export type ParticipationState = 'joined' | 'pending';

export type ParticipatingEvent = DiscoverEvent & {
  participation: {
    state: ParticipationState;
  };
};
