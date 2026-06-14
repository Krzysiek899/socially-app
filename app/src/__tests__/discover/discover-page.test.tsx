import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from '../../App.tsx';
import { t } from '../../i18n/index.ts';
import { fetchDiscoverEventsRequest } from '../../pages/discover/api/discoverApi.ts';

jest.mock('../../pages/discover/DiscoverMap.tsx', () => ({
  DiscoverMap: ({
    events,
    selectedEventId,
    onSelectEvent,
  }: {
    events: Array<{ id: string; title: string }>;
    selectedEventId: string | null;
    onSelectEvent: (eventId: string) => void;
  }) => (
    <div data-testid="discover-map">
      <p>{selectedEventId ?? 'none'}</p>
      {events.map((event) => (
        <button key={event.id} type="button" onClick={() => onSelectEvent(event.id)}>
          map-pin-{event.title}
        </button>
      ))}
    </div>
  ),
}));

const SESSION_KEY = 'auth.session.v1';

const baseEvent = {
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
    amount: 0,
    currency: 'PLN',
    isFree: true,
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

describe('Discover page states', () => {
  beforeEach(() => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        token: 'token-user-1',
        userId: 'user-1',
        expiresAt: '2099-01-01T00:00:00.000Z',
      }),
    );
    window.history.replaceState({}, '', '/app');
  });

  afterEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('renders empty state for empty discover response', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => [],
    })) as typeof fetch;

    render(<App />);
    expect(await screen.findByText(t('discover.state.empty'))).toBeInTheDocument();
  });

  it('renders error state for non-200 discover response', async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => ({ message: 'error' }),
    })) as typeof fetch;

    render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent(t('discover.errors.fetch_failed'));
  });

  it('synchronizes card selection with map pin selection', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => [
        baseEvent,
        {
          ...baseEvent,
          id: 'event-2',
          title: 'Night Run',
          category: 'SPORT',
        },
      ],
    })) as typeof fetch;

    render(<App />);

    expect(await screen.findByRole('heading', { name: t('discover.title') })).toBeInTheDocument();
    const secondPin = await screen.findByRole('button', { name: 'map-pin-Night Run' });
    fireEvent.click(secondPin);

    const eventButtons = await screen.findAllByRole('button', { name: /Night Run/i });
    const selectedCard = eventButtons.find((button) => button.getAttribute('aria-expanded') === 'true');
    expect(selectedCard).toBeTruthy();
    expect(selectedCard).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByText('event-2')).toBeInTheDocument();
  });

  it('opens event details route from join button', async () => {
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.includes('/api/discover/events/event-1')) {
        return {
          ok: true,
          status: 200,
          json: async () => baseEvent,
        } as Response;
      }

      return {
        ok: true,
        status: 200,
        json: async () => [baseEvent],
      } as Response;
    }) as typeof fetch;

    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: t('discover.card.join') }).isConnected).toBe(true);
    });
    fireEvent.click(screen.getByRole('button', { name: t('discover.card.join') }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/app/events/event-1');
    });
    expect(await screen.findByRole('heading', { name: 'Frontend Meetup' })).toBeInTheDocument();
  });

  it('adds startsWithinMinutes query when Here & Now is active', async () => {
    const fetchSpy = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => [],
    })) as typeof fetch;
    global.fetch = fetchSpy;

    await fetchDiscoverEventsRequest({
      searchQuery: '',
      categories: [],
      price: 'all',
      dateFrom: '',
      dateTo: '',
      hereNowEnabled: true,
      startsWithinMinutes: 120,
    }, 'token-user-1', new AbortController().signal);

    const latestCall = fetchSpy.mock.calls.at(-1);
    const url = latestCall ? String(latestCall[0]) : '';
    expect(url).toContain('startsWithinMinutes=120');
  });
});
