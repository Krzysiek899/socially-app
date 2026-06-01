import { http, HttpResponse } from 'msw';
import { z } from 'zod';

const loginPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const loginResponseSchema = z.object({
  token: z.string().min(1),
  userId: z.string().min(1),
  expiresAt: z.string().datetime(),
});

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const payload = loginPayloadSchema.parse(await request.json());

    if (payload.email !== 'user@socially.app' || payload.password !== 'Password123!') {
      return HttpResponse.json({ message: 'invalid_credentials' }, { status: 401 });
    }

    const responsePayload = loginResponseSchema.parse({
      token: 'token-123',
      userId: 'user-1',
      expiresAt: '2099-01-01T00:00:00.000Z',
    });

    return HttpResponse.json(responsePayload, { status: 200 });
  }),
];
