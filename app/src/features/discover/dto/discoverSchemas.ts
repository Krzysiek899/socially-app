import { z } from 'zod';
import { DISCOVER_CATEGORY_CODES } from '../domain/discoverModels.ts';

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
