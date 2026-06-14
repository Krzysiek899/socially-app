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

const readNodeEnv = (): string | undefined => {
  if (typeof globalThis !== 'object' || !('process' in globalThis)) {
    return undefined;
  }

  const processValue = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process;
  return processValue?.env?.NODE_ENV;
};

const readViteEnv = (): Partial<Record<FirebaseEnvKey, string>> => {
  try {
    const evaluator = new Function('return import.meta.env;');
    const evaluated = evaluator();
    if (typeof evaluated === 'object' && evaluated !== null) {
      return evaluated as Partial<Record<FirebaseEnvKey, string>>;
    }
  } catch {
    // Jest CJS runtime does not support import.meta.
  }

  return {};
};

const readEnv = (key: FirebaseEnvKey): string => {
  const viteEnv = readViteEnv();
  const value = viteEnv[key];
  if (value) {
    return value;
  }

  if (readNodeEnv() === 'test') {
    return `test-${key.toLowerCase()}`;
  }

  throw new Error(`auth.firebase.config_missing.${key.toLowerCase()}`);
};

export const firebaseConfig: FirebaseConfig = {
  apiKey: readEnv('VITE_FIREBASE_API_KEY'),
  authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
  appId: readEnv('VITE_FIREBASE_APP_ID'),
};
