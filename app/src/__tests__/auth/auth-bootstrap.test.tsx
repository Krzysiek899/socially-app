import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from '../../App.tsx';
import { t } from '../../i18n/index.ts';

const mockSetPersistence = jest.fn().mockResolvedValue(undefined);
const mockSignInWithEmailAndPassword = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockUpdateProfile = jest.fn().mockResolvedValue(undefined);
const mockSignOut = jest.fn().mockResolvedValue(undefined);

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
  setPersistence: (...args: unknown[]) => mockSetPersistence(...args),
  signInWithEmailAndPassword: (...args: unknown[]) => mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args: unknown[]) => mockCreateUserWithEmailAndPassword(...args),
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  browserLocalPersistence: { type: 'LOCAL' },
  browserSessionPersistence: { type: 'SESSION' },
}));

const SESSION_KEY = 'auth.session.v1';
const DISCOVER_EVENT = {
  id: 'event-1',
  title: 'Frontend Meetup',
  dateTime: '2026-06-15T16:00:00Z',
  description: 'Opis wydarzenia.',
  category: 'TECH',
  address: {
    city: 'Warszawa',
    street: 'Prosta',
    buildingNumber: '1',
    postalCode: '00-001',
  },
  location: {
    lat: 52.2297,
    lng: 21.0122,
  },
  price: {
    amount: 40,
    currency: 'PLN',
    isFree: false,
  },
  organizer: {
    id: 'org-1',
    displayName: 'Organizator',
  },
  attendeesCount: 2,
  attendees: [
    { id: 'u-1', displayName: 'Uczestnik A' },
    { id: 'u-2', displayName: 'Uczestnik B' },
  ],
};

describe('Authentication Flow bootstrap', () => {
  beforeEach(() => {
    const users = new Map<string, { userId: string; password: string }>([
      ['user@socially.app', { userId: 'user-1', password: 'Password123!' }],
    ]);

    mockSetPersistence.mockResolvedValue(undefined);
    mockSignInWithEmailAndPassword.mockImplementation(
      async (_auth: unknown, email: string, password: string) => {
        const found = users.get(email.toLowerCase());
        if (!found || found.password !== password) {
          throw { code: 'auth/invalid-credential' };
        }

        return {
          user: {
            uid: found.userId,
            getIdToken: async () => `token-${found.userId}`,
            stsTokenManager: { expirationTime: Date.parse('2099-01-01T00:00:00.000Z') },
          },
        };
      },
    );
    mockCreateUserWithEmailAndPassword.mockImplementation(
      async (_auth: unknown, email: string, password: string) => {
        const normalizedEmail = email.toLowerCase();
        if (normalizedEmail === 'user@socially.app' || users.has(normalizedEmail)) {
          throw { code: 'auth/email-already-in-use' };
        }

        const userId = `user-${normalizedEmail.split('@')[0]}`;
        users.set(normalizedEmail, { userId, password });

        return {
          user: {
            uid: userId,
            getIdToken: async () => `token-${userId}`,
            stsTokenManager: { expirationTime: Date.parse('2099-01-01T00:00:00.000Z') },
          },
        };
      },
    );
    mockUpdateProfile.mockResolvedValue(undefined);
    mockSignOut.mockResolvedValue(undefined);

    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.includes('/api/discover/events') && (!init?.method || init.method === 'GET')) {
        const headers = new Headers(init?.headers);
        const authHeader = headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer token-')) {
          return {
            ok: false,
            status: 401,
            json: async () => ({ message: 'unauthorized' }),
          } as Response;
        }

        return {
          ok: true,
          status: 200,
          json: async () => [DISCOVER_EVENT],
        } as Response;
      }

      return {
        ok: false,
        status: 401,
        json: async () => ({ message: 'invalid_credentials' }),
      } as Response;
    }) as typeof fetch;
  });

  afterEach(() => {
    jest.resetAllMocks();
   mockSetPersistence.mockClear();
   mockSignInWithEmailAndPassword.mockClear();
   mockCreateUserWithEmailAndPassword.mockClear();
   mockUpdateProfile.mockClear();
   mockSignOut.mockClear();
   localStorage.clear();
   sessionStorage.clear();
   window.history.replaceState({}, '', '/');
  });

  it('redirects Visitor from Authenticated Area to Login', async () => {
   window.history.replaceState({}, '', '/app');

   render(<App />);

   expect(await screen.findByRole('heading', { name: t('auth.login.title') })).toBeInTheDocument();
  });

  it('creates persistent Auth Session after successful Login with "remember me"', async () => {
   window.history.replaceState({}, '', '/login');

   render(<App />);

   const emailInput = await screen.findByRole('textbox', { name: t('auth.login.email') });
   const passwordInput = screen.getByLabelText(t('auth.login.password'));

   fireEvent.change(emailInput, { target: { value: 'user@socially.app' } });
   fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
   fireEvent.click(screen.getByRole('button', { name: t('auth.login.submit') }));

   expect(await screen.findByRole('heading', { name: t('discover.title') })).toBeInTheDocument();

   await waitFor(() => {
     const stored = localStorage.getItem(SESSION_KEY);
     expect(stored).toBeTruthy();
     expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
     expect(JSON.parse(stored as string)).toMatchObject({
       token: 'token-user-1',
       userId: 'user-1',
     });
   });
  });

  it('stores Auth Session in sessionStorage when "remember me" is disabled', async () => {
   window.history.replaceState({}, '', '/login');

   render(<App />);

   const rememberMe = await screen.findByRole('checkbox', { name: t('auth.login.remember_me') });
   fireEvent.click(rememberMe);

   fireEvent.change(screen.getByRole('textbox', { name: t('auth.login.email') }), {
     target: { value: 'user@socially.app' },
   });
   fireEvent.change(screen.getByLabelText(t('auth.login.password')), {
     target: { value: 'Password123!' },
   });

   fireEvent.click(screen.getByRole('button', { name: t('auth.login.submit') }));

   expect(await screen.findByRole('heading', { name: t('discover.title') })).toBeInTheDocument();

   await waitFor(() => {
     expect(localStorage.getItem(SESSION_KEY)).toBeNull();
     expect(sessionStorage.getItem(SESSION_KEY)).toBeTruthy();
   });
  });

  it('restores Auth Session from storage on refresh', async () => {
   localStorage.setItem(
     SESSION_KEY,
      JSON.stringify({
        token: 'token-123',
        userId: 'user-1',
        expiresAt: '2099-01-01T00:00:00.000Z',
      }),
    );
    window.history.replaceState({}, '', '/app');

    render(<App />);

    expect(await screen.findByRole('heading', { name: t('discover.title') })).toBeInTheDocument();
  });

  it('redirects authenticated User from /login to /app', async () => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        token: 'token-user-1',
        userId: 'user-1',
        expiresAt: '2099-01-01T00:00:00.000Z',
      }),
    );
    window.history.replaceState({}, '', '/login');

    render(<App />);

    expect(await screen.findByRole('heading', { name: t('discover.title') })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/app');
  });

  it('redirects authenticated User from /register to /app', async () => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        token: 'token-user-1',
        userId: 'user-1',
        expiresAt: '2099-01-01T00:00:00.000Z',
      }),
    );
    window.history.replaceState({}, '', '/register');

    render(<App />);

    expect(await screen.findByRole('heading', { name: t('discover.title') })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/app');
  });

  it('preserves full returnTo path with query and hash after Login', async () => {
    window.history.replaceState({}, '', '/app?tab=discover#upcoming');

    render(<App />);

    const emailInput = await screen.findByRole('textbox', { name: t('auth.login.email') });
    const passwordInput = screen.getByLabelText(t('auth.login.password'));
    fireEvent.change(emailInput, { target: { value: 'user@socially.app' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: t('auth.login.submit') }));

    await screen.findByRole('heading', { name: t('discover.title') });
    expect(window.location.pathname).toBe('/app');
    expect(window.location.search).toBe('?tab=discover');
    expect(window.location.hash).toBe('#upcoming');
  });

  it('keeps returnTo when navigating between Login and Registration', async () => {
    window.history.replaceState({}, '', '/login?returnTo=%2Fapp%3Ftab%3Ddiscover%23upcoming');

    render(<App />);

    const registerLink = await screen.findByRole('link', { name: t('auth.login.go_to_register') });
    fireEvent.click(registerLink);
    expect(window.location.pathname).toBe('/register');
    expect(window.location.search).toContain('returnTo=');

    const loginLink = await screen.findByRole('link', { name: t('auth.registration.go_to_login') });
    fireEvent.click(loginLink);
    expect(window.location.pathname).toBe('/login');
    expect(window.location.search).toContain('returnTo=');
  });

  it('validates Registration fields and prevents submit for invalid form', async () => {
    window.history.replaceState({}, '', '/register');

    render(<App />);

    fireEvent.change(await screen.findByRole('textbox', { name: t('auth.registration.full_name') }), {
      target: { value: 'A' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: t('auth.registration.email') }), {
      target: { value: 'not-an-email' },
    });
    fireEvent.change(screen.getByLabelText(t('auth.registration.password')), {
      target: { value: 'weak' },
    });
    fireEvent.change(screen.getByLabelText(t('auth.registration.confirm_password')), {
      target: { value: 'different' },
    });
    fireEvent.click(screen.getByRole('button', { name: t('auth.registration.submit') }));

    expect(await screen.findByText(t('auth.registration.validation.full_name.length'))).toBeInTheDocument();
    expect(screen.getByText(t('auth.registration.validation.email.invalid'))).toBeInTheDocument();
    expect(screen.getByText(t('auth.registration.validation.password.rules'))).toBeInTheDocument();
    expect(screen.getByText(t('auth.registration.validation.confirm_password.mismatch'))).toBeInTheDocument();
    expect(screen.getByText(t('auth.registration.validation.consent.required'))).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalledWith(
      '/api/auth/register',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('shows email_taken error when Registration returns 409', async () => {
    window.history.replaceState({}, '', '/register');

    render(<App />);

    fireEvent.change(await screen.findByRole('textbox', { name: t('auth.registration.full_name') }), {
      target: { value: 'Jan Kowalski' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: t('auth.registration.email') }), {
      target: { value: 'user@socially.app' },
    });
    fireEvent.change(screen.getByLabelText(t('auth.registration.password')), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByLabelText(t('auth.registration.confirm_password')), {
      target: { value: 'Password123!' },
    });
    fireEvent.click(screen.getByRole('checkbox'));

    fireEvent.click(screen.getByRole('button', { name: t('auth.registration.submit') }));

    expect(await screen.findByText(t('auth.registration.email_taken'))).toBeInTheDocument();
  });

  it('creates Auth Session and redirects to returnTo after successful Registration', async () => {
    window.history.replaceState({}, '', '/register?returnTo=%2Fapp%3Ftab%3Ddiscover%23upcoming');

    render(<App />);

    fireEvent.change(await screen.findByRole('textbox', { name: t('auth.registration.full_name') }), {
      target: { value: 'Nowy User' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: t('auth.registration.email') }), {
      target: { value: 'new@socially.app' },
    });
    fireEvent.change(screen.getByLabelText(t('auth.registration.password')), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByLabelText(t('auth.registration.confirm_password')), {
      target: { value: 'Password123!' },
    });
    fireEvent.click(screen.getByRole('checkbox'));

    fireEvent.click(screen.getByRole('button', { name: t('auth.registration.submit') }));

    expect(await screen.findByRole('heading', { name: t('discover.title') })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/app');
    expect(window.location.search).toBe('?tab=discover');
    expect(window.location.hash).toBe('#upcoming');
  });
});
