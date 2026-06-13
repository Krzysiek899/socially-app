import React from 'react';
import { BookOpen, CodeXml, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, useNotifications } from '../../shared/components/index.ts';
import { Cluster, Grid } from '../../shared/layout/index.tsx';
import { logout } from '../../redux/auth/authSlice.ts';
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts';
import {
  acceptFriendRequest,
  fetchMyProfile,
  rejectFriendRequest,
  unfriendUser,
} from '../../redux/profile/profileSlice.ts';
import { t } from '../../i18n/index.ts';
import { MyProfileHero } from './components/MyProfileHero.tsx';
import { MyProfileListCard, MyProfileListRow } from './components/MyProfileListCard.tsx';
import { ProfileSurface } from './components/ProfileSurface.tsx';

export const MyProfilePage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notify } = useNotifications();
  const [showAllGroups, setShowAllGroups] = React.useState(false);
  const { profile, status, errorKey } = useAppSelector((state) => state.profile.myProfile);

  const loadProfile = React.useCallback(() => {
    void dispatch(fetchMyProfile());
  }, [dispatch]);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  React.useEffect(() => {
    setShowAllGroups(false);
  }, [profile?.id]);

  const handleLogout = React.useCallback(() => {
    dispatch(logout());
    navigate('/login', { replace: true });
  }, [dispatch, navigate]);

  const handleUnfriend = React.useCallback((targetUserId: string) => {
    void dispatch(unfriendUser(targetUserId))
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

  const friendRows = React.useMemo(
    () => profile?.friends.map((friend) => (
      <MyProfileListRow
        key={friend.id}
        leading={<Avatar name={friend.displayName} src={friend.avatarUrl} size="sm" />}
        label={friend.displayName}
        action={(
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleUnfriend(friend.id)}
          >
            {t('profile.actions.unfriend')}
          </Button>
        )}
      />
    )) ?? [],
    [handleUnfriend, profile],
  );

  const incomingRequestRows = React.useMemo(
    () => profile?.incomingRequests.map((request) => (
      <MyProfileListRow
        key={request.id}
        leading={<Avatar name={request.displayName} src={request.avatarUrl} size="sm" />}
        label={request.displayName}
        action={(
          <Cluster gap="2" align="center">
            <Button
              type="button"
              size="sm"
              onClick={() => handleAcceptRequest(request.id)}
            >
              {t('profile.actions.accept_request')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => handleRejectRequest(request.id)}
            >
              {t('profile.actions.reject_request')}
            </Button>
          </Cluster>
        )}
      />
    )) ?? [],
    [handleAcceptRequest, handleRejectRequest, profile],
  );

  const visibleGroups = React.useMemo(() => {
    if (!profile) {
      return [];
    }

    return showAllGroups ? profile.groups : profile.groups.slice(0, 3);
  }, [profile, showAllGroups]);

  const groupRows = React.useMemo(
    () => visibleGroups.map((group) => {
      const icon = group.iconKey === 'sport'
        ? <UsersRound size={18} aria-hidden="true" />
        : group.iconKey === 'book'
          ? <BookOpen size={18} aria-hidden="true" />
          : <CodeXml size={18} aria-hidden="true" />;

      return (
        <MyProfileListRow
          key={group.id}
          leading={<span className={`my-profile__group-icon my-profile__group-icon--${group.iconKey}`}>{icon}</span>}
          label={group.name}
          onClick={() => navigate(`/app/groups/${group.id}`)}
        />
      );
    }),
    [navigate, visibleGroups],
  );

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
          <MyProfileHero profile={profile} onLogout={handleLogout} />
          <Grid columns={2} gap="3">
            <MyProfileListCard
              title={t('profile.my.friends')}
              totalCount={profile.friendsCount}
              countLabel={`${profile.friendsCount} ${t('profile.my.friends_count')}`}
              items={friendRows}
              emptyText={t('profile.my.empty_friends')}
              ctaLabel={t('profile.my.show_all_friends')}
            />
            <MyProfileListCard
              title={t('profile.my.groups')}
              totalCount={profile.groupsCount}
              countLabel={`${profile.groupsCount} ${t('profile.my.groups_count')}`}
              items={groupRows}
              emptyText={t('profile.my.empty_groups')}
              ctaLabel={profile.groups.length > 3 && !showAllGroups ? t('profile.my.show_all_groups') : undefined}
              onCtaClick={() => setShowAllGroups(true)}
            />
            <MyProfileListCard
              title={t('profile.my.incoming_requests')}
              countLabel={`${profile.incomingRequests.length}`}
              items={incomingRequestRows}
              emptyText={t('profile.my.empty_incoming_requests')}
            />
          </Grid>
        </React.Fragment>
      ) : null}
    </ProfileSurface>
  );
};
