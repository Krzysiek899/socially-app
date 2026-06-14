import React from 'react';
import { Avatar, Button, Card } from '../../../shared/components/index.ts';
import { ChevronRight } from 'lucide-react';
import { Cluster, Split, Stack } from '../../../shared/layout/index.tsx';
import { t } from '../../../i18n/index.ts';
import type { GroupDetails } from '../domain/groupModels.ts';

type GroupDetailsCardProps = {
  details: GroupDetails;
  actionLabel: string;
  actionDisabled: boolean;
  onAction: () => void;
  onMemberProfileClick: (memberId: string) => void;
};

export const GroupDetailsCard = ({
  details,
  actionLabel,
  actionDisabled,
  onAction,
  onMemberProfileClick,
}: GroupDetailsCardProps): React.JSX.Element => {
  const [showAllMembers, setShowAllMembers] = React.useState(false);

  React.useEffect(() => {
    setShowAllMembers(false);
  }, [details.id]);

  const visibleMembers = showAllMembers ? details.membersPreview : details.membersPreview.slice(0, 3);
  const shouldShowExpand = details.membersPreview.length > 3 && !showAllMembers;

  return (
    <Stack gap="3">
      <Card as="section" variant="raised">
        <Stack gap="1">
          <h2 className="group-details__title">{details.name}</h2>
          <p className="group-details__members-count">{t('profile.public.group_members_count').replace('{count}', String(details.membersCount))}</p>
        </Stack>
      </Card>

      <div className="group-details__split">
        <Split fraction="1/2" gap="3">
          <Card as="section" variant="raised">
            <Stack gap="2">
              <h3 className="group-details__section-title">{t('groups.details.description')}</h3>
              <p className="group-details__description">{details.description}</p>
            </Stack>
          </Card>

          <Card as="section" variant="raised">
            <Stack gap="2">
              <div className="group-details__list-header">
                <h3 className="group-details__section-title">{t('groups.details.members')}</h3>
                <span className="group-details__list-count">{details.membersCount}</span>
              </div>

              <Stack gap="2">
                {visibleMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    className="group-details__member-row group-details__member-row--button"
                    onClick={() => onMemberProfileClick(member.id)}
                  >
                    <Cluster gap="2" align="center">
                      <Avatar name={member.displayName} src={member.avatarUrl} size="sm" />
                      <span className="group-details__member-name">{member.displayName}</span>
                    </Cluster>
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                ))}
              </Stack>

              {shouldShowExpand ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAllMembers(true)}
                >
                  {t('profile.my.show_all_groups')}
                </Button>
              ) : null}
            </Stack>
          </Card>
        </Split>
      </div>

      <div className="group-details__actions">
        <Button
          type="button"
          onClick={onAction}
          disabled={actionDisabled}
          size="md"
          variant={details.isMember ? 'danger' : 'primary'}
        >
          {actionLabel}
        </Button>
      </div>
    </Stack>
  );
};
