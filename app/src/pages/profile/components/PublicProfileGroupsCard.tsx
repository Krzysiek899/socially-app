import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../shared/components/index.ts';
import { Stack } from '../../../shared/layout/index.tsx';
import { t } from '../../../i18n/index.ts';
import type { PublicProfileGroup } from '../domain/profileModels.ts';

type PublicProfileGroupsCardProps = {
  groups: PublicProfileGroup[];
};

export const PublicProfileGroupsCard = ({
  groups,
}: PublicProfileGroupsCardProps): React.JSX.Element => {
  const navigate = useNavigate();

  return (
    <Card as="section" variant="raised">
      <Stack gap="3">
        <h3 className="public-profile__card-title">{t('profile.public.groups')}</h3>
        {groups.length === 0 ? (
          <p className="public-profile__empty-text">{t('profile.public.empty_groups')}</p>
        ) : (
          <Stack gap="3">
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                className="public-profile__group-row public-profile__group-row--button"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                <p className="public-profile__group-name">{group.name}</p>
                <p className="public-profile__group-meta">{group.meta}</p>
              </button>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
};
