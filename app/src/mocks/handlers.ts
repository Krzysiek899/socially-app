import { http, HttpResponse } from 'msw';
import { z } from 'zod';

const loginPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerPayloadSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(1),
});

const loginResponseSchema = z.object({
  token: z.string().min(1),
  userId: z.string().min(1),
  expiresAt: z.string().datetime(),
});

type MockUser = {
  userId: string;
  fullName: string;
  email: string;
  password: string;
};

const userStore = new Map<string, MockUser>([
  [
    'user@socially.app',
    {
      userId: 'user-1',
      fullName: 'Socially User',
      email: 'user@socially.app',
      password: 'Password123!',
    },
  ],
]);

const deriveUserId = (email: string): string => {
  const safeLocalPart = email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `user-${safeLocalPart || 'new'}`;
};

const buildSession = (userId: string) => loginResponseSchema.parse({
  token: `token-${userId}`,
  userId,
  expiresAt: '2099-01-01T00:00:00.000Z',
});

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const payload = loginPayloadSchema.parse(await request.json());
    const user = userStore.get(payload.email.toLowerCase());

    if (!user || user.password !== payload.password) {
      return HttpResponse.json({ message: 'invalid_credentials' }, { status: 401 });
    }

    return HttpResponse.json(buildSession(user.userId), { status: 200 });
  }),
  http.post('/api/auth/register', async ({ request }) => {
    const payload = registerPayloadSchema.parse(await request.json());
    const normalizedEmail = payload.email.toLowerCase();

    if (normalizedEmail === 'user@socially.app' || userStore.has(normalizedEmail)) {
      return HttpResponse.json({ message: 'email_taken' }, { status: 409 });
    }

    const userId = deriveUserId(normalizedEmail);
    userStore.set(normalizedEmail, {
      userId,
      fullName: payload.fullName,
      email: normalizedEmail,
      password: payload.password,
    });

    return HttpResponse.json(buildSession(userId), { status: 201 });
  }),
];
