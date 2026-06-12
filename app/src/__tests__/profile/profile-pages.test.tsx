import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from '../../App.tsx';
import { t } from '../../i18n/index.ts';

jest.mock('../../pages/discover/DiscoverMap.tsx', () => ({
  DiscoverMap: () => <div data-testid="discover-map" />,
}));

const SESSION_KEY = 'auth.session.v1';

const myProfileResponse = {
  id: 'user-1',
  displayName: 'Jan Kowalski',
  badge: 'Świetny organizator',
  avatarUrl: 'https://images.example.com/jan.png',
  bio: 'Pasjonat lokalnych inicjatyw i sportów zespołowych.',
  friendsCount: 124,
  friends: [
    { id: 'friend-1', displayName: 'Anna Nowak', avatarUrl: 'https://images.example.com/anna.png' },
    { id: 'friend-2', displayName: 'Marek Wiśniewski', avatarUrl: 'https://images.example.com/marek.png' },
    { id: 'friend-3', displayName: 'Kasia Kowalczyk', avatarUrl: 'https://images.example.com/kasia.png' },
  ],
  groupsCount: 8,
  groups: [
    { id: 'group-1', name: 'Biegacze Powiśle', iconKey: 'sport' },
    { id: 'group-2', name: 'Klub Czytelniczy', iconKey: 'book' },
    { id: 'group-3', name: 'Tech Meetup WAW', iconKey: 'tech' },
  ],
};

const publicProfileResponse = {
  id: 'org-anna',
  displayName: 'Anna Wójcik',
  handle: '@anna_wojcik',
  city: 'Kraków',
  joinedAt: '2023-03-15T10:00:00.000Z',
  bio: 'Organizuję kameralne wydarzenia muzyczne.',
  badges: ['Zweryfikowana organizatorka'],
  interests: ['Jazz'],
  stats: [
    { label: 'Ocena', value: '4.8' },
    { label: 'Opinie', value: '34' },
    { label: 'Dołączone', value: '12' },
    { label: 'Zorganizowane', value: '9' },
  ],
  sections: [
    {
      id: 'upcoming',
      title: 'Nadchodzące aktywności',
      description: 'Najbliższe spotkania użytkownika.',
      emptyText: 'Brak nadchodzących aktywności do pokazania.',
      items: [
        {
          id: 'event-krakow-jazz-night',
          title: 'Jazz Night nad Wisłą',
          subtitle: 'Wieczorny koncert jazzowy.',
          meta: '20 czerwca · Kraków',
          badge: 'Organizuje',
        },
      ],
    },
  ],
};

describe('Profile pages', () => {
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
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('renders the Figma-oriented my profile layout', async () => {
    window.history.replaceState({}, '', '/app/profile');
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => myProfileResponse,
    })) as typeof fetch;

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Twój profil' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Jan Kowalski' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edytuj' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zweryfikuj' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Wyloguj się' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Znajomi' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Grupy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zobacz wszystkich' })).toBeInTheDocument();
  });

  it('renders empty text when friends or groups are empty', async () => {
    window.history.replaceState({}, '', '/app/profile');
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        ...myProfileResponse,
        friends: [],
        groups: [],
      }),
    })) as typeof fetch;

    render(<App />);

    expect(await screen.findByText('Brak znajomych do wyświetlenia.')).toBeInTheDocument();
    expect(screen.getByText('Brak grup do wyświetlenia.')).toBeInTheDocument();
  });

  it('renders a public profile route with viewer actions', async () => {
    window.history.replaceState({}, '', '/app/users/org-anna');
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => publicProfileResponse,
    })) as typeof fetch;

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Anna Wójcik' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('profile.actions.message') })).toBeInTheDocument();
    expect(screen.getByText('Jazz Night nad Wisłą')).toBeInTheDocument();
  });

  it('opens public profile from discover organizer action', async () => {
    window.history.replaceState({}, '', '/app');
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.includes('/api/profile/users/org-anna')) {
        return {
          ok: true,
          status: 200,
          json: async () => publicProfileResponse,
        } as Response;
      }

      return {
        ok: true,
        status: 200,
        json: async () => [
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
        ],
      } as Response;
    }) as typeof fetch;

    render(<App />);

    const publicProfileButtons = await screen.findAllByRole('button', { name: t('profile.actions.view_public') });
    fireEvent.click(publicProfileButtons[0]);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/app/users/org-anna');
    });
    expect(await screen.findByRole('heading', { name: 'Anna Wójcik' })).toBeInTheDocument();
  });

  it('logs out from my profile and redirects to login', async () => {
    window.history.replaceState({}, '', '/app/profile');
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => myProfileResponse,
    })) as typeof fetch;

    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Wyloguj się' }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });
});
