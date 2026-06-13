import { requestContract } from '../../../app/apiContractGateway.ts';
import type { AuthoredEvent, CreateEventPayload, GeocodeResult } from '../domain/eventManagementModels.ts';
import {
  authoredEventResponseSchema,
  authoredEventsResponseSchema,
  createEventPayloadSchema,
  createEventResponseSchema,
  geocodeSearchPayloadSchema,
  geocodeSearchResponseSchema,
  handleJoinRequestPayloadSchema,
  reverseGeocodePayloadSchema,
  reverseGeocodeResponseSchema,
  joinEventResponseSchema,
  leaveEventResponseSchema,
  participatingEventsResponseSchema,
  updateJoinRulesPayloadSchema,
  updateAuthoredEventPayloadSchema,
} from '../dto/eventManagementSchemas.ts';
import type {
  HandleJoinRequestPayload,
  JoinRequestAction,
  ParticipatingEvent,
  ParticipationState,
  UpdateJoinRulesPayload,
  UpdateAuthoredEventPayload,
} from '../domain/eventManagementModels.ts';

const resolveHttpErrorKey = (status: number, fallback: string): string => {
  if (status === 401) {
    return 'eventManagement.errors.unauthorized';
  }

  if (status === 400) {
    return 'eventManagement.errors.request_invalid';
  }

  if (status === 403) {
    return 'eventManagement.errors.forbidden';
  }

  if (status === 404) {
    return 'eventManagement.errors.not_found';
  }

  if (status === 409) {
    return 'eventManagement.errors.capacity_invalid';
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

export const fetchAuthoredEventRequest = async (
  eventId: string,
  token: string,
  signal: AbortSignal,
): Promise<AuthoredEvent> =>
  requestContract<never, AuthoredEvent>({
    url: `/api/events/authored/${eventId}`,
    token,
    signal,
    responseSchema: authoredEventResponseSchema,
    errorKeys: {
      requestValidation: 'eventManagement.errors.request_invalid',
      responseValidation: 'eventManagement.errors.response_invalid',
      network: 'eventManagement.errors.network',
      http: (status: number) => resolveHttpErrorKey(status, 'eventManagement.errors.fetch_failed'),
    },
  });

export const updateAuthoredEventRequest = async (
  eventId: string,
  payload: UpdateAuthoredEventPayload,
  token: string,
  signal: AbortSignal,
): Promise<AuthoredEvent> =>
  requestContract<UpdateAuthoredEventPayload, AuthoredEvent>({
    url: `/api/events/authored/${eventId}`,
    method: 'PATCH',
    payload,
    payloadSchema: updateAuthoredEventPayloadSchema,
    token,
    signal,
    responseSchema: authoredEventResponseSchema,
    errorKeys: {
      requestValidation: 'eventManagement.errors.request_invalid',
      responseValidation: 'eventManagement.errors.response_invalid',
      network: 'eventManagement.errors.network',
      http: (status: number) => resolveHttpErrorKey(status, 'eventManagement.errors.update_failed'),
    },
  });

export const updateJoinRulesRequest = async (
  eventId: string,
  payload: UpdateJoinRulesPayload,
  token: string,
  signal: AbortSignal,
): Promise<AuthoredEvent> =>
  requestContract<UpdateJoinRulesPayload, AuthoredEvent>({
    url: `/api/events/authored/${eventId}/join-rules`,
    method: 'PATCH',
    payload,
    payloadSchema: updateJoinRulesPayloadSchema,
    token,
    signal,
    responseSchema: authoredEventResponseSchema,
    errorKeys: {
      requestValidation: 'eventManagement.errors.request_invalid',
      responseValidation: 'eventManagement.errors.response_invalid',
      network: 'eventManagement.errors.network',
      http: (status: number) => resolveHttpErrorKey(status, 'eventManagement.errors.rules_update_failed'),
    },
  });

export const handleJoinRequestActionRequest = async (
  eventId: string,
  requestId: string,
  action: JoinRequestAction,
  token: string,
  signal: AbortSignal,
): Promise<AuthoredEvent> =>
  requestContract<HandleJoinRequestPayload, AuthoredEvent>({
    url: `/api/events/authored/${eventId}/requests/${requestId}`,
    method: 'POST',
    payload: { action },
    payloadSchema: handleJoinRequestPayloadSchema,
    token,
    signal,
    responseSchema: authoredEventResponseSchema,
    errorKeys: {
      requestValidation: 'eventManagement.errors.request_invalid',
      responseValidation: 'eventManagement.errors.response_invalid',
      network: 'eventManagement.errors.network',
      http: (status: number) => resolveHttpErrorKey(status, 'eventManagement.errors.request_action_failed'),
    },
  });

export const fetchParticipatingEventsRequest = async (
  token: string,
  signal: AbortSignal,
): Promise<ParticipatingEvent[]> =>
  requestContract<never, ParticipatingEvent[]>({
    url: '/api/events/participating',
    token,
    signal,
    responseSchema: participatingEventsResponseSchema,
    errorKeys: {
      requestValidation: 'eventManagement.errors.request_invalid',
      responseValidation: 'eventManagement.errors.response_invalid',
      network: 'eventManagement.errors.network',
      http: (status: number) => resolveHttpErrorKey(status, 'eventManagement.errors.fetch_failed'),
    },
  });

export const joinEventRequest = async (
  eventId: string,
  token: string,
  signal: AbortSignal,
): Promise<{ state: ParticipationState }> =>
  requestContract<never, { state: ParticipationState }>({
    url: `/api/events/${eventId}/join`,
    method: 'POST',
    token,
    signal,
    responseSchema: joinEventResponseSchema,
    errorKeys: {
      requestValidation: 'eventManagement.errors.request_invalid',
      responseValidation: 'eventManagement.errors.response_invalid',
      network: 'eventManagement.errors.network',
      http: (status: number) => resolveHttpErrorKey(status, 'eventManagement.errors.join_failed'),
    },
  });

export const leaveEventRequest = async (
  eventId: string,
  token: string,
  signal: AbortSignal,
): Promise<{ ok: true }> =>
  requestContract<never, { ok: true }>({
    url: `/api/events/${eventId}/participation`,
    method: 'DELETE',
    token,
    signal,
    responseSchema: leaveEventResponseSchema,
    errorKeys: {
      requestValidation: 'eventManagement.errors.request_invalid',
      responseValidation: 'eventManagement.errors.response_invalid',
      network: 'eventManagement.errors.network',
      http: (status: number) => resolveHttpErrorKey(status, 'eventManagement.errors.leave_failed'),
    },
  });
