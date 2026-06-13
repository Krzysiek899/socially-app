import React from 'react';
import { useParams } from 'react-router-dom';
import { Stack } from '../../shared/layout/index.tsx';
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts';
import {
  acceptFriendRequest,
  fetchPublicProfile,
  rejectFriendRequest,
  sendFriendRequest,
  unfriendUser,
} from '../../redux/profile/profileSlice.ts';
import { t } from '../../i18n/index.ts';
import { PublicProfileGroupsCard } from './components/PublicProfileGroupsCard.tsx';
import { PublicProfileHero } from './components/PublicProfileHero.tsx';
import { PublicProfileMutualFriendsCard } from './components/PublicProfileMutualFriendsCard.tsx';
import { PublicProfileReviewsCard } from './components/PublicProfileReviewsCard.tsx';
import { ProfileSurface } from './components/ProfileSurface.tsx';

export const PublicProfilePage = (): React.JSX.Element => {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useAppDispatch();
  const { profile, status, errorKey } = useAppSelector((state) => state.profile.publicProfile);

  const loadProfile = React.useCallback(() => {
    if (!userId) {
      return;
    }

    void dispatch(fetchPublicProfile(userId));
  }, [dispatch, userId]);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSendRequest = React.useCallback(() => {
    if (!profile) {
      return;
    }
    void dispatch(sendFriendRequest(profile.id));
  }, [dispatch, profile]);

  const handleAcceptRequest = React.useCallback(() => {
    if (!profile) {
      return;
    }
    void dispatch(acceptFriendRequest(profile.id));
  }, [dispatch, profile]);

  const handleRejectRequest = React.useCallback(() => {
    if (!profile) {
      return;
    }
    void dispatch(rejectFriendRequest(profile.id));
  }, [dispatch, profile]);

  const handleUnfriend = React.useCallback(() => {
    if (!profile) {
      return;
    }
    void dispatch(unfriendUser(profile.id));
  }, [dispatch, profile]);

  return (
    <ProfileSurface
      heading={t('discover.nav.profile')}
      isContentReady={profile !== null}
      status={status}
      errorKey={userId ? errorKey : 'profile.errors.not_found'}
      onRetry={loadProfile}
    >
    {profile ? (
      <Stack gap="4">
        <PublicProfileHero
          profile={profile}
          onSendRequest={handleSendRequest}
          onAcceptRequest={handleAcceptRequest}
          onRejectRequest={handleRejectRequest}
          onUnfriend={handleUnfriend}
        />
        <div className="public-profile__content">
          <div className="public-profile__primary-column">
            <PublicProfileReviewsCard
              rating={profile.rating}
              reviewsCount={profile.reviewsCount}
              reviews={profile.reviews}
            />
          </div>
          <div className="public-profile__sidebar">
            <PublicProfileMutualFriendsCard friends={profile.mutualFriends} />
            <PublicProfileGroupsCard groups={profile.groups} />
          </div>
        </div>
      </Stack>
    ) : null}
    </ProfileSurface>
  );
};
