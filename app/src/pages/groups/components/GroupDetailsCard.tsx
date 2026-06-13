import React from 'react';
import { Avatar, Button, Card } from '../../../shared/components/index.ts';
import { Cluster, Grid, Stack } from '../../../shared/layout/index.tsx';
import { t } from '../../../i18n/index.ts';
import type { GroupDetails } from '../domain/groupModels.ts';

type GroupDetailsCardProps = {
  details: GroupDetails;
  actionLabel: string;
  actionDisabled: boolean;
  onAction: () => void;
};

export const GroupDetailsCard = ({
  details,
  actionLabel,
  actionDisabled,
  onAction,
}: GroupDetailsCardProps): React.JSX.Element => {
  const [showAllMembers, setShowAllMembers] = React.useState(false);

  React.useEffect(() => {
    setShowAllMembers(false);
  }, [details.id]);

  const visibleMembers = showAllMembers ? details.membersPreview : details.membersPreview.slice(0, 3);
  const shouldShowExpand = details.membersPreview.length > 3 && !showAllMembers;

  return (
    <Card as="section" variant="raised">
      <Stack gap="4">
        <h2 className="group-details__title">{details.name}</h2>

        <Grid columns={2} gap="3" className="group-details__content-grid">
          <Card as="section" variant="subtle">
            <Stack gap="2">
              <h3 className="group-details__section-title">{t('groups.details.description')}</h3>
              <p className="group-details__description">{details.description}</p>
            </Stack>
          </Card>

          <Card as="section" variant="subtle">
            <Stack gap="2">
              <Cluster gap="2" align="center" justify="space-between">
                <h3 className="group-details__section-title">{t('groups.details.members')}</h3>
                <span className="group-details__members-count">{details.membersCount}</span>
              </Cluster>

              <Stack gap="2">
                {visibleMembers.map((member) => (
                  <Cluster key={member.id} gap="2" align="center" className="group-details__member-row">
                    <Avatar name={member.displayName} src={member.avatarUrl} size="sm" />
                    <span>{member.displayName}</span>
                  </Cluster>
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
        </Grid>

        <div className="group-details__actions">
          <Button type="button" onClick={onAction} disabled={actionDisabled} size="md">
            {actionLabel}
          </Button>
        </div>
      </Stack>
    </Card>
  );
};
