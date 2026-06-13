import { publicProfileSchema } from '../../pages/profile/dto/profileSchemas.ts';

describe('Friends mechanic contracts', () => {
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
});
