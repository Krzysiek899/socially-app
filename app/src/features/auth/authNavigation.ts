const isSafeReturnTo = (value: string): boolean => value.startsWith('/') && !value.startsWith('//');

export const buildReturnTo = (pathname: string, search: string, hash: string): string => {
  const completePath = `${pathname}${search}${hash}`;
  return encodeURIComponent(completePath);
};

export const resolveReturnTo = (rawReturnTo: string | null, fallback = '/app'): string => {
  if (!rawReturnTo) {
    return fallback;
  }

  if (!isSafeReturnTo(rawReturnTo)) {
    return fallback;
  }

  return rawReturnTo;
};

export const withReturnTo = (path: string, returnTo: string): string => {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}returnTo=${encodeURIComponent(returnTo)}`;
};
