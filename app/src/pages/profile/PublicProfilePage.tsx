import React from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Stack } from '../../shared/layout/index.tsx';
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts';
import { Button, useNotifications } from '../../shared/components/index.ts';
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
import { useSmartBack } from '../../shared/hooks/useSmartBack.ts';

export const PublicProfilePage = (): React.JSX.Element => {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useAppDispatch();
  const { notify } = useNotifications();
  const { profile, status, errorKey } = useAppSelector((state) => state.profile.publicProfile);
  const goBack = useSmartBack('/discover');

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
    void dispatch(sendFriendRequest(profile.id))
      .unwrap()
      .catch((errorKeyFromApi: unknown) => {
        notify({
          variant: 'error',
          message: t(
            typeof errorKeyFromApi === 'string'
              ? errorKeyFromApi
              : 'profile.errors.friend_request_failed',
          ),
        });
      });
  }, [dispatch, notify, profile]);

  const handleAcceptRequest = React.useCallback(() => {
    if (!profile) {
      return;
    }
    void dispatch(acceptFriendRequest(profile.id))
      .unwrap()
      .catch((errorKeyFromApi: unknown) => {
        notify({
          variant: 'error',
          message: t(
            typeof errorKeyFromApi === 'string'
              ? errorKeyFromApi
              : 'profile.errors.friend_accept_failed',
          ),
        });
      });
  }, [dispatch, notify, profile]);

  const handleRejectRequest = React.useCallback(() => {
    if (!profile) {
      return;
    }
    void dispatch(rejectFriendRequest(profile.id))
      .unwrap()
      .catch((errorKeyFromApi: unknown) => {
        notify({
          variant: 'error',
          message: t(
            typeof errorKeyFromApi === 'string'
              ? errorKeyFromApi
              : 'profile.errors.friend_reject_failed',
          ),
        });
      });
  }, [dispatch, notify, profile]);

  const handleUnfriend = React.useCallback(() => {
    if (!profile) {
      return;
    }
    void dispatch(unfriendUser(profile.id))
      .unwrap()
      .catch((errorKeyFromApi: unknown) => {
        notify({
          variant: 'error',
          message: t(
            typeof errorKeyFromApi === 'string'
              ? errorKeyFromApi
              : 'profile.errors.friend_unfriend_failed',
          ),
        });
      });
  }, [dispatch, notify, profile]);

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
        <div style={{ paddingBottom: '0.25rem' }}>
          <Button type="button" variant="secondary" size="sm" onClick={goBack}>
            <ArrowLeft size={16} style={{ marginRight: '6px' }} />
            {t('common.back')}
          </Button>
        </div>

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
