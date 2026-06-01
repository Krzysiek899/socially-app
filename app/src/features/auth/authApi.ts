import { z } from 'zod';
import { authSessionSchema, type AuthSession } from './authSession.ts';

const loginPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const loginResponseSchema = authSessionSchema;

export const loginRequest = async (payload: {
  email: string;
  password: string;
}): Promise<AuthSession> => {
  const validatedPayload = loginPayloadSchema.parse(payload);

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validatedPayload),
  });

  if (!response.ok) {
    throw new Error('auth.login.invalid_credentials');
  }

  const responseBody = await response.json();
  return loginResponseSchema.parse(responseBody);
};
