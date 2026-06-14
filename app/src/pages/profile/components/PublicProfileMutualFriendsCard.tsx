import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Avatar, Card } from '../../../shared/components/index.ts';
import { Stack } from '../../../shared/layout/index.tsx';
import { t } from '../../../i18n/index.ts';
import type { PublicProfileMutualFriend } from '../domain/profileModels.ts';

type PublicProfileMutualFriendsCardProps = {
  friends: PublicProfileMutualFriend[];
};

export const PublicProfileMutualFriendsCard = ({
  friends,
}: PublicProfileMutualFriendsCardProps): React.JSX.Element => {
  const navigate = useNavigate();

  return (
    <Card as="section" variant="raised">
      <Stack gap="3">
        <div className="public-profile__card-title-row">
          <h3 className="public-profile__card-title">{t('profile.public.mutual_friends')}</h3>
          <span className="public-profile__count-chip">({friends.length})</span>
        </div>
        {friends.length === 0 ? (
          <p className="public-profile__empty-text">{t('profile.public.empty_mutual_friends')}</p>
        ) : (
          <Stack gap="3">
            {friends.map((friend) => (
              <button
                key={friend.id}
                type="button"
                className="public-profile__group-row public-profile__group-row--button"
                onClick={() => navigate(`/users/${friend.id}`)}
              >
                <div className="public-profile__friend-row-content">
                  <Avatar name={friend.displayName} src={friend.avatarUrl} size="md" />
                  <span className="public-profile__friend-name">{friend.displayName}</span>
                </div>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
};
