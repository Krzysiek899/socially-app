type FirebaseEnvKey =
  | 'VITE_FIREBASE_API_KEY'
  | 'VITE_FIREBASE_AUTH_DOMAIN'
  | 'VITE_FIREBASE_PROJECT_ID'
  | 'VITE_FIREBASE_APP_ID';

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
};

const env = (globalThis as { __SOCIALLY_ENV__?: Record<string, string | undefined> }).__SOCIALLY_ENV__ ?? {};

const readEnv = (key: FirebaseEnvKey): string => {
  const value = env[key];
  if (value) {
    return value;
  }

  throw new Error(`auth.firebase.config_missing.${key}`);
};

export const firebaseConfig: FirebaseConfig = {
  apiKey: readEnv('VITE_FIREBASE_API_KEY'),
  authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
  appId: readEnv('VITE_FIREBASE_APP_ID'),
};
