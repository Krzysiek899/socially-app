import { requestContract } from '../../../app/apiContractGateway.ts';
import type { MyProfile, PublicProfile } from '../domain/profileModels.ts';
import { myProfileSchema, publicProfileSchema } from '../dto/profileSchemas.ts';

const profileHttpErrorKey = (status: number): string => {
  if (status === 401) {
    return 'profile.errors.unauthorized';
  }

  if (status === 404) {
    return 'profile.errors.not_found';
  }

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
