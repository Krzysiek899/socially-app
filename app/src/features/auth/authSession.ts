import { z } from 'zod';

export const AUTH_SESSION_STORAGE_KEY = 'auth.session.v1';

export const authSessionSchema = z.object({
  token: z.string().min(1),
  userId: z.string().min(1),
  expiresAt: z.string().datetime(),
});

export type AuthSession = z.infer<typeof authSessionSchema>;

export const loadAuthSession = (): AuthSession | null => {
  const stored = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  const parsed = authSessionSchema.safeParse(JSON.parse(stored));
  if (!parsed.success) {
    localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return null;
  }

  return parsed.data;
};

export const saveAuthSession = (session: AuthSession | null): void => {
  if (!session) {
    localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return;
  }

  localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
};
