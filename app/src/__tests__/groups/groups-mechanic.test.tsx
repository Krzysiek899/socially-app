import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from '../../App.tsx';
import { resetProfileStore } from '../../mocks/profile/store.ts';

const SESSION_KEY = 'auth.session.v1';

describe('Groups mechanic UI integration', () => {
  beforeEach(() => {
    resetProfileStore();
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        token: 'token-user-1',
        userId: 'user-1',
        expiresAt: '2099-01-01T00:00:00.000Z',
      }),
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('opens group details from my profile group row', async () => {
    window.history.replaceState({}, '', '/app/profile');
    render(<App />);

    fireEvent.click(await screen.findByText('Biegacze Powiśle'));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/app/groups/group-1');
    });
  });

  it('allows join then leave in group details', async () => {
    window.history.replaceState({}, '', '/app/groups/group-2');
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Dołącz' }));
    expect(await screen.findByRole('button', { name: 'Opuść' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Opuść' }));
    expect(await screen.findByRole('button', { name: 'Dołącz' })).toBeInTheDocument();
  });
});
