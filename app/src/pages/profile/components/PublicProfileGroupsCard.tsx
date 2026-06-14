import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Code2, Dumbbell } from 'lucide-react';
import { Card } from '../../../shared/components/index.ts';
import { Cluster, Stack } from '../../../shared/layout/index.tsx';
import { t } from '../../../i18n/index.ts';
import type { PublicProfileGroup } from '../domain/profileModels.ts';

type PublicProfileGroupsCardProps = {
  groups: PublicProfileGroup[];
};

export const PublicProfileGroupsCard = ({
  groups,
}: PublicProfileGroupsCardProps): React.JSX.Element => {
  const navigate = useNavigate();
  const iconByKey = {
    sport: Dumbbell,
    book: BookOpen,
    tech: Code2,
  } as const;

  return (
    <Card as="section" variant="raised">
      <Stack gap="3">
        <div className="public-profile__card-title-row">
          <h3 className="public-profile__card-title">{t('profile.public.groups')}</h3>
          <span className="public-profile__count-chip">({groups.length})</span>
        </div>
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
                <Cluster gap="3" align="center">
                  <span className={`public-profile__group-icon public-profile__group-icon--${group.iconKey}`} aria-hidden="true">
                    {React.createElement(iconByKey[group.iconKey], { size: 16 })}
                  </span>
                  <div>
                    <p className="public-profile__group-name">{group.name}</p>
                    <p className="public-profile__group-meta">{t('profile.public.group_members_count').replace('{count}', String(group.membersCount))}</p>
                  </div>
                </Cluster>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
};
