import { getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from './config.ts';

export const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
