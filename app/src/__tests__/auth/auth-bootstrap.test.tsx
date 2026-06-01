import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from '../../App.tsx';

const SESSION_KEY = 'auth.session.v1';

describe('Authentication Flow bootstrap', () => {
  beforeEach(() => {
    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/login') && init?.method === 'POST') {
        const body = JSON.parse((init.body as string) ?? '{}') as { email?: string; password?: string };

        if (body.email === 'user@socially.app' && body.password === 'Password123!') {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              token: 'token-123',
              userId: 'user-1',
              expiresAt: '2099-01-01T00:00:00.000Z',
            }),
          } as Response;
        }
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
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('redirects Visitor from Authenticated Area to Login', async () => {
    window.history.replaceState({}, '', '/app');

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'auth.login.title' })).toBeInTheDocument();
  });

  it('creates Auth Session after successful Login', async () => {
    window.history.replaceState({}, '', '/login');

    render(<App />);

    const emailInput = await screen.findByRole('textbox', { name: 'auth.login.email' });
    const passwordInput = screen.getByLabelText('auth.login.password');

    fireEvent.change(emailInput, { target: { value: 'user@socially.app' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'auth.login.submit' }));

    expect(await screen.findByRole('heading', { name: 'app.authenticated.title' })).toBeInTheDocument();

    await waitFor(() => {
      const stored = localStorage.getItem(SESSION_KEY);
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored as string)).toMatchObject({
        token: 'token-123',
        userId: 'user-1',
      });
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

    expect(await screen.findByRole('heading', { name: 'app.authenticated.title' })).toBeInTheDocument();
  });
});
