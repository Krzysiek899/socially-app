import { z } from 'zod';

export const groupMemberPreviewSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  avatarUrl: z.string().url().optional(),
});

export const groupDetailsSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  membersCount: z.number().int().min(0),
  membersPreview: z.array(groupMemberPreviewSchema),
  isMember: z.boolean(),
});

export const groupMutationPayloadSchema = z.object({
  groupId: z.string().min(1),
});

export const groupMutationResponseSchema = z.object({
  ok: z.literal(true),
});
