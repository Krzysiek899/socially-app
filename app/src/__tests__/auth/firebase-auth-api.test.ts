import { loginRequest, logoutRequest, registerRequest } from '../../pages/auth/api/authApi.ts';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
  setPersistence: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
  signOut: jest.fn(),
  browserLocalPersistence: { type: 'LOCAL' },
  browserSessionPersistence: { type: 'SESSION' },
}));

describe('authApi Firebase adapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses local persistence when rememberMe is true', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: {
        uid: 'user-1',
        getIdToken: jest.fn().mockResolvedValue('token-user-1'),
        stsTokenManager: { expirationTime: Date.parse('2099-01-01T00:00:00.000Z') },
      },
    });

    const session = await loginRequest({
      email: 'user@socially.app',
      password: 'Password123!',
      rememberMe: true,
    });

    expect(setPersistence).toHaveBeenCalledWith(expect.anything(), browserLocalPersistence);
    expect(session).toMatchObject({ userId: 'user-1', token: 'token-user-1' });
  });

  it('uses session persistence when rememberMe is false', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: {
        uid: 'user-1',
        getIdToken: jest.fn().mockResolvedValue('token-user-1'),
        stsTokenManager: { expirationTime: Date.parse('2099-01-01T00:00:00.000Z') },
      },
    });

    await loginRequest({
      email: 'user@socially.app',
      password: 'Password123!',
      rememberMe: false,
    });

    expect(setPersistence).toHaveBeenCalledWith(expect.anything(), browserSessionPersistence);
  });

  it('maps email-already-in-use to auth.registration.email_taken', async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({ code: 'auth/email-already-in-use' });

    await expect(
      registerRequest({ fullName: 'Jan Kowalski', email: 'user@socially.app', password: 'Password123!' }),
    ).rejects.toThrow('auth.registration.email_taken');
  });

  it('updates Firebase displayName and refreshes token on registration', async () => {
    const getIdToken = jest.fn().mockResolvedValue('token-user-2');
    const user = {
      uid: 'user-2',
      getIdToken,
      stsTokenManager: { expirationTime: Date.parse('2099-01-01T00:00:00.000Z') },
    };

    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({ user });

    const session = await registerRequest({
      fullName: 'Jan Kowalski',
      email: 'new-user@socially.app',
      password: 'Password123!',
    });

    expect(updateProfile).toHaveBeenCalledWith(user, { displayName: 'Jan Kowalski' });
    expect(getIdToken).toHaveBeenCalledWith(true);
    expect(session).toMatchObject({ userId: 'user-2', token: 'token-user-2' });
  });

  it('calls signOut in logoutRequest', async () => {
    await logoutRequest();
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
