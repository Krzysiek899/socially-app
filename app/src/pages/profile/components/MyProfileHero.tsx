import React from 'react';
import { BadgeCheck, LogOut, ShieldCheck, SquarePen } from 'lucide-react';
import { Avatar, Badge, Button, Card } from '../../../shared/components/index.ts';
import { Cluster, Stack } from '../../../shared/layout/index.tsx';
import { t } from '../../../i18n/index.ts';
import type { MyProfile } from '../domain/profileModels.ts';

type MyProfileHeroProps = {
  profile: MyProfile;
  onLogout: () => void;
};

export const MyProfileHero = ({ profile, onLogout }: MyProfileHeroProps): React.JSX.Element => (
  <Card as="section" variant="raised" aria-label={t('profile.hero.aria_label')}>
    <div className="my-profile__hero">
      <Avatar name={profile.displayName} src={profile.avatarUrl} size="xl" />
      <Stack gap="2" align="stretch">
        <Stack gap="1">
          <h2 className="my-profile__hero-name">{profile.displayName}</h2>
          <Badge variant="info" size="sm">
            <Cluster gap="1" align="center">
              <BadgeCheck size={14} aria-hidden="true" />
              <span>{profile.badge}</span>
            </Cluster>
          </Badge>
        </Stack>
        <Stack gap="1" align="stretch">
          <h3 className="my-profile__section-eyebrow">{t('profile.my.about')}</h3>
          <p className="my-profile__hero-bio">{profile.bio}</p>
        </Stack>
      </Stack>
      <Stack gap="2" align="stretch">
        <Button type="button" size="lg">
          <SquarePen size={16} aria-hidden="true" />
          {t('profile.actions.edit')}
        </Button>
        <Button type="button" size="lg" variant="attention">
          <ShieldCheck size={16} aria-hidden="true" />
          {t('profile.actions.verify')}
        </Button>
        <Button type="button" size="lg" variant="secondary" onClick={onLogout}>
          <LogOut size={16} aria-hidden="true" />
          {t('profile.actions.logout')}
        </Button>
      </Stack>
    </div>
  </Card>
);
