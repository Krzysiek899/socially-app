import { requestContract } from '../../../app/apiContractGateway.ts';
import type { MyProfile, PublicProfile } from '../domain/profileModels.ts';
import {
  friendMutationPayloadSchema,
  friendMutationResponseSchema,
  myProfileSchema,
  publicProfileSchema,
} from '../dto/profileSchemas.ts';

const profileHttpErrorKey = (status: number): string => {
  if (status === 401) {
    return 'profile.errors.unauthorized';
  }

  if (status === 404) {
    return 'profile.errors.not_found';
  }

  return 'profile.errors.fetch_failed';
};

const profileMutationHttpErrorKey = (status: number, fallback: string): string => {
  if (status === 401) {
    return 'profile.errors.unauthorized';
  }

  if (status === 404) {
    return 'profile.errors.not_found';
  }

  if (status === 409) {
    return 'profile.errors.friend_action_conflict';
  }

  return fallback;
};

export const fetchMyProfileRequest = async (
  token: string,
  signal: AbortSignal,
): Promise<MyProfile> =>
  requestContract<never, MyProfile>({
    url: '/api/profile/me',
    token,
    signal,
    responseSchema: myProfileSchema,
    errorKeys: {
      requestValidation: 'profile.errors.request_invalid',
      responseValidation: 'profile.errors.response_invalid',
      network: 'profile.errors.network',
      http: profileHttpErrorKey,
    },
  });

export const fetchPublicProfileRequest = async (
  userId: string,
  token: string,
  signal: AbortSignal,
): Promise<PublicProfile> =>
  requestContract<never, PublicProfile>({
    url: `/api/profile/users/${userId}`,
    token,
    signal,
    responseSchema: publicProfileSchema,
    errorKeys: {
      requestValidation: 'profile.errors.request_invalid',
      responseValidation: 'profile.errors.response_invalid',
      network: 'profile.errors.network',
      http: profileHttpErrorKey,
    },
  });

export const sendFriendRequestRequest = async (
  targetUserId: string,
  token: string,
  signal: AbortSignal,
): Promise<{ ok: true }> =>
  requestContract<{ targetUserId: string }, { ok: true }>({
    url: '/api/profile/friends/request',
    method: 'POST',
    payload: { targetUserId },
    payloadSchema: friendMutationPayloadSchema,
    token,
    signal,
    responseSchema: friendMutationResponseSchema,
    errorKeys: {
      requestValidation: 'profile.errors.request_invalid',
      responseValidation: 'profile.errors.response_invalid',
      network: 'profile.errors.network',
      http: (status: number) => profileMutationHttpErrorKey(status, 'profile.errors.friend_request_failed'),
    },
  });

export const acceptFriendRequestRequest = async (
  targetUserId: string,
  token: string,
  signal: AbortSignal,
): Promise<{ ok: true }> =>
  requestContract<{ targetUserId: string }, { ok: true }>({
    url: '/api/profile/friends/accept',
    method: 'POST',
    payload: { targetUserId },
    payloadSchema: friendMutationPayloadSchema,
    token,
    signal,
    responseSchema: friendMutationResponseSchema,
    errorKeys: {
      requestValidation: 'profile.errors.request_invalid',
      responseValidation: 'profile.errors.response_invalid',
      network: 'profile.errors.network',
      http: (status: number) => profileMutationHttpErrorKey(status, 'profile.errors.friend_accept_failed'),
    },
  });

export const rejectFriendRequestRequest = async (
  targetUserId: string,
  token: string,
  signal: AbortSignal,
): Promise<{ ok: true }> =>
  requestContract<{ targetUserId: string }, { ok: true }>({
    url: '/api/profile/friends/reject',
    method: 'POST',
    payload: { targetUserId },
    payloadSchema: friendMutationPayloadSchema,
    token,
    signal,
    responseSchema: friendMutationResponseSchema,
    errorKeys: {
      requestValidation: 'profile.errors.request_invalid',
      responseValidation: 'profile.errors.response_invalid',
      network: 'profile.errors.network',
      http: (status: number) => profileMutationHttpErrorKey(status, 'profile.errors.friend_reject_failed'),
    },
  });

export const unfriendUserRequest = async (
  targetUserId: string,
  token: string,
  signal: AbortSignal,
): Promise<{ ok: true }> =>
  requestContract<{ targetUserId: string }, { ok: true }>({
    url: '/api/profile/friends/unfriend',
    method: 'POST',
    payload: { targetUserId },
    payloadSchema: friendMutationPayloadSchema,
    token,
    signal,
    responseSchema: friendMutationResponseSchema,
    errorKeys: {
      requestValidation: 'profile.errors.request_invalid',
      responseValidation: 'profile.errors.response_invalid',
      network: 'profile.errors.network',
      http: (status: number) => profileMutationHttpErrorKey(status, 'profile.errors.friend_unfriend_failed'),
    },
  });
