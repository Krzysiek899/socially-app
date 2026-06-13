import { publicProfileSchema } from '../../pages/profile/dto/profileSchemas.ts';
import {
  acceptFriendRequest,
  getMyProfileForUser,
  getPublicProfileForUser,
  resetProfileStore,
  sendFriendRequest,
  unfriendUsers,
} from '../../mocks/profile/store.ts';

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
});
