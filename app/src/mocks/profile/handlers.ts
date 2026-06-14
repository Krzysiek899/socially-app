import { http, HttpResponse } from 'msw';
import { friendMutationPayloadSchema } from '../../pages/profile/dto/profileSchemas.ts';
import { getAuthorizedUser, getAuthorizedUserId } from '../auth/getAuthorizedUserId.ts';
import {
  acceptFriendRequest,
  getMyProfileForUser,
  getPublicProfileForUser,
  rejectFriendRequest,
  sendFriendRequest,
  submitReview,
  unfriendUsers,
} from './store.ts';

export const profileHandlers = [
  http.get('/api/profile/me', async ({ request }) => {
    const authorizedUser = getAuthorizedUser(request.headers.get('authorization'));
    if (!authorizedUser) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    const profile = getMyProfileForUser(authorizedUser.userId, authorizedUser.displayName);
    if (!profile) {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    return HttpResponse.json(profile, { status: 200 });
  }),

  http.get('/api/profile/users/:userId', async ({ request, params }) => {
    const authorizedUser = getAuthorizedUser(request.headers.get('authorization'));
    if (!authorizedUser) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    const requestedUserId = typeof params.userId === 'string' ? params.userId : '';
    const profile = getPublicProfileForUser(
      authorizedUser.userId,
      requestedUserId,
      authorizedUser.displayName,
    );
    if (!profile) {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    const sanitizedProfile = {
      ...profile,
      reviews: profile.reviews.filter(
        (review) => review.content && review.content.trim().length > 0
      ),
    };

    return HttpResponse.json(sanitizedProfile, { status: 200 });
  }),

  http.post('/api/profile/users/:userId/reviews', async ({ request, params }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    const targetUserId = typeof params.userId === 'string' ? params.userId : '';

    let payload: { rating: number; content: string };
    try {
      payload = (await request.json()) as { rating: number; content: string };
    } catch {
      return HttpResponse.json({ message: 'request_invalid' }, { status: 400 });
    }

    const result = submitReview(userId, targetUserId, payload.rating, payload.content);
    if (result.type === 'not_found') {
      return HttpResponse.json({ message: 'not_found' }, { status: 404 });
    }

    if (result.type === 'ok' && 'review' in result) {
      const statusCode = result.review.publishedAtLabel === 'Przed chwilą' ? 201 : 200;
      return HttpResponse.json(result.review, { status: statusCode });
    }

    return HttpResponse.json({ message: 'error' }, { status: 500 });
  }),
  http.post('/api/profile/friends/request', async ({ request }) => {
    const userId = getAuthorizedUserId(request.headers.get('authorization'));
    if (!userId) {
      return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    let targetUserId: string;
    try {
      const payload = friendMutationPayloadSchema.parse(await request.json());
      targetUserId = payload.targetUserId;
    } catch {
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

    let targetUserId: string;
    try {
      const payload = friendMutationPayloadSchema.parse(await request.json());
      targetUserId = payload.targetUserId;
    } catch {
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

    let targetUserId: string;
    try {
      const payload = friendMutationPayloadSchema.parse(await request.json());
      targetUserId = payload.targetUserId;
    } catch {
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

    let targetUserId: string;
    try {
      const payload = friendMutationPayloadSchema.parse(await request.json());
      targetUserId = payload.targetUserId;
    } catch {
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
