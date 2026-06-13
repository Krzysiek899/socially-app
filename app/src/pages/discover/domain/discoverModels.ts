export const DISCOVER_CATEGORY_CODES = [
  'MUSIC',
  'SPORT',
  'TECH',
  'ART',
  'FOOD',
  'OUTDOOR',
  'COMMUNITY',
] as const;

export type DiscoverCategoryCode = (typeof DISCOVER_CATEGORY_CODES)[number];
export type DiscoverPriceFilter = 'all' | 'free' | 'paid';

export type DiscoverEventAttendee = {
  id: string;
  displayName: string;
  avatarUrl?: string;
};

export type DiscoverEvent = {
  id: string;
  title: string;
  dateTime: string;
  price: {
    amount: number;
    currency: 'PLN' | 'EUR';
    isFree: boolean;
  };
  description: string;
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
  organizer: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  attendees: DiscoverEventAttendee[];
  attendeesCount: number;
  photoUrl?: string;
  category: DiscoverCategoryCode;
  participation?: {
    state: 'joined' | 'pending';
  };
};

export type DiscoverFilters = {
  searchQuery: string;
  categories: DiscoverCategoryCode[];
  price: DiscoverPriceFilter;
  dateFrom: string;
  dateTo: string;
};
