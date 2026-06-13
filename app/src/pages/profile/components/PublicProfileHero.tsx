import React from 'react';
import { BadgeCheck, UserPlus } from 'lucide-react';
import { Avatar, Badge, Button, Card } from '../../../shared/components/index.ts';
import { Cluster, Stack } from '../../../shared/layout/index.tsx';
import { t } from '../../../i18n/index.ts';
import type { PublicProfile } from '../domain/profileModels.ts';

type PublicProfileHeroProps = {
  profile: PublicProfile;
};

export const PublicProfileHero = ({ profile }: PublicProfileHeroProps): React.JSX.Element => (
  <Card as="section" variant="raised" aria-label={t('profile.hero.aria_label')}>
    <div className="public-profile__hero">
      <div className="public-profile__hero-banner" />
      <div className="public-profile__hero-content">
        <div className="public-profile__hero-main">
          <Avatar name={profile.displayName} src={profile.avatarUrl} size="xl" />
          <Stack gap="2" align="stretch">
            <Stack gap="1" align="stretch">
              <h2 className="public-profile__hero-name">{profile.displayName}</h2>
              <Badge variant="info" size="sm">
                <Cluster gap="1" align="center">
                  <BadgeCheck size={14} aria-hidden="true" />
                  <span>{profile.badge}</span>
                </Cluster>
              </Badge>
            </Stack>
            <p className="public-profile__hero-bio">{profile.bio}</p>
            <p className="public-profile__hero-rating">
              <strong>{profile.rating.toFixed(1)}</strong> · {profile.reviewsCount} {t('profile.public.reviews_count')}
            </p>
          </Stack>
        </div>
        <div className="public-profile__hero-actions">
          <Button type="button" size="lg">
            <UserPlus size={16} aria-hidden="true" />
            {t('profile.actions.add_friend')}
          </Button>
        </div>
      </div>
    </div>
  </Card>
);
