import { requestContract } from '../../app/apiContractGateway.ts';
import type { DiscoverEvent, DiscoverFilters } from './discoverContracts.ts';
import { discoverEventSchema, discoverEventsResponseSchema } from './discoverContracts.ts';

const toQueryString = (filters: DiscoverFilters): string => {
  const params = new URLSearchParams();

  if (filters.searchQuery.trim().length > 0) {
    params.set('q', filters.searchQuery.trim());
  }

  for (const category of filters.categories) {
    params.append('category', category);
  }

  if (filters.price !== 'all') {
    params.set('price', filters.price);
  }

  if (filters.dateFrom) {
    params.set('dateFrom', filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set('dateTo', filters.dateTo);
  }

  return params.toString();
};

const discoverHttpErrorKey = (status: number): string => {
  if (status === 401) {
    return 'discover.errors.unauthorized';
  }

  return 'discover.errors.fetch_failed';
};

export const fetchDiscoverEventsRequest = async (
  filters: DiscoverFilters,
  token: string,
  signal: AbortSignal,
): Promise<DiscoverEvent[]> => {
  const query = toQueryString(filters);
  const url = query ? `/api/discover/events?${query}` : '/api/discover/events';

  return requestContract<never, DiscoverEvent[]>({
    url,
    token,
    signal,
    responseSchema: discoverEventsResponseSchema,
    errorKeys: {
      requestValidation: 'discover.errors.request_invalid',
      responseValidation: 'discover.errors.response_invalid',
      network: 'discover.errors.network',
      http: discoverHttpErrorKey,
    },
  });
};

export const fetchDiscoverEventByIdRequest = async (
  eventId: string,
  token: string,
  signal: AbortSignal,
): Promise<DiscoverEvent> =>
  requestContract<never, DiscoverEvent>({
    url: `/api/discover/events/${eventId}`,
    token,
    signal,
    responseSchema: discoverEventSchema,
    errorKeys: {
      requestValidation: 'discover.errors.request_invalid',
      responseValidation: 'discover.errors.response_invalid',
      network: 'discover.errors.network',
      http: (status: number) => {
        if (status === 404) {
          return 'discover.errors.not_found';
        }

        return discoverHttpErrorKey(status);
      },
    },
  });
