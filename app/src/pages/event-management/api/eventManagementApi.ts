import { requestContract } from '../../../app/apiContractGateway.ts';
import type { AuthoredEvent, CreateEventPayload, GeocodeResult } from '../domain/eventManagementModels.ts';
import {
  authoredEventsResponseSchema,
  createEventPayloadSchema,
  createEventResponseSchema,
  geocodeSearchPayloadSchema,
  geocodeSearchResponseSchema,
  reverseGeocodePayloadSchema,
  reverseGeocodeResponseSchema,
} from '../dto/eventManagementSchemas.ts';

const resolveHttpErrorKey = (status: number, fallback: string): string => {
  if (status === 401) {
    return 'eventManagement.errors.unauthorized';
  }

  if (status === 400) {
    return 'eventManagement.errors.request_invalid';
  }

  return fallback;
};

export const fetchAuthoredEventsRequest = async (
  token: string,
  signal: AbortSignal,
): Promise<AuthoredEvent[]> =>
  requestContract<never, AuthoredEvent[]>({
    url: '/api/events/authored',
    token,
    signal,
    responseSchema: authoredEventsResponseSchema,
    errorKeys: {
      requestValidation: 'eventManagement.errors.request_invalid',
      responseValidation: 'eventManagement.errors.response_invalid',
      network: 'eventManagement.errors.network',
      http: (status: number) => resolveHttpErrorKey(status, 'eventManagement.errors.fetch_failed'),
    },
  });

export const createAuthoredEventRequest = async (
  payload: CreateEventPayload,
  token: string,
  signal: AbortSignal,
): Promise<AuthoredEvent> =>
  requestContract<CreateEventPayload, AuthoredEvent>({
    url: '/api/events',
    method: 'POST',
    payload,
    payloadSchema: createEventPayloadSchema,
    token,
    signal,
    responseSchema: createEventResponseSchema,
    errorKeys: {
      requestValidation: 'eventManagement.errors.request_invalid',
      responseValidation: 'eventManagement.errors.response_invalid',
      network: 'eventManagement.errors.network',
      http: (status: number) => resolveHttpErrorKey(status, 'eventManagement.errors.create_failed'),
    },
  });

export const searchEventAddressRequest = async (
  query: string,
  token: string,
  signal: AbortSignal,
): Promise<GeocodeResult[]> =>
  requestContract<{ query: string }, { results: GeocodeResult[] }>({
    url: '/api/events/geocode',
    method: 'POST',
    payload: { query },
    payloadSchema: geocodeSearchPayloadSchema,
    token,
    signal,
    responseSchema: geocodeSearchResponseSchema,
    errorKeys: {
      requestValidation: 'eventManagement.errors.request_invalid',
      responseValidation: 'eventManagement.errors.response_invalid',
      network: 'eventManagement.errors.network',
      http: (status: number) => {
        if (status === 404) {
          return 'eventManagement.errors.location_not_found';
        }

        return resolveHttpErrorKey(status, 'eventManagement.errors.fetch_failed');
      },
    },
  }).then((response) => response.results);

export const reverseEventAddressRequest = async (
  location: { lat: number; lng: number },
  token: string,
  signal: AbortSignal,
): Promise<GeocodeResult> =>
  requestContract<{ lat: number; lng: number }, { result: GeocodeResult }>({
    url: '/api/events/reverse-geocode',
    method: 'POST',
    payload: location,
    payloadSchema: reverseGeocodePayloadSchema,
    token,
    signal,
    responseSchema: reverseGeocodeResponseSchema,
    errorKeys: {
      requestValidation: 'eventManagement.errors.request_invalid',
      responseValidation: 'eventManagement.errors.response_invalid',
      network: 'eventManagement.errors.network',
      http: (status: number) => {
        if (status === 404) {
          return 'eventManagement.errors.location_not_found';
        }

        return resolveHttpErrorKey(status, 'eventManagement.errors.fetch_failed');
      },
    },
  }).then((response) => response.result);
