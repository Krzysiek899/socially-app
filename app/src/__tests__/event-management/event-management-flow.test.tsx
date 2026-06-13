import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from '../../App.tsx';
import { t } from '../../i18n/index.ts';

jest.mock('../../pages/event-management/components/LocationPicker.tsx', () => ({
  LocationPicker: ({
    searchResults,
    onSelectResult,
    onPickLocation,
  }: {
    searchResults: Array<{ id: string; label: string }>;
    onSelectResult: (id: string) => void;
    onPickLocation: (coords: { lat: number; lng: number }) => void;
  }) => (
    <div>
      {searchResults.map((result) => (
        <button key={result.id} type="button" onClick={() => onSelectResult(result.id)}>
          {result.label}
        </button>
      ))}
      <button type="button" onClick={() => onPickLocation({ lat: 52.25, lng: 21.0 })}>
        mock-pick-map
      </button>
    </div>
  ),
}));

const SESSION_KEY = 'auth.session.v1';

const createdEventResponse = {
  id: 'event-new-tech-meetup',
  title: 'Nowy meetup technologiczny',
  dateTime: '2026-07-20T16:30:00.000Z',
  description: 'Spotkanie dla osób zainteresowanych frontendem i backendem.',
  category: 'TECH',
  address: {
    city: 'Warszawa',
    street: 'Prosta',
    buildingNumber: '10',
    postalCode: '00-001',
  },
  location: {
    lat: 52.2297,
    lng: 21.0122,
  },
  price: {
    amount: 45,
    currency: 'PLN',
    isFree: false,
  },
  organizer: {
    id: 'user-1',
    displayName: 'Jan Kowalski',
  },
  attendeesCount: 0,
  attendees: [],
};

const discoverSeedEvent = {
  id: 'event-seed',
  title: 'Wydarzenie seed',
  dateTime: '2026-07-15T16:30:00.000Z',
  description: 'Wydarzenie bazowe w odkrywaj.',
  category: 'COMMUNITY',
  address: {
    city: 'Warszawa',
    street: 'Marszałkowska',
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
};

describe('Event management flow', () => {
  beforeEach(() => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        token: 'token-user-1',
        userId: 'user-1',
        expiresAt: '2099-01-01T00:00:00.000Z',
      }),
    );
    window.history.replaceState({}, '', '/app/events/create');
  });

  afterEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('validates required fields before creating an event', async () => {
    global.fetch = jest.fn() as typeof fetch;

    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: t('eventManagement.create.submit') }));

    expect(await screen.findByText(t('eventManagement.validation.title'))).toBeInTheDocument();
    expect(screen.getByText(t('eventManagement.validation.description'))).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('closes popup after selecting an address search result', async () => {
    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/events/geocode') && init?.method === 'POST') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            results: [
              {
                id: 'geo-1',
                label: 'Prosta 10, Warszawa',
                location: { lat: 52.2297, lng: 21.0122 },
                address: {
                  city: 'Warszawa',
                  street: 'Prosta',
                  buildingNumber: '10',
                  postalCode: '00-001',
                },
              },
            ],
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

    fireEvent.change(await screen.findByLabelText(t('eventManagement.form.title')), {
      target: { value: createdEventResponse.title },
    });
    fireEvent.change(screen.getByLabelText(t('eventManagement.form.description')), {
      target: { value: createdEventResponse.description },
    });
    fireEvent.change(screen.getByLabelText(t('eventManagement.form.date_time')), {
      target: { value: '2026-07-20T18:30' },
    });
    fireEvent.change(screen.getByLabelText(t('eventManagement.form.category')), {
      target: { value: 'TECH' },
    });
    fireEvent.focus(screen.getByLabelText(t('eventManagement.form.address')));
    fireEvent.change(screen.getByLabelText(t('eventManagement.form.address')), {
      target: { value: 'Prosta 10 Warszawa' },
    });
    const firstResult = await screen.findByRole('button', { name: 'Prosta 10, Warszawa' });
    fireEvent.click(firstResult);
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Prosta 10, Warszawa' })).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect((screen.getByLabelText(t('eventManagement.form.address')) as HTMLInputElement).value).toBe('Prosta 10, Warszawa');
    });
  });

  it('fills address field after picking point on map', async () => {
    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/events/reverse-geocode') && init?.method === 'POST') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            result: {
              id: 'geo-map-1',
              label: 'Marszałkowska 1, Warszawa',
              location: { lat: 52.25, lng: 21.0 },
              address: {
                city: 'Warszawa',
                street: 'Marszałkowska',
                buildingNumber: '1',
                postalCode: '00-001',
              },
            },
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

    fireEvent.focus(await screen.findByLabelText(t('eventManagement.form.address')));
    fireEvent.click(screen.getByRole('button', { name: 'mock-pick-map' }));

    await waitFor(() => {
      expect((screen.getByLabelText(t('eventManagement.form.address')) as HTMLInputElement).value).toBe('Marszałkowska 1, Warszawa');
    });
  });

  it('creates an event and keeps it consistent across my-events, discover and details', async () => {
    let authoredEvents: Array<typeof createdEventResponse> = [];

    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/events/geocode') && init?.method === 'POST') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            results: [
              {
                id: 'geo-1',
                label: 'Prosta 10, Warszawa',
                location: {
                  lat: createdEventResponse.location.lat,
                  lng: createdEventResponse.location.lng,
                },
                address: {
                  city: createdEventResponse.address.city,
                  street: createdEventResponse.address.street,
                  buildingNumber: createdEventResponse.address.buildingNumber,
                  postalCode: createdEventResponse.address.postalCode,
                },
              },
            ],
          }),
        } as Response;
      }

      if (url.endsWith('/api/events') && init?.method === 'POST') {
        authoredEvents = [createdEventResponse];
        return {
          ok: true,
          status: 201,
          json: async () => createdEventResponse,
        } as Response;
      }

      if (url.endsWith('/api/events/authored')) {
        return {
          ok: true,
          status: 200,
          json: async () => authoredEvents,
        } as Response;
      }

      if (url.includes('/api/discover/events/') && !url.includes('?')) {
        return {
          ok: true,
          status: 200,
          json: async () => createdEventResponse,
        } as Response;
      }

      if (url.includes('/api/discover/events')) {
        return {
          ok: true,
          status: 200,
          json: async () => [discoverSeedEvent, ...authoredEvents],
        } as Response;
      }

      return {
        ok: false,
        status: 404,
        json: async () => ({ message: 'not_found' }),
      } as Response;
    }) as typeof fetch;

    render(<App />);

    fireEvent.change(await screen.findByLabelText(t('eventManagement.form.title')), {
      target: { value: createdEventResponse.title },
    });
    fireEvent.change(screen.getByLabelText(t('eventManagement.form.description')), {
      target: { value: createdEventResponse.description },
    });
    fireEvent.change(screen.getByLabelText(t('eventManagement.form.date_time')), {
      target: { value: '2026-07-20T18:30' },
    });
    fireEvent.change(screen.getByLabelText(t('eventManagement.form.category')), {
      target: { value: 'TECH' },
    });
    fireEvent.focus(screen.getByLabelText(t('eventManagement.form.address')));
    fireEvent.change(screen.getByLabelText(t('eventManagement.form.address')), {
      target: { value: 'Prosta 10 Warszawa' },
    });
    fireEvent.click(await screen.findByRole('button', { name: 'Prosta 10, Warszawa' }));
    fireEvent.change(screen.getByLabelText(t('eventManagement.form.price_mode')), {
      target: { value: 'paid' },
    });
    fireEvent.change(screen.getByLabelText(t('eventManagement.form.price_amount')), {
      target: { value: String(createdEventResponse.price.amount) },
    });

    fireEvent.click(screen.getByRole('button', { name: t('eventManagement.create.submit') }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/app/my-events');
    });

    expect(await screen.findByRole('heading', { name: t('eventManagement.my_events.title') })).toBeInTheDocument();
    expect(await screen.findByText(createdEventResponse.title)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: t('eventManagement.my_events.details') }));

    expect(await screen.findByRole('heading', { name: createdEventResponse.title })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: t('discover.details.back') }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/app');
    });
    expect(await screen.findByRole('heading', { name: t('discover.title') })).toBeInTheDocument();
    expect(await screen.findByText(createdEventResponse.title)).toBeInTheDocument();
  });
});
