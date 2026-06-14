import React from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react'; 
import { Stack } from '../../shared/layout/index.tsx';
import { Button } from '../../shared/components/index.ts'; 
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts';
import { fetchPublicProfile } from '../../redux/profile/profileSlice.ts';
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
  const { profile, status, errorKey } = useAppSelector((state) => state.profile.publicProfile);

  const goBack = useSmartBack('/app/discover');

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

        <div style={{ paddingBottom: '0.25rem' }}>
          <Button type="button" variant="secondary" size="sm" onClick={goBack}>
            <ArrowLeft size={16} style={{ marginRight: '6px' }} />
            {t('common.back')}
          </Button>
        </div>

        <PublicProfileHero profile={profile} />
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