import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import { groupMutationPayloadSchema } from '../../pages/groups/dto/groupSchemas.ts';
import { getAuthorizedUserId } from '../auth/getAuthorizedUserId.ts';
import { getGroupDetailsForUser, joinGroup, leaveGroup } from '../profile/store.ts';

export const groupsHandlers = [
  http.get('/api/groups/:groupId', ({ request, params }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    const groupId = typeof params.groupId === 'string' ? params.groupId : '';
    const details = getGroupDetailsForUser(userId, groupId);
    if (!details) {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    return HttpResponse.json(details, { status: 200 });
  }),
  http.post('/api/groups/join', async ({ request }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    try {
      const payload = groupMutationPayloadSchema.parse(await request.json());
      const result = joinGroup(userId, payload.groupId);
      if (result.type === 'not_found') {
        return HttpResponse.json({ message: 'not_found' }, { status: 404 });
      }
      if (result.type === 'conflict') {
        return HttpResponse.json({ message: 'conflict' }, { status: 409 });
      }

      return HttpResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return HttpResponse.json({ message: 'request_invalid' }, { status: 400 });
      }
      return HttpResponse.json({ message: 'request_invalid' }, { status: 400 });
    }
  }),
  http.post('/api/groups/leave', async ({ request }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    try {
      const payload = groupMutationPayloadSchema.parse(await request.json());
      const result = leaveGroup(userId, payload.groupId);
      if (result.type === 'not_found') {
        return HttpResponse.json({ message: 'not_found' }, { status: 404 });
      }
      if (result.type === 'conflict') {
        return HttpResponse.json({ message: 'conflict' }, { status: 409 });
      }

      return HttpResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return HttpResponse.json({ message: 'request_invalid' }, { status: 400 });
      }
      return HttpResponse.json({ message: 'request_invalid' }, { status: 400 });
    }
  }),
];
