import { requestContract } from '../../../app/apiContractGateway.ts';
import type { GroupDetails } from '../domain/groupModels.ts';
import {
  groupDetailsSchema,
  groupMutationPayloadSchema,
  groupMutationResponseSchema,
} from '../dto/groupSchemas.ts';

const groupsHttpErrorKey = (status: number): string => {
  if (status === 401) {
    return 'groups.errors.unauthorized';
  }
  if (status === 404) {
    return 'groups.errors.not_found';
  }
  return 'groups.errors.fetch_failed';
};

const groupsMutationHttpErrorKey = (status: number, fallback: string): string => {
  if (status === 401) {
    return 'groups.errors.unauthorized';
  }
  if (status === 404) {
    return 'groups.errors.not_found';
  }
  if (status === 409) {
    return 'groups.errors.action_conflict';
  }
  return fallback;
};

export const fetchGroupDetailsRequest = async (
  groupId: string,
  token: string,
  signal: AbortSignal,
): Promise<GroupDetails> =>
  requestContract<never, GroupDetails>({
    url: `/api/groups/${groupId}`,
    token,
    signal,
    responseSchema: groupDetailsSchema,
    errorKeys: {
      requestValidation: 'groups.errors.request_invalid',
      responseValidation: 'groups.errors.response_invalid',
      network: 'groups.errors.network',
      http: groupsHttpErrorKey,
    },
  });

export const joinGroupRequest = async (
  groupId: string,
  token: string,
  signal: AbortSignal,
): Promise<{ ok: true }> =>
  requestContract<{ groupId: string }, { ok: true }>({
    url: '/api/groups/join',
    method: 'POST',
    payload: { groupId },
    payloadSchema: groupMutationPayloadSchema,
    token,
    signal,
    responseSchema: groupMutationResponseSchema,
    errorKeys: {
      requestValidation: 'groups.errors.request_invalid',
      responseValidation: 'groups.errors.response_invalid',
      network: 'groups.errors.network',
      http: (status: number) => groupsMutationHttpErrorKey(status, 'groups.errors.join_failed'),
    },
  });

export const leaveGroupRequest = async (
  groupId: string,
  token: string,
  signal: AbortSignal,
): Promise<{ ok: true }> =>
  requestContract<{ groupId: string }, { ok: true }>({
    url: '/api/groups/leave',
    method: 'POST',
    payload: { groupId },
    payloadSchema: groupMutationPayloadSchema,
    token,
    signal,
    responseSchema: groupMutationResponseSchema,
    errorKeys: {
      requestValidation: 'groups.errors.request_invalid',
      responseValidation: 'groups.errors.response_invalid',
      network: 'groups.errors.network',
      http: (status: number) => groupsMutationHttpErrorKey(status, 'groups.errors.leave_failed'),
    },
  });
