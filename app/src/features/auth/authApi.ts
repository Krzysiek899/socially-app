import { z } from 'zod';
import { authSessionSchema, type AuthSession } from './authSession.ts';

const loginPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerPayloadSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(1),
});

const loginResponseSchema = authSessionSchema;
const registerResponseSchema = authSessionSchema;

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

export const registerRequest = async (payload: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthSession> => {
  const validatedPayload = registerPayloadSchema.parse(payload);

  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validatedPayload),
  });

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('auth.registration.email_taken');
    }

    throw new Error('auth.registration.submit_failed');
  }

  const responseBody = await response.json();
  return registerResponseSchema.parse(responseBody);
};
