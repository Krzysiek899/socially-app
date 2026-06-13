import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from '../../App.tsx';
import { t } from '../../i18n/index.ts';

const SESSION_KEY = 'auth.session.v1';

type MockEvent = {
  id: string;
  title: string;
  dateTime: string;
  description: string;
  category: 'TECH' | 'COMMUNITY';
  address: {
    city: string;
    street: string;
    buildingNumber: string;
    postalCode?: string;
  };
  location: { lat: number; lng: number };
  price: { amount: number; currency: 'PLN'; isFree: boolean };
  organizer: { id: string; displayName: string };
  attendeesCount: number;
  attendees: Array<{ id: string; displayName: string }>;
  participation?: { state: 'joined' | 'pending' };
};

const baseEvent = (): MockEvent => ({
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
  attendeesCount: 0,
  attendees: [],
});

describe('Event participation flow', () => {
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

  it('joins event and shows joined badge in My Events participating section', async () => {
    const event = baseEvent();
    let participating: MockEvent[] = [];
    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/discover/events/event-1')) {
        return { ok: true, status: 200, json: async () => event } as Response;
      }
      if (url.includes('/api/discover/events')) {
        return { ok: true, status: 200, json: async () => [event] } as Response;
      }
      if (url.endsWith('/api/events/authored')) {
        return { ok: true, status: 200, json: async () => [] } as Response;
      }
      if (url.endsWith('/api/events/participating')) {
        return { ok: true, status: 200, json: async () => participating } as Response;
      }
      if (url.endsWith('/api/events/event-1/join') && init?.method === 'POST') {
        event.participation = { state: 'joined' };
        event.attendees = [{ id: 'user-1', displayName: 'Jan Kowalski' }];
        event.attendeesCount = 1;
        participating = [{ ...event, participation: { state: 'joined' } }];
        return { ok: true, status: 200, json: async () => ({ state: 'joined' }) } as Response;
      }

      return { ok: false, status: 404, json: async () => ({ message: 'not_found' }) } as Response;
    }) as typeof fetch;

    window.history.replaceState({}, '', '/app/events/event-1');
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: t('discover.details.join') }));

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: t('discover.details.join') })).not.toBeInTheDocument();
    });

    fireEvent.click(await screen.findByRole('link', { name: t('discover.nav.my_events') }));

    expect(await screen.findByRole('heading', { name: t('eventManagement.my_events.participating.title') })).toBeInTheDocument();
    expect(await screen.findByText(t('eventManagement.my_events.participation.joined'))).toBeInTheDocument();
  });

  it('shows pending state and allows leaving from My Events', async () => {
    const event: MockEvent = {
      ...baseEvent(),
      id: 'event-2',
      participation: { state: 'pending' },
    };
    let participating: MockEvent[] = [{ ...event }];
    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/discover/events/event-2')) {
        return { ok: true, status: 200, json: async () => event } as Response;
      }
      if (url.includes('/api/discover/events')) {
        return { ok: true, status: 200, json: async () => [event] } as Response;
      }
      if (url.endsWith('/api/events/authored')) {
        return { ok: true, status: 200, json: async () => [] } as Response;
      }
      if (url.endsWith('/api/events/participating')) {
        return { ok: true, status: 200, json: async () => participating } as Response;
      }
      if (url.endsWith('/api/events/event-2/participation') && init?.method === 'DELETE') {
        participating = [];
        delete event.participation;
        return { ok: true, status: 200, json: async () => ({ ok: true }) } as Response;
      }

      return { ok: false, status: 404, json: async () => ({ message: 'not_found' }) } as Response;
    }) as typeof fetch;

    window.history.replaceState({}, '', '/app/events/event-2');
    render(<App />);

    expect(await screen.findByText(t('discover.details.pending'))).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: t('discover.details.join') })).not.toBeInTheDocument();

    fireEvent.click(await screen.findByRole('link', { name: t('discover.nav.my_events') }));
    expect(await screen.findByText(t('eventManagement.my_events.participation.pending'))).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: t('eventManagement.my_events.leave') }));

    await waitFor(() => {
      expect(screen.getByText(t('eventManagement.my_events.participating.empty'))).toBeInTheDocument();
    });
  });

  it('hides join CTA for organizer and current participant', async () => {
    const organizerEvent: MockEvent = {
      ...baseEvent(),
      id: 'event-organizer',
      organizer: { id: 'user-1', displayName: 'Jan Kowalski' },
    };
    const participantEvent: MockEvent = {
      ...baseEvent(),
      id: 'event-participant',
      attendees: [{ id: 'user-1', displayName: 'Jan Kowalski' }],
      attendeesCount: 1,
    };

    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/events/authored')) {
        return { ok: true, status: 200, json: async () => [] } as Response;
      }
      if (url.endsWith('/api/events/participating')) {
        return { ok: true, status: 200, json: async () => [] } as Response;
      }
      if (url.endsWith('/api/discover/events/event-organizer')) {
        return { ok: true, status: 200, json: async () => organizerEvent } as Response;
      }
      if (url.endsWith('/api/discover/events/event-participant')) {
        return { ok: true, status: 200, json: async () => participantEvent } as Response;
      }
      if (url.includes('/api/discover/events')) {
        return { ok: true, status: 200, json: async () => [organizerEvent, participantEvent] } as Response;
      }

      return { ok: false, status: 404, json: async () => ({ message: 'not_found' }) } as Response;
    }) as typeof fetch;

    window.history.replaceState({}, '', '/app/events/event-organizer');
    const { rerender } = render(<App />);
    await screen.findByRole('heading', { name: organizerEvent.title });
    expect(screen.queryByRole('button', { name: t('discover.details.join') })).not.toBeInTheDocument();

    window.history.replaceState({}, '', '/app/events/event-participant');
    rerender(<App />);
    await screen.findByRole('heading', { name: participantEvent.title });
    expect(screen.queryByRole('button', { name: t('discover.details.join') })).not.toBeInTheDocument();
  });
});
