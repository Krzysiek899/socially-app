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
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.includes('/api/profile/me')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: 'user-1',
            displayName: 'Jan Kowalski',
            badge: 'Świetny organizator',
            avatarUrl: 'https://images.example.com/jan.png',
            bio: 'Bio',
            friendsCount: 0,
            friends: [],
            incomingRequests: [],
            groupsCount: 3,
            groups: [
              { id: 'group-1', name: 'Biegacze Powiśle', iconKey: 'sport' },
              { id: 'group-2', name: 'Klub Czytelniczy', iconKey: 'book' },
              { id: 'group-3', name: 'Tech Meetup WAW', iconKey: 'tech' },
            ],
          }),
        } as Response;
      }

      if (url.includes('/api/groups/group-1')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: 'group-1',
            name: 'Biegacze Powiśle',
            description: 'Opis grupy',
            membersCount: 1,
            membersPreview: [{ id: 'user-1', displayName: 'Jan Kowalski' }],
            isMember: true,
          }),
        } as Response;
      }

      return {
        ok: false,
        status: 404,
        json: async () => ({ message: 'not_found' }),
      } as Response;
    }) as typeof fetch;

    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Biegacze Powiśle' }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/app/groups/group-1');
    });
  });

  it('allows join then leave in group details', async () => {
    window.history.replaceState({}, '', '/app/groups/group-2');
    let isMember = false;
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.includes('/api/groups/group-2')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: 'group-2',
            name: 'Klub Czytelniczy',
            description: 'Opis grupy',
            membersCount: isMember ? 2 : 1,
            membersPreview: [{ id: 'org-anna', displayName: 'Anna Wójcik' }],
            isMember,
          }),
        } as Response;
      }

      if (url.includes('/api/groups/join')) {
        isMember = true;
        return {
          ok: true,
          status: 200,
          json: async () => ({ ok: true }),
        } as Response;
      }

      if (url.includes('/api/groups/leave')) {
        isMember = false;
        return {
          ok: true,
          status: 200,
          json: async () => ({ ok: true }),
        } as Response;
      }

      if (url.includes('/api/profile/me')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: 'user-1',
            displayName: 'Jan Kowalski',
            badge: 'Świetny organizator',
            avatarUrl: 'https://images.example.com/jan.png',
            bio: 'Bio',
            friendsCount: 0,
            friends: [],
            incomingRequests: [],
            groupsCount: isMember ? 1 : 0,
            groups: isMember ? [{ id: 'group-2', name: 'Klub Czytelniczy', iconKey: 'book' }] : [],
          }),
        } as Response;
      }

      return {
        ok: false,
        status: 404,
        json: async () => ({ message: 'not_found' }),
      } as Response;
    }) as typeof fetch;

    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Dołącz' }));
    expect(await screen.findByRole('button', { name: 'Opuść' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Opuść' }));
    expect(await screen.findByRole('button', { name: 'Dołącz' })).toBeInTheDocument();
  });

  it('shows first 3 members and reveals full list after clicking show-all', async () => {
    window.history.replaceState({}, '', '/app/groups/group-2');

    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.includes('/api/groups/group-2')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: 'group-2',
            name: 'Klub Czytelniczy',
            description: 'Opis grupy',
            membersCount: 5,
            membersPreview: [
              { id: 'm-1', displayName: 'Anna Wójcik' },
              { id: 'm-2', displayName: 'Jan Kowalski' },
              { id: 'm-3', displayName: 'Dawid Cieślak' },
              { id: 'm-4', displayName: 'Paweł Nowak' },
              { id: 'm-5', displayName: 'Julia Krawiec' },
            ],
            isMember: false,
          }),
        } as Response;
      }

      if (url.includes('/api/profile/me')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: 'user-1',
            displayName: 'Jan Kowalski',
            badge: 'Świetny organizator',
            avatarUrl: 'https://images.example.com/jan.png',
            bio: 'Bio',
            friendsCount: 0,
            friends: [],
            incomingRequests: [],
            groupsCount: 0,
            groups: [],
          }),
        } as Response;
      }

      return {
        ok: false,
        status: 404,
        json: async () => ({ message: 'not_found' }),
      } as Response;
    }) as typeof fetch;

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Klub Czytelniczy' })).toBeInTheDocument();
    expect(screen.getByText('Anna Wójcik')).toBeInTheDocument();
    expect(screen.getByText('Dawid Cieślak')).toBeInTheDocument();
    expect(screen.queryByText('Paweł Nowak')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Zobacz wszystkich' }));

    expect(await screen.findByText('Paweł Nowak')).toBeInTheDocument();
    expect(screen.getByText('Julia Krawiec')).toBeInTheDocument();
  });
});
