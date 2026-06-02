import type { AuthSession } from '../domain/authSession.ts';
import {
  loginPayloadSchema,
  loginResponseSchema,
  registerPayloadSchema,
  registerResponseSchema,
} from '../dto/authSchemas.ts';

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
