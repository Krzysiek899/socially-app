import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from '../../App.tsx';

const mockSignOut = jest.fn().mockResolvedValue(undefined);

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
  setPersistence: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  browserLocalPersistence: { type: 'LOCAL' },
  browserSessionPersistence: { type: 'SESSION' },
}));

jest.mock('../../pages/discover/DiscoverMap.tsx', () => ({
  DiscoverMap: () => <div data-testid="discover-map" />,
}));

const SESSION_KEY = 'auth.session.v1';

const discoverEventsResponse = [
  {
    id: 'event-krakow-jazz-night',
    title: 'Jazz Night nad Wisłą',
    dateTime: '2026-06-20T17:30:00Z',
    description: 'Wieczorny koncert jazzowy i jam session na bulwarach.',
    category: 'MUSIC',
    address: {
      city: 'Kraków',
      street: 'Bulwar Czerwieński',
      buildingNumber: '1',
      postalCode: '31-069',
    },
    location: {
      lat: 50.0515,
      lng: 19.9366,
    },
    price: {
      amount: 0,
      currency: 'PLN',
      isFree: true,
    },
    organizer: {
      id: 'org-anna',
      displayName: 'Anna Wójcik',
    },
    attendeesCount: 1,
    attendees: [{ id: 'u1', displayName: 'Paweł K.' }],
  },
];

const myProfileResponse = {
  id: 'user-1',
  displayName: 'Jan Kowalski',
  badge: 'Świetny organizator',
  avatarUrl: 'https://images.example.com/jan.png',
  bio: 'Pasjonat lokalnych inicjatyw i sportów zespołowych.',
  friendsCount: 124,
  friends: [
    { id: 'friend-1', displayName: 'Anna Nowak', avatarUrl: 'https://images.example.com/anna.png' },
  ],
  incomingRequests: [],
  groupsCount: 8,
  groups: [
    { id: 'group-1', name: 'Biegacze Powiśle', iconKey: 'sport' },
  ],
};

describe('AppNavbar profile menu', () => {
  beforeEach(() => {
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
    mockSignOut.mockClear();
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('removes the profile nav link and opens a dropdown from the avatar trigger', async () => {
    window.history.replaceState({}, '', '/app');
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => discoverEventsResponse,
    })) as typeof fetch;

    render(<App />);

    await screen.findByRole('heading', { name: 'Odkrywaj' });
    expect(screen.queryByRole('link', { name: 'Profil' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Otwórz menu profilu' }));

    const menu = screen.getByRole('menu');

    expect(menu).toBeInTheDocument();
    expect(within(menu).getByRole('button', { name: 'Zobacz profil' })).toBeInTheDocument();
    expect(within(menu).getByRole('button', { name: 'Wyloguj się' })).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('navigates to my profile from the avatar dropdown', async () => {
    window.history.replaceState({}, '', '/app');
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.includes('/api/profile/me')) {
        return {
          ok: true,
          status: 200,
          json: async () => myProfileResponse,
        } as Response;
      }

      return {
        ok: true,
        status: 200,
        json: async () => discoverEventsResponse,
      } as Response;
    }) as typeof fetch;

    render(<App />);

    await screen.findByRole('heading', { name: 'Odkrywaj' });

    fireEvent.click(screen.getByRole('button', { name: 'Otwórz menu profilu' }));
    fireEvent.click(within(screen.getByRole('menu')).getByRole('button', { name: 'Zobacz profil' }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/app/profile');
    });

    expect(await screen.findByRole('heading', { name: 'Twój profil' })).toBeInTheDocument();
  });

  it('logs out from the avatar dropdown', async () => {
    window.history.replaceState({}, '', '/app');
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => discoverEventsResponse,
    })) as typeof fetch;

    render(<App />);

    await screen.findByRole('heading', { name: 'Odkrywaj' });

    fireEvent.click(screen.getByRole('button', { name: 'Otwórz menu profilu' }));
    fireEvent.click(within(screen.getByRole('menu')).getByRole('button', { name: 'Wyloguj się' }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('uses my profile display name for navbar avatar initials on profile route', async () => {
    window.history.replaceState({}, '', '/app/profile');
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/api/profile/me')) {
        return {
          ok: true,
          status: 200,
          json: async () => myProfileResponse,
        } as Response;
      }

      return {
        ok: true,
        status: 200,
        json: async () => discoverEventsResponse,
      } as Response;
    }) as typeof fetch;

    render(<App />);

    await screen.findByRole('heading', { name: 'Odkrywaj' });
    const navbarAvatar = screen.getAllByRole('img', { name: 'Jan Kowalski' })[0];
    expect(navbarAvatar).toBeInTheDocument();
    expect(within(navbarAvatar).getByAltText('Jan Kowalski')).toHaveAttribute('src', 'https://images.example.com/jan.png');
  });
});
