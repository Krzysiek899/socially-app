import { z } from 'zod';

export const myProfileSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  badge: z.string().min(1),
  avatarUrl: z.string().url().optional(),
  bio: z.string().min(1),
  friendsCount: z.number().int().min(0),
  friends: z.array(
    z.object({
      id: z.string().min(1),
      displayName: z.string().min(1),
      avatarUrl: z.string().url().optional(),
    }),
  ),
  incomingRequests: z.array(
    z.object({
      id: z.string().min(1),
      displayName: z.string().min(1),
      avatarUrl: z.string().url().optional(),
    }),
  ),
  groupsCount: z.number().int().min(0),
  groups: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      iconKey: z.enum(['sport', 'book', 'tech']),
    }),
  ),
  isApproved: z.boolean().default(false),
});

export const friendMutationPayloadSchema = z.object({
  targetUserId: z.string().min(1),
});

export const friendMutationResponseSchema = z.object({
  ok: z.literal(true),
});

export const publicProfileReviewSchema = z.object({
  id: z.string().min(1),
  authorName: z.string().min(1),
  authorAvatarUrl: z.string().url().optional(),
  rating: z.number().min(0).max(5),
  publishedAtLabel: z.string().min(1),
  content: z.string(),
});

export const publicProfileMutualFriendSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  avatarUrl: z.string().url().optional(),
});

export const publicProfileGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  meta: z.string().min(1),
  iconKey: z.enum(['sport', 'book', 'tech']),
  membersCount: z.number().int().min(0),
});

export const publicProfileSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  badge: z.string().min(1),
  avatarUrl: z.string().url().optional(),
  bio: z.string().min(1),
  rating: z.number().min(0).max(5),
  reviewsCount: z.number().int().min(0),
  reviews: z.array(publicProfileReviewSchema),
  mutualFriends: z.array(publicProfileMutualFriendSchema),
  groups: z.array(publicProfileGroupSchema),
  friendAction: z.enum(['can_send_request', 'request_sent', 'respond_to_request', 'friends']),
});

export const createReviewRequestSchema = z.object({
  rating: z.number().int().min(1).max(5),
  content: z.string(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(2, 'Imię musi mieć co najmniej 2 znaki').optional(),
  bio: z.string().max(300, 'Opis jest za długi').optional(),
});

export type CreateReviewRequestDTO = z.infer<typeof createReviewRequestSchema>;
export type PublicProfileReviewDTO = z.infer<typeof publicProfileReviewSchema>;
export type PublicProfileDTO = z.infer<typeof publicProfileSchema>;
export type UpdateProfileRequestDTO = z.infer<typeof updateProfileSchema>;
