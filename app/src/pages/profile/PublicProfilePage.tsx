import React from 'react';
import { MessageCircleMore, Send } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Grid, Stack } from '../../shared/layout/index.tsx';
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts';
import { fetchPublicProfile } from '../../redux/profile/profileSlice.ts';
import { t } from '../../i18n/index.ts';
import { ProfileHero } from './components/ProfileHero.tsx';
import { ProfileSectionCard } from './components/ProfileSectionCard.tsx';
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
          <ProfileHero
            profile={profile}
            actions={[
              {
                key: 'message',
                label: (
                  <span className="profile-page__action">
                    <MessageCircleMore size={16} aria-hidden="true" />
                    {t('profile.actions.message')}
                  </span>
                ),
                variant: 'primary',
              },
              {
                key: 'invite',
                label: (
                  <span className="profile-page__action">
                    <Send size={16} aria-hidden="true" />
                    {t('profile.actions.invite')}
                  </span>
                ),
                variant: 'secondary',
              },
            ]}
          />
          <Grid columns={2} gap="3">
            {profile.sections.map((section) => (
              <ProfileSectionCard key={section.id} section={section} />
            ))}
          </Grid>
        </Stack>
      ) : null}
    </ProfileSurface>
  );
};
