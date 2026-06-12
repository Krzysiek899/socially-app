import { z } from 'zod';

export const loginPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerPayloadSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(1),
});

export const authSessionSchema = z.object({
  token: z.string().min(1),
  userId: z.string().min(1),
  expiresAt: z.string().datetime(),
});

export const loginResponseSchema = authSessionSchema;
export const registerResponseSchema = authSessionSchema;
