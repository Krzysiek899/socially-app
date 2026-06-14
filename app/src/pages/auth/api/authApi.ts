import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { firebaseAuth } from '../../../firebase/auth.ts';
import type { AuthSession } from '../domain/authSession.ts';
import {
  loginPayloadSchema,
  registerPayloadSchema,
} from '../dto/authSchemas.ts';

export const loginRequest = async (payload: {
  email: string;
  password: string;
  rememberMe: boolean;
}): Promise<AuthSession> => {
  const validatedPayload = loginPayloadSchema.parse(payload);
  await setPersistence(
    firebaseAuth,
    validatedPayload.rememberMe ? browserLocalPersistence : browserSessionPersistence,
  );

  try {
    const result = await signInWithEmailAndPassword(
      firebaseAuth,
      validatedPayload.email,
      validatedPayload.password,
    );

    return {
      token: await result.user.getIdToken(),
      userId: result.user.uid,
      expiresAt: new Date(
        result.user.stsTokenManager.expirationTime ?? Date.now() + 60 * 60 * 1000,
      ).toISOString(),
    };
  } catch {
    throw new Error('auth.login.invalid_credentials');
  }
};

export const registerRequest = async (payload: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthSession> => {
  const validatedPayload = registerPayloadSchema.parse(payload);
  await setPersistence(firebaseAuth, browserLocalPersistence);

  try {
    const result = await createUserWithEmailAndPassword(
      firebaseAuth,
      validatedPayload.email,
      validatedPayload.password,
    );

    await updateProfile(result.user, { displayName: validatedPayload.fullName });

    return {
      token: await result.user.getIdToken(),
      userId: result.user.uid,
      expiresAt: new Date(
        result.user.stsTokenManager.expirationTime ?? Date.now() + 60 * 60 * 1000,
      ).toISOString(),
    };
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      String(error.code) === 'auth/email-already-in-use'
    ) {
      throw new Error('auth.registration.email_taken');
    }

    throw new Error('auth.registration.submit_failed');
  }
};

export const logoutRequest = async (): Promise<void> => {
  await signOut(firebaseAuth);
};
