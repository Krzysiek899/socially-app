import { z } from 'zod'; 
import { requestContract } from '../../../app/apiContractGateway.ts';

import type { MyProfile, PublicProfile, PublicProfileReview } from '../domain/profileModels.ts';

import { 
  myProfileSchema, 
  publicProfileSchema, 
  publicProfileReviewSchema, 
  type CreateReviewRequestDTO,
  type UpdateProfileRequestDTO 
} from '../dto/profileSchemas.ts';

const profileHttpErrorKey = (status: number): string => {
  if (status === 401) return 'profile.errors.unauthorized';
  if (status === 404) return 'profile.errors.not_found';
  return 'profile.errors.fetch_failed';
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

export const submitProfileReviewRequest = async (
  userId: string,
  payload: CreateReviewRequestDTO,
  token: string,
  signal: AbortSignal,
): Promise<PublicProfileReview> =>
  requestContract<CreateReviewRequestDTO, PublicProfileReview>({
    url: `/api/profile/users/${userId}/reviews`,
    method: 'POST', 
    payload, 
    token,
    signal,
    responseSchema: publicProfileReviewSchema,
    errorKeys: {
      requestValidation: 'profile.errors.request_invalid',
      responseValidation: 'profile.errors.response_invalid',
      network: 'profile.errors.network',
      http: profileHttpErrorKey,
    },
  });

export const updateMyProfileRequest = async (
  payload: UpdateProfileRequestDTO,
  token: string,
  signal: AbortSignal,
): Promise<MyProfile> =>
  requestContract<UpdateProfileRequestDTO, MyProfile>({
    url: '/api/profile/me',
    method: 'PATCH', 
    payload, 
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


export const approveMyProfileRequest = async (
  token: string,
  signal: AbortSignal,
): Promise<{ success: boolean; isApproved: boolean }> =>
  requestContract<never, { success: boolean; isApproved: boolean }>({
    url: '/api/profile/me/approve',
    method: 'PATCH', 
    token,
    signal,
    responseSchema: z.object({
      success: z.boolean(),
      isApproved: z.boolean()
    }),
    errorKeys: {
      requestValidation: 'profile.errors.request_invalid',
      responseValidation: 'profile.errors.response_invalid',
      network: 'profile.errors.network',
      http: profileHttpErrorKey,
    },
  });