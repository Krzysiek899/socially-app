import React from 'react';
import { useParams } from 'react-router-dom';
import { Stack } from '../../shared/layout/index.tsx';
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts';
import { fetchPublicProfile } from '../../redux/profile/profileSlice.ts';
import { t } from '../../i18n/index.ts';
import { PublicProfileHero } from './components/PublicProfileHero.tsx';
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
        <PublicProfileHero profile={profile} />
        <div />
      </Stack>
    ) : null}
    </ProfileSurface>
  );
};
