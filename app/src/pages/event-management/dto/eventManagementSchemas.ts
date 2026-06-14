import { z } from 'zod';
import { discoverEventSchema } from '../../discover/dto/discoverSchemas.ts';
import { DISCOVER_CATEGORY_CODES } from '../../discover/domain/discoverModels.ts';
import {
  JOIN_VISIBILITY_OPTIONS,
} from '../domain/eventManagementModels.ts';

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
  capacity: z.number().int().min(1).nullable(),
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

const joinRequestSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  displayName: z.string().min(1),
  avatarUrl: z.string().url().optional(),
  requestedAt: z.string().datetime(),
});

const authoredEventManagementSchema = z.object({
  isActive: z.boolean(),
  capacity: z.number().int().min(1).nullable(),
  joinRules: z.object({
    visibility: z.enum(JOIN_VISIBILITY_OPTIONS),
    approvalRequired: z.boolean(),
  }),
  participants: z.array(z.object({
    id: z.string().min(1),
    displayName: z.string().min(1),
    avatarUrl: z.string().url().optional(),
  })),
  joinRequests: z.array(joinRequestSchema),
});

export const authoredEventSchema = discoverEventSchema.extend({
  management: authoredEventManagementSchema,
});

export const createEventResponseSchema = authoredEventSchema;
export const authoredEventsResponseSchema = z.array(authoredEventSchema);
export const authoredEventResponseSchema = authoredEventSchema;
export const participatingEventSchema = discoverEventSchema.extend({
  participation: z.object({
    state: z.enum(['joined', 'pending']),
  }),
});
export const participatingEventsResponseSchema = z.array(participatingEventSchema);
export const joinEventResponseSchema = z.object({
  state: z.enum(['joined', 'pending']),
});
export const leaveEventResponseSchema = z.object({
  ok: z.literal(true),
});

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

export const reverseGeocodePayloadSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const reverseGeocodeResponseSchema = z.object({
  result: z.object({
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
  }),
});

export const updateAuthoredEventPayloadSchema = z.object({
  title: z.string().trim().min(3).max(100),
  description: z.string().trim().min(10).max(1000),
  dateTime: z.string().datetime(),
  address: z.object({
    city: z.string().trim().min(1),
    street: z.string().trim().min(1),
    buildingNumber: z.string().trim().min(1),
    postalCode: z.string().trim().min(1).optional(),
  }),
  price: z.object({
    amount: z.number().min(0),
    currency: z.literal('PLN'),
    isFree: z.boolean(),
  }),
  capacity: z.number().int().min(1).nullable(),
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

export const updateJoinRulesPayloadSchema = z.object({
  visibility: z.enum(JOIN_VISIBILITY_OPTIONS),
  approvalRequired: z.boolean(),
});

export const handleJoinRequestPayloadSchema = z.object({
  action: z.enum(['approve', 'reject']),
});
