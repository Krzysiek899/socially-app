import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from '../../App.tsx';
import { publicProfileSchema } from '../../pages/profile/dto/profileSchemas.ts';
import {
  acceptFriendRequest,
  getMyProfileForUser,
  getPublicProfileForUser,
  resetProfileStore,
  sendFriendRequest,
  unfriendUsers,
} from '../../mocks/profile/store.ts';

const SESSION_KEY = 'auth.session.v1';

describe('Friends mechanic contracts', () => {
  beforeEach(() => {
    resetProfileStore();
  });

  it('accepts respond_to_request as a valid public profile friend action', () => {
    const payload = {
      id: 'org-anna',
      displayName: 'Anna Wójcik',
      badge: 'Świetny organizator',
      bio: 'Bio',
      rating: 4.8,
      reviewsCount: 0,
      reviews: [],
      mutualFriends: [],
      groups: [],
      friendAction: 'respond_to_request',
    };

    expect(() => publicProfileSchema.parse(payload)).not.toThrow();
  });

  it('transitions relation state from none to pending to friends and back to none', () => {
    const initialPublicProfile = getPublicProfileForUser('user-1', 'org-dawid');
    expect(initialPublicProfile?.friendAction).toBe('friends');

    expect(unfriendUsers('user-1', 'org-dawid').type).toBe('ok');
    const afterUnfriend = getPublicProfileForUser('user-1', 'org-dawid');
    expect(afterUnfriend?.friendAction).toBe('can_send_request');

    expect(sendFriendRequest('user-1', 'org-dawid').type).toBe('ok');
    const afterSend = getPublicProfileForUser('user-1', 'org-dawid');
    expect(afterSend?.friendAction).toBe('request_sent');

    expect(acceptFriendRequest('org-dawid', 'user-1').type).toBe('ok');
    const afterAccept = getPublicProfileForUser('user-1', 'org-dawid');
    expect(afterAccept?.friendAction).toBe('friends');
  });

  it('computes mutual friends as intersection of viewer and target friendships', () => {
    expect(unfriendUsers('user-1', 'org-dawid').type).toBe('ok');
    const withoutMutuals = getPublicProfileForUser('user-1', 'org-anna');
    expect(withoutMutuals?.mutualFriends).toHaveLength(0);

    expect(sendFriendRequest('user-1', 'org-dawid').type).toBe('ok');
    expect(acceptFriendRequest('org-dawid', 'user-1').type).toBe('ok');

    const withMutuals = getPublicProfileForUser('user-1', 'org-anna');
    expect(withMutuals?.mutualFriends.map((friend) => friend.id)).toContain('org-dawid');
  });

  it('derives incoming requests list from pending edges', () => {
    const myProfile = getMyProfileForUser('user-1');
    expect(myProfile?.incomingRequests.map((entry) => entry.id)).toContain('org-anna');
  });

  it('seeds Firebase users with preferred display name when available', () => {
    const myProfile = getMyProfileForUser('firebase-uid-123', 'Jan Kowalski');
    const publicProfile = getPublicProfileForUser('user-1', 'firebase-uid-123', 'Jan Kowalski');

    expect(myProfile?.displayName).toBe('Jan Kowalski');
    expect(publicProfile?.displayName).toBe('Jan Kowalski');
  });
});

describe('Friends mechanic UI integration', () => {
  beforeEach(() => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        token: 'token-user-1',
        userId: 'user-1',
        expiresAt: '2099-01-01T00:00:00.000Z',
      }),
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('renders respond_to_request actions and allows accepting request from public profile', async () => {
    window.history.replaceState({}, '', '/app/users/org-anna');
    let accepted = false;

    const myProfilePayload = () => ({
      id: 'user-1',
      displayName: 'Jan Kowalski',
      badge: 'Świetny organizator',
      avatarUrl: 'https://images.example.com/jan.png',
      bio: 'Bio',
      friendsCount: accepted ? 1 : 0,
      friends: accepted ? [{ id: 'org-anna', displayName: 'Anna Wójcik', avatarUrl: 'https://images.example.com/anna.png' }] : [],
      incomingRequests: [],
      groupsCount: 0,
      groups: [],
    });

    const publicProfilePayload = () => ({
      id: 'org-anna',
      displayName: 'Anna Wójcik',
      badge: 'Świetny organizator',
      avatarUrl: 'https://images.example.com/anna.png',
      bio: 'Bio',
      rating: 4.8,
      reviewsCount: 0,
      reviews: [],
      mutualFriends: [],
      groups: [],
      friendAction: accepted ? 'friends' : 'respond_to_request',
    });

    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.includes('/api/profile/friends/accept')) {
        accepted = true;
        return {
          ok: true,
          status: 200,
          json: async () => ({ ok: true }),
        } as Response;
      }

      if (url.includes('/api/profile/me')) {
        return {
          ok: true,
          status: 200,
          json: async () => myProfilePayload(),
        } as Response;
      }

      if (url.includes('/api/profile/users/org-anna')) {
        return {
          ok: true,
          status: 200,
          json: async () => publicProfilePayload(),
        } as Response;
      }

      return {
        ok: false,
        status: 404,
        json: async () => ({ message: 'not_found' }),
      } as Response;
    }) as typeof fetch;

    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Akceptuj zaproszenie' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Usuń znajomego' })).toBeInTheDocument();
    });
  });

  it('shows global toast when send request action fails', async () => {
    window.history.replaceState({}, '', '/app/users/org-anna');

    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.includes('/api/profile/friends/request')) {
        return {
          ok: false,
          status: 500,
          json: async () => ({ message: 'failed' }),
        } as Response;
      }

      if (url.includes('/api/profile/users/org-anna')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: 'org-anna',
            displayName: 'Anna Wójcik',
            badge: 'Świetny organizator',
            avatarUrl: 'https://images.example.com/anna.png',
            bio: 'Bio',
            rating: 4.8,
            reviewsCount: 0,
            reviews: [],
            mutualFriends: [],
            groups: [],
            friendAction: 'can_send_request',
          }),
        } as Response;
      }

      return {
        ok: true,
        status: 200,
        json: async () => ({
          id: 'user-1',
          displayName: 'Jan Kowalski',
          badge: 'Świetny organizator',
          avatarUrl: 'https://images.example.com/jan.png',
          bio: 'Bio',
          friendsCount: 0,
          friends: [],
          incomingRequests: [],
          groupsCount: 0,
          groups: [],
        }),
      } as Response;
    }) as typeof fetch;

    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Dodaj do znajomych' }));

    expect(await screen.findByLabelText('Notifications')).toBeInTheDocument();
    expect(await screen.findByText('Nie udało się wysłać zaproszenia do znajomych.')).toBeInTheDocument();
  });
});
