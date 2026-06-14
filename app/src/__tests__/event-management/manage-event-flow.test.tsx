import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from '../../App.tsx';
import { t } from '../../i18n/index.ts';

const SESSION_KEY = 'auth.session.v1';

const baseManagedEvent = {
  id: 'event-owned-1',
  title: 'Siatkówka plażowa',
  dateTime: '2026-08-12T16:00:00.000Z',
  description: 'Gramy 4 na 4, poziom średniozaawansowany.',
  category: 'SPORT',
  address: {
    city: 'Warszawa',
    street: 'Plażowa',
    buildingNumber: '17',
    postalCode: '00-001',
  },
  location: { lat: 52.2, lng: 21.0 },
  price: { amount: 0, currency: 'PLN', isFree: true },
  organizer: { id: 'user-1', displayName: 'Jan Kowalski' },
  attendeesCount: 2,
  attendees: [
    { id: 'participant-1', displayName: 'Anna Nowak' },
    { id: 'participant-2', displayName: 'Piotr Kowalski' },
  ],
  management: {
    isActive: true,
    capacity: 10,
    joinRules: {
      visibility: 'PUBLIC',
      approvalRequired: true,
    },
    participants: [
      { id: 'participant-1', displayName: 'Anna Nowak' },
      { id: 'participant-2', displayName: 'Piotr Kowalski' },
    ],
    joinRequests: [
      { id: 'request-1', userId: 'request-user-1', displayName: 'Marek Wiśniewski', requestedAt: '2026-08-01T10:00:00.000Z' },
      { id: 'request-2', userId: 'request-user-2', displayName: 'Alicja Mazur', requestedAt: '2026-08-01T11:00:00.000Z' },
    ],
  },
};

describe('Manage authored event flow', () => {
  beforeEach(() => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        token: 'token-user-1',
        userId: 'user-1',
        expiresAt: '2099-01-01T00:00:00.000Z',
      }),
    );
    window.history.replaceState({}, '', '/app/my-events');
  });

  afterEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('supports edit dialog, join rules dialog, and approve/reject requests', async () => {
    let managedEvent = { ...baseManagedEvent };

    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/events/authored') && (!init?.method || init.method === 'GET')) {
        return {
          ok: true,
          status: 200,
          json: async () => [managedEvent],
        } as Response;
      }

      if (url.endsWith('/api/events/participating') && (!init?.method || init.method === 'GET')) {
        return {
          ok: true,
          status: 200,
          json: async () => [],
        } as Response;
      }

      if (url.endsWith('/api/events/authored/event-owned-1') && (!init?.method || init.method === 'GET')) {
        return {
          ok: true,
          status: 200,
          json: async () => managedEvent,
        } as Response;
      }

      if (url.endsWith('/api/events/authored/event-owned-1') && init?.method === 'PATCH') {
        const payload = JSON.parse(String(init.body)) as {
          title: string;
          description: string;
          dateTime: string;
          address: { city: string; street: string; buildingNumber: string; postalCode?: string };
          price: { amount: number; currency: 'PLN'; isFree: boolean };
          capacity: number | null;
        };
        managedEvent = {
          ...managedEvent,
          title: payload.title,
          description: payload.description,
          dateTime: payload.dateTime,
          address: payload.address,
          price: payload.price,
          management: {
            ...managedEvent.management,
            capacity: payload.capacity,
          },
        };
        return {
          ok: true,
          status: 200,
          json: async () => managedEvent,
        } as Response;
      }

      if (url.endsWith('/api/events/authored/event-owned-1/join-rules') && init?.method === 'PATCH') {
        const payload = JSON.parse(String(init.body)) as {
          visibility: 'FRIENDS' | 'GROUP' | 'PUBLIC';
          approvalRequired: boolean;
        };
        managedEvent = {
          ...managedEvent,
          management: {
            ...managedEvent.management,
            joinRules: payload,
          },
        };
        return {
          ok: true,
          status: 200,
          json: async () => managedEvent,
        } as Response;
      }

      if (url.endsWith('/api/events/authored/event-owned-1/requests/request-1') && init?.method === 'POST') {
        managedEvent = {
          ...managedEvent,
          attendeesCount: 3,
          attendees: [...managedEvent.attendees, { id: 'request-user-1', displayName: 'Marek Wiśniewski' }],
          management: {
            ...managedEvent.management,
            participants: [...managedEvent.management.participants, { id: 'request-user-1', displayName: 'Marek Wiśniewski' }],
            joinRequests: managedEvent.management.joinRequests.filter((item) => item.id !== 'request-1'),
          },
        };
        return {
          ok: true,
          status: 200,
          json: async () => managedEvent,
        } as Response;
      }

      if (url.endsWith('/api/events/authored/event-owned-1/requests/request-2') && init?.method === 'POST') {
        managedEvent = {
          ...managedEvent,
          management: {
            ...managedEvent.management,
            joinRequests: managedEvent.management.joinRequests.filter((item) => item.id !== 'request-2'),
          },
        };
        return {
          ok: true,
          status: 200,
          json: async () => managedEvent,
        } as Response;
      }

      return {
        ok: false,
        status: 404,
        json: async () => ({ message: 'not_found' }),
      } as Response;
    }) as typeof fetch;

    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: t('eventManagement.my_events.manage') }));
    expect(await screen.findByRole('heading', { name: t('eventManagement.manage.title') })).toBeInTheDocument();
    expect(screen.getByText(t('eventManagement.manage.participants.title'))).toBeInTheDocument();
    expect(screen.getByText(t('eventManagement.manage.requests.title'))).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: t('eventManagement.manage.actions.edit') }));
    expect(await screen.findByRole('heading', { name: t('eventManagement.manage.dialog.edit.title') })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(t('eventManagement.form.title')), { target: { value: 'Siatkówka premium' } });
    fireEvent.click(screen.getByRole('button', { name: t('eventManagement.manage.dialog.save') }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/events/authored/event-owned-1',
        expect.objectContaining({ method: 'PATCH' }),
      );
    });

    fireEvent.click(screen.getByRole('button', { name: t('eventManagement.manage.actions.rules') }));
    expect(await screen.findByRole('heading', { name: t('eventManagement.manage.dialog.rules.title') })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(t('eventManagement.manage.rules.visibility')), { target: { value: 'GROUP' } });
    fireEvent.click(screen.getByLabelText(t('eventManagement.manage.rules.approval_required')));
    fireEvent.click(screen.getByRole('button', { name: t('eventManagement.manage.dialog.save') }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/events/authored/event-owned-1/join-rules',
        expect.objectContaining({ method: 'PATCH' }),
      );
    });

    fireEvent.click(screen.getAllByRole('button', { name: t('eventManagement.manage.requests.approve') })[0]);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: t('eventManagement.manage.requests.approve') })).toHaveLength(1);
    });

    fireEvent.click(screen.getAllByRole('button', { name: t('eventManagement.manage.requests.reject') })[0]);
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: t('eventManagement.manage.requests.approve') })).not.toBeInTheDocument();
    });
  });
});
