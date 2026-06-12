import { z } from 'zod';

export const myProfileSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  badge: z.string().min(1),
  avatarUrl: z.string().url().optional(),
  bio: z.string().min(1),
  friendsCount: z.number().int().min(0),
  friends: z.array(z.object({
    id: z.string().min(1),
    displayName: z.string().min(1),
    avatarUrl: z.string().url().optional(),
  })),
  groupsCount: z.number().int().min(0),
  groups: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    iconKey: z.enum(['sport', 'book', 'tech']),
  })),
});

export const publicProfileStatSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

export const publicProfileSectionItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  meta: z.string().min(1),
  badge: z.string().min(1).optional(),
});

export const publicProfileSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  emptyText: z.string().min(1),
  items: z.array(publicProfileSectionItemSchema),
});

export const publicProfileSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  handle: z.string().min(1),
  avatarUrl: z.string().url().optional(),
  city: z.string().min(1),
  joinedAt: z.string().datetime(),
  bio: z.string().min(1),
  badges: z.array(z.string().min(1)),
  interests: z.array(z.string().min(1)),
  stats: z.array(publicProfileStatSchema).min(1),
  sections: z.array(publicProfileSectionSchema).min(1),
});
