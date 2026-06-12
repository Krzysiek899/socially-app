import React from 'react';
import { MapPinned } from 'lucide-react';
import { Avatar, Badge, Button, Card } from '../../../shared/components/index.ts';
import { Cluster, Grid, Stack } from '../../../shared/layout/index.tsx';
import { t } from '../../../i18n/index.ts';
import type { PublicProfile } from '../domain/profileModels.ts';

type ProfileHeroProps = {
  profile: PublicProfile;
  actions: Array<{
    key: string;
    label: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    onClick?: () => void;
  }>;
};

const formatJoinedAt = (joinedAt: string): string =>
  new Intl.DateTimeFormat('pl-PL', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(joinedAt));

export const ProfileHero = ({ profile, actions }: ProfileHeroProps): React.JSX.Element => (
  <Card variant="raised" as="section" aria-label={t('profile.hero.aria_label')}>
    <Stack gap="4">
      <Cluster justify="space-between" align="flex-start" gap="3">
        <Cluster align="center" gap="3">
          <Avatar name={profile.displayName} src={profile.avatarUrl} size="xl" />
          <Stack gap="2">
            <Stack gap="1">
              <h1 className="profile-page__title">{profile.displayName}</h1>
              <p className="profile-page__handle">{profile.handle}</p>
            </Stack>
            <Cluster gap="2" align="center">
              <span className="profile-page__meta-chip">
                <MapPinned size={14} aria-hidden="true" />
                {profile.city}
              </span>
              <span className="profile-page__meta-chip">
                {t('profile.hero.joined_prefix')} {formatJoinedAt(profile.joinedAt)}
              </span>
            </Cluster>
          </Stack>
        </Cluster>
        <Cluster gap="2" align="center">
          {actions.map((action) => (
            <Button
              key={action.key}
              type="button"
              size="sm"
              variant={action.variant ?? 'secondary'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </Cluster>
      </Cluster>

      <p className="profile-page__bio">{profile.bio}</p>

      <Stack gap="2">
        <Cluster gap="1" align="center">
          {profile.badges.map((badge) => (
            <Badge key={badge} variant="info" size="sm">
              {badge}
            </Badge>
          ))}
        </Cluster>
        <Cluster gap="1" align="center">
          {profile.interests.map((interest) => (
            <Badge key={interest} variant="neutral" size="sm">
              {interest}
            </Badge>
          ))}
        </Cluster>
      </Stack>

      <Grid columns={4} gap="2">
        {profile.stats.map((stat) => (
          <article key={stat.label} className="profile-page__stat">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </Grid>
    </Stack>
  </Card>
);
