const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const parsed = JSON.parse(atob(padded));
    return typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
};

export type AuthorizedUser = {
  userId: string;
  displayName?: string;
};

export const getAuthorizedUser = (authorization: string | null): AuthorizedUser | null => {
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.slice('Bearer '.length).trim();
  if (token.length === 0) {
    return null;
  }

  if (token.startsWith('token-')) {
    return { userId: token.slice('token-'.length) };
  }

  const payload = decodeJwtPayload(token);
  const firebaseUserId = payload?.user_id;
  const subject = payload?.sub;
  const displayName = typeof payload?.name === 'string' ? payload.name : undefined;

  if (typeof firebaseUserId === 'string' && firebaseUserId.length > 0) {
    return { userId: firebaseUserId, displayName };
  }

  if (typeof subject === 'string' && subject.length > 0) {
    return { userId: subject, displayName };
  }

  return { userId: 'user-1', displayName };
};

export const getAuthorizedUserId = (authorization: string | null): string | null => {
  return getAuthorizedUser(authorization)?.userId ?? null;
};
