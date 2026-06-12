import { http, HttpResponse } from 'msw';
import { authSessionSchema, loginPayloadSchema, registerPayloadSchema } from '../../pages/auth/dto/authSchemas.ts';

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

const buildSession = (userId: string) => authSessionSchema.parse({
  token: `token-${userId}`,
  userId,
  expiresAt: '2099-01-01T00:00:00.000Z',
});

export const authHandlers = [
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
