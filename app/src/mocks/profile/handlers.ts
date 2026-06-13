import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import { friendMutationPayloadSchema } from '../../pages/profile/dto/profileSchemas.ts';
import {
  acceptFriendRequest,
  getMyProfileForUser,
  getPublicProfileForUser,
  rejectFriendRequest,
  sendFriendRequest,
  unfriendUsers,
} from './store.ts';

const getAuthorizedUserId = (authorization: string | null): string | null => {
  if (!authorization?.startsWith('Bearer token-')) {
    return null;
  }

  return authorization.slice('Bearer token-'.length);
};

export const profileHandlers = [
  http.get('/api/profile/me', async ({ request }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    const profile = getMyProfileForUser(userId);
    if (!profile) {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    return HttpResponse.json(profile, { status: 200 });
  }),
  http.get('/api/profile/users/:userId', async ({ request, params }) => {
    const authorizedUserId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!authorizedUserId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    const requestedUserId = typeof params.userId === 'string' ? params.userId : '';
    const profile = getPublicProfileForUser(authorizedUserId, requestedUserId);
    if (!profile) {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    return HttpResponse.json(profile, { status: 200 });
  }),
  http.post('/api/profile/friends/request', async ({ request }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    let targetUserId = '';
    try {
      const payload = friendMutationPayloadSchema.parse(await request.json());
      targetUserId = payload.targetUserId;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return HttpResponse.json({ message: 'request_invalid' }, { status: 400 });
      }
      return HttpResponse.json({ message: 'request_invalid' }, { status: 400 });
    }

    const result = sendFriendRequest(userId, targetUserId);
    if (result.type === 'not_found') {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }
    if (result.type === 'conflict') {
      return HttpResponse.json({ message: 'conflict' }, { status: 409 });
    }

    return HttpResponse.json({ ok: true }, { status: 200 });
  }),
  http.post('/api/profile/friends/accept', async ({ request }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    let targetUserId = '';
    try {
      const payload = friendMutationPayloadSchema.parse(await request.json());
      targetUserId = payload.targetUserId;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return HttpResponse.json({ message: 'request_invalid' }, { status: 400 });
      }
      return HttpResponse.json({ message: 'request_invalid' }, { status: 400 });
    }

    const result = acceptFriendRequest(userId, targetUserId);
    if (result.type === 'not_found') {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }
    if (result.type === 'conflict') {
      return HttpResponse.json({ message: 'conflict' }, { status: 409 });
    }

    return HttpResponse.json({ ok: true }, { status: 200 });
  }),
  http.post('/api/profile/friends/reject', async ({ request }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    let targetUserId = '';
    try {
      const payload = friendMutationPayloadSchema.parse(await request.json());
      targetUserId = payload.targetUserId;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return HttpResponse.json({ message: 'request_invalid' }, { status: 400 });
      }
      return HttpResponse.json({ message: 'request_invalid' }, { status: 400 });
    }

    const result = rejectFriendRequest(userId, targetUserId);
    if (result.type === 'not_found') {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }
    if (result.type === 'conflict') {
      return HttpResponse.json({ message: 'conflict' }, { status: 409 });
    }

    return HttpResponse.json({ ok: true }, { status: 200 });
  }),
  http.post('/api/profile/friends/unfriend', async ({ request }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    let targetUserId = '';
    try {
      const payload = friendMutationPayloadSchema.parse(await request.json());
      targetUserId = payload.targetUserId;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return HttpResponse.json({ message: 'request_invalid' }, { status: 400 });
      }
      return HttpResponse.json({ message: 'request_invalid' }, { status: 400 });
    }

    const result = unfriendUsers(userId, targetUserId);
    if (result.type === 'not_found') {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }
    if (result.type === 'conflict') {
      return HttpResponse.json({ message: 'conflict' }, { status: 409 });
    }

    return HttpResponse.json({ ok: true }, { status: 200 });
  }),
];
