import { loginRequest, logoutRequest, registerRequest } from '../../pages/auth/api/authApi.ts';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
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

  it('calls signOut in logoutRequest', async () => {
    await logoutRequest();
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
