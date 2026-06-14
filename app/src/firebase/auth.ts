import { getAuth } from 'firebase/auth';
import { firebaseApp } from './app.ts';

export const firebaseAuth = getAuth(firebaseApp);
