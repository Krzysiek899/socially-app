import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, useNotifications } from '../../shared/components/index.ts';
import { Cluster, Split, Stack } from '../../shared/layout/index.tsx';
import { logout } from '../../redux/auth/authSlice.ts';
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts';
import {
  acceptFriendRequest,
  approveMyProfile,
  fetchMyProfile,
  rejectFriendRequest,
  updateMyProfile,
} from '../../redux/profile/profileSlice.ts';
import { t } from '../../i18n/index.ts';
import { MyProfileHero } from './components/MyProfileHero.tsx';
import { MyProfileListCard, MyProfileListRow } from './components/MyProfileListCard.tsx';
import { PublicProfileGroupsCard } from './components/PublicProfileGroupsCard.tsx';
import { ProfileSurface } from './components/ProfileSurface.tsx';
import { EditProfileDialog } from './components/EditProfileDialog.tsx';
import type { UpdateProfileRequestDTO } from './dto/profileSchemas.ts';

export const MyProfilePage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notify } = useNotifications();
  const { profile, status, errorKey } = useAppSelector((state) => state.profile.myProfile);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const loadProfile = React.useCallback(() => {
    void dispatch(fetchMyProfile());
  }, [dispatch]);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleLogout = React.useCallback(() => {
    void dispatch(logout());
    navigate('/login', { replace: true });
  }, [dispatch, navigate]);

  const handleSaveProfile = React.useCallback((data: UpdateProfileRequestDTO) => {
    void dispatch(updateMyProfile(data));
    setIsEditDialogOpen(false);
  }, [dispatch]);

  const handleApproveProfile = React.useCallback(() => {
    void dispatch(approveMyProfile())
      .unwrap()
      .catch((errorKeyFromApi: unknown) => {
        notify({
          variant: 'error',
          message: t(
            typeof errorKeyFromApi === 'string'
              ? errorKeyFromApi
              : 'profile.errors.approve_failed',
          ),
        });
      });
  }, [dispatch, notify]);

  const handleAcceptRequest = React.useCallback((targetUserId: string) => {
    void dispatch(acceptFriendRequest(targetUserId))
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
  }, [dispatch, notify]);

  const handleRejectRequest = React.useCallback((targetUserId: string) => {
    void dispatch(rejectFriendRequest(targetUserId))
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
  }, [dispatch, notify]);

  const handleViewProfile = React.useCallback((targetUserId: string) => {
    navigate(`/users/${targetUserId}`);
  }, [navigate]);

  const friendRows = React.useMemo(
    () => profile?.friends.map((friend) => (
      <MyProfileListRow
        key={friend.id}
        leading={<Avatar name={friend.displayName} src={friend.avatarUrl} size="sm" />}
        label={friend.displayName}
        onClick={() => handleViewProfile(friend.id)}
      />
    )) ?? [],
    [handleViewProfile, profile],
  );

  const incomingRequestRows = React.useMemo(
    () => profile?.incomingRequests.map((request) => (
      <MyProfileListRow
        key={request.id}
        leading={<Avatar name={request.displayName} src={request.avatarUrl} size="sm" />}
        label={request.displayName}
        onClick={() => handleViewProfile(request.id)}
        action={(
          <Cluster gap="2" align="center" className="my-profile__row-actions">
            <Button
              type="button"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                handleAcceptRequest(request.id);
              }}
            >
              {t('profile.actions.accept_request')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={(event) => {
                event.stopPropagation();
                handleRejectRequest(request.id);
              }}
            >
              {t('profile.actions.reject_request')}
            </Button>
          </Cluster>
        )}
      />
    )) ?? [],
    [handleAcceptRequest, handleRejectRequest, handleViewProfile, profile],
  );

  const sharedGroups = React.useMemo(() => {
    if (!profile) {
      return [];
    }

    return profile.groups.map((group) => ({
      id: group.id,
      name: group.name,
      meta: '',
      iconKey: group.iconKey,
      membersCount: group.membersCount,
    }));
  }, [profile]);

  return (
    <ProfileSurface
      heading={t('profile.my.title')}
      isContentReady={profile !== null}
      status={status}
      errorKey={errorKey}
      onRetry={loadProfile}
    >
      {profile ? (
        <React.Fragment>
          <MyProfileHero
            profile={profile}
            onLogout={handleLogout}
            onEdit={() => setIsEditDialogOpen(true)}
            onApprove={handleApproveProfile}
          />
          <Split fraction="1/2" gap="3">
            <Stack gap="3">
              <MyProfileListCard
                title={t('profile.my.friends')}
                totalCount={profile.friendsCount}
                countLabel={`(${profile.friendsCount})`}
                items={friendRows}
                emptyText={t('profile.my.empty_friends')}
                ctaLabel={t('profile.my.show_all_friends')}
              />
              <MyProfileListCard
                title={t('profile.my.incoming_requests')}
                countLabel={`(${profile.incomingRequests.length})`}
                items={incomingRequestRows}
                emptyText={t('profile.my.empty_incoming_requests')}
              />
            </Stack>
            <PublicProfileGroupsCard groups={sharedGroups} />
          </Split>

          <EditProfileDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSave={handleSaveProfile}
            initialData={{
              displayName: profile.displayName,
              bio: profile.bio,
            }}
          />
        </React.Fragment>
      ) : null}
    </ProfileSurface>
  );
};
