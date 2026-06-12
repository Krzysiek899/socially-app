import React from 'react';
import { Avatar, Card } from '../../../shared/components/index.ts';
import { Stack } from '../../../shared/layout/index.tsx';
import { t } from '../../../i18n/index.ts';
import type { PublicProfileMutualFriend } from '../domain/profileModels.ts';

type PublicProfileMutualFriendsCardProps = {
  friends: PublicProfileMutualFriend[];
};

export const PublicProfileMutualFriendsCard = ({
  friends,
}: PublicProfileMutualFriendsCardProps): React.JSX.Element => (
  <Card as="section" variant="raised">
    <Stack gap="3">
      <h3 className="public-profile__card-title">{t('profile.public.mutual_friends')}</h3>
      {friends.length === 0 ? (
        <p className="public-profile__empty-text">{t('profile.public.empty_mutual_friends')}</p>
      ) : (
        <Stack gap="3">
          {friends.map((friend) => (
            <div key={friend.id} className="public-profile__friend-row">
              <Avatar name={friend.displayName} src={friend.avatarUrl} size="md" />
              <span className="public-profile__friend-name">{friend.displayName}</span>
            </div>
          ))}
        </Stack>
      )}
    </Stack>
  </Card>
);
