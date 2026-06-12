import { z } from 'zod';
import { authSessionSchema } from '../dto/authSchemas.ts';

export const AUTH_SESSION_STORAGE_KEY = 'auth.session.v1';
export const AUTH_SESSION_PREFERENCE_STORAGE_KEY = 'auth.session.preference.v1';

export type SessionPersistencePreference = 'persistent' | 'session';

const SESSION_PREFERENCES: ReadonlyArray<SessionPersistencePreference> = ['persistent', 'session'];

export type AuthSession = z.infer<typeof authSessionSchema>;

const readSessionFrom = (storage: Storage): AuthSession | null => {
  const stored = storage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  const parsed = authSessionSchema.safeParse(JSON.parse(stored));
  if (!parsed.success) {
    storage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return null;
  }

  return parsed.data;
};

export const loadAuthSession = (): AuthSession | null => {
  return readSessionFrom(localStorage) ?? readSessionFrom(sessionStorage);
};

export const loadSessionPersistencePreference = (): SessionPersistencePreference => {
  const stored = localStorage.getItem(AUTH_SESSION_PREFERENCE_STORAGE_KEY);
  if (stored && SESSION_PREFERENCES.includes(stored as SessionPersistencePreference)) {
    return stored as SessionPersistencePreference;
  }

  return 'persistent';
};

export const saveAuthSession = (
  session: AuthSession | null,
  preference: SessionPersistencePreference,
): void => {
  if (!session) {
    localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return;
  }

  const storage = preference === 'persistent' ? localStorage : sessionStorage;
  const otherStorage = preference === 'persistent' ? sessionStorage : localStorage;
  otherStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  storage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const saveSessionPersistencePreference = (preference: SessionPersistencePreference): void => {
  localStorage.setItem(AUTH_SESSION_PREFERENCE_STORAGE_KEY, preference);
};
