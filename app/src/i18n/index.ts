import { plTranslations } from './pl.ts';

const activeTranslations = plTranslations;

export const t = (key: string): string => activeTranslations[key] ?? key;
