import { z } from 'zod';

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
};

export type DiscoverFilters = {
  searchQuery: string;
  categories: DiscoverCategoryCode[];
  price: DiscoverPriceFilter;
  dateFrom: string;
  dateTo: string;
};

const discoverCategorySchema = z.enum(DISCOVER_CATEGORY_CODES);

export const discoverAttendeeSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  avatarUrl: z.string().url().optional(),
});

export const discoverEventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  dateTime: z.string().datetime(),
  price: z.object({
    amount: z.number().min(0),
    currency: z.enum(['PLN', 'EUR']),
    isFree: z.boolean(),
  }),
  description: z.string().min(1),
  address: z.object({
    city: z.string().min(1),
    street: z.string().min(1),
    buildingNumber: z.string().min(1),
    postalCode: z.string().min(1).optional(),
  }),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  organizer: z.object({
    id: z.string().min(1),
    displayName: z.string().min(1),
    avatarUrl: z.string().url().optional(),
  }),
  attendees: z.array(discoverAttendeeSchema),
  attendeesCount: z.number().int().min(0),
  photoUrl: z.string().url().optional(),
  category: discoverCategorySchema,
});

export const discoverEventsResponseSchema = z.array(discoverEventSchema);
