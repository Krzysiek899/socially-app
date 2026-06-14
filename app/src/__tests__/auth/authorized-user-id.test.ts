import { getAuthorizedUser } from '../../mocks/auth/getAuthorizedUserId.ts';

const toBase64Url = (value: object): string =>
  Buffer.from(JSON.stringify(value))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const buildJwt = (payload: object): string => `header.${toBase64Url(payload)}.signature`;

describe('getAuthorizedUser', () => {
  it('maps demo email from Firebase token to user-1 profile dataset', () => {
    const token = buildJwt({
      sub: 'firebase-uid-abc',
      user_id: 'firebase-uid-abc',
      email: 'user@socially.app',
      name: 'Jan Kowalski',
    });

    expect(getAuthorizedUser(`Bearer ${token}`)).toEqual({
      userId: 'user-1',
      displayName: 'Jan Kowalski',
    });
  });

  it('keeps firebase user_id for non-demo emails', () => {
    const token = buildJwt({
      user_id: 'firebase-uid-xyz',
      email: 'other@socially.app',
    });

    expect(getAuthorizedUser(`Bearer ${token}`)).toEqual({
      userId: 'firebase-uid-xyz',
      displayName: undefined,
    });
  });
});
