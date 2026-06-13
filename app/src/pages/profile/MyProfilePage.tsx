import React from 'react';
import { BookOpen, CodeXml, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../shared/components/index.ts';
import { Grid } from '../../shared/layout/index.tsx';
import { logout } from '../../redux/auth/authSlice.ts';
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts';
import { fetchMyProfile } from '../../redux/profile/profileSlice.ts';
import { t } from '../../i18n/index.ts';
import { MyProfileHero } from './components/MyProfileHero.tsx';
import { MyProfileListCard, MyProfileListRow } from './components/MyProfileListCard.tsx';
import { ProfileSurface } from './components/ProfileSurface.tsx';

export const MyProfilePage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { profile, status, errorKey } = useAppSelector((state) => state.profile.myProfile);

  const loadProfile = React.useCallback(() => {
    void dispatch(fetchMyProfile());
  }, [dispatch]);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleLogout = React.useCallback(() => {
    dispatch(logout());
    navigate('/login', { replace: true });
  }, [dispatch, navigate]);

  const friendRows = React.useMemo(
    () => profile?.friends.map((friend) => (
      <MyProfileListRow
        key={friend.id}
        leading={<Avatar name={friend.displayName} src={friend.avatarUrl} size="sm" />}
        label={friend.displayName}
      />
    )) ?? [],
    [profile],
  );

  const groupRows = React.useMemo(
    () => profile?.groups.map((group) => {
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
        />
      );
    }) ?? [],
    [profile],
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
              countLabel={`${profile.friendsCount} ${t('profile.my.friends_count')}`}
              items={friendRows}
              emptyText={t('profile.my.empty_friends')}
              ctaLabel={t('profile.my.show_all_friends')}
            />
            <MyProfileListCard
              title={t('profile.my.groups')}
              countLabel={`${profile.groupsCount} ${t('profile.my.groups_count')}`}
              items={groupRows}
              emptyText={t('profile.my.empty_groups')}
              ctaLabel={t('profile.my.show_all_groups')}
            />
          </Grid>
        </React.Fragment>
      ) : null}
    </ProfileSurface>
  );
};
