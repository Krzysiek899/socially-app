import { z } from 'zod';
import { discoverEventSchema } from '../../discover/dto/discoverSchemas.ts';
import { DISCOVER_CATEGORY_CODES } from '../../discover/domain/discoverModels.ts';

export const createEventPayloadSchema = z.object({
  title: z.string().trim().min(3).max(100),
  description: z.string().trim().min(10).max(1000),
  dateTime: z.string().datetime(),
  category: z.enum(DISCOVER_CATEGORY_CODES),
  address: z.object({
    city: z.string().trim().min(1),
    street: z.string().trim().min(1),
    buildingNumber: z.string().trim().min(1),
    postalCode: z.string().trim().min(1).optional(),
  }),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  price: z.object({
    amount: z.number().min(0),
    currency: z.literal('PLN'),
    isFree: z.boolean(),
  }),
}).superRefine((value, ctx) => {
  if (value.price.isFree && value.price.amount !== 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['price', 'amount'],
      message: 'price_amount_must_be_zero_for_free',
    });
  }

  if (!value.price.isFree && value.price.amount <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['price', 'amount'],
      message: 'price_amount_must_be_positive_for_paid',
    });
  }
});

export const createEventResponseSchema = discoverEventSchema;
export const authoredEventsResponseSchema = z.array(discoverEventSchema);

export const geocodeSearchPayloadSchema = z.object({
  query: z.string().trim().min(3),
});

export const geocodeSearchResponseSchema = z.object({
  results: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    location: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
    address: z.object({
      city: z.string().min(1),
      street: z.string().min(1),
      buildingNumber: z.string().min(1),
      postalCode: z.string().optional(),
    }),
  })),
});
