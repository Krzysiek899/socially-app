import React from 'react';
import { BadgeCheck, UserPlus } from 'lucide-react';
import { Avatar, Badge, Button } from '../../../shared/components/index.ts';
import { Cluster } from '../../../shared/layout/index.tsx';
import { t } from '../../../i18n/index.ts';
import type { PublicProfile } from '../domain/profileModels.ts';

type PublicProfileHeroProps = {
  profile: PublicProfile;
  onSendRequest?: () => void;
  onAcceptRequest?: () => void;
  onRejectRequest?: () => void;
  onUnfriend?: () => void;
};

export const PublicProfileHero = ({
  profile,
  onSendRequest,
  onAcceptRequest,
  onRejectRequest,
  onUnfriend,
}: PublicProfileHeroProps): React.JSX.Element => (
  <section className="public-profile__hero-shell" aria-label={t('profile.hero.aria_label')}>
    <div className="public-profile__hero">
      <div className="public-profile__hero-banner" />
      <div className="public-profile__hero-content">
        <div className="public-profile__hero-main">
          <div className="public-profile__hero-avatar-wrap">
            <Avatar name={profile.displayName} src={profile.avatarUrl} size="xl" />
          </div>
          <div className="public-profile__hero-text">
            <Cluster gap="2" align="center">
              <h2 className="public-profile__hero-name">{profile.displayName}</h2>
              <Badge variant="warning" size="sm">
                <Cluster gap="1" align="center">
                  <BadgeCheck size={12} aria-hidden="true" />
                  <span>{profile.badge}</span>
                </Cluster>
              </Badge>
            </Cluster>
            <p className="public-profile__hero-bio">{profile.bio}</p>
          </div>
        </div>
        <div className="public-profile__hero-actions">
          {profile.friendAction === 'can_send_request' ? (
            <Button type="button" size="lg" onClick={onSendRequest}>
              <UserPlus size={16} aria-hidden="true" />
              {t('profile.actions.add_friend')}
            </Button>
          ) : null}
          {profile.friendAction === 'request_sent' ? (
            <Button type="button" size="lg" disabled>
              {t('profile.actions.friend_request_sent')}
            </Button>
          ) : null}
          {profile.friendAction === 'respond_to_request' ? (
            <Cluster gap="2">
              <Button type="button" size="lg" onClick={onAcceptRequest}>
                {t('profile.actions.accept_request')}
              </Button>
              <Button type="button" size="lg" variant="secondary" onClick={onRejectRequest}>
                {t('profile.actions.reject_request')}
              </Button>
            </Cluster>
          ) : null}
          {profile.friendAction === 'friends' ? (
            <Button type="button" size="lg" variant="secondary" onClick={onUnfriend}>
              {t('profile.actions.unfriend')}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  </section>
);
