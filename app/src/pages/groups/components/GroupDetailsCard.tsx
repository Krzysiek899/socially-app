import React from 'react';
import { Avatar, Button, Card } from '../../../shared/components/index.ts';
import { Cluster, Stack } from '../../../shared/layout/index.tsx';
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
}: GroupDetailsCardProps): React.JSX.Element => (
  <Card as="section" variant="raised">
    <Stack gap="3">
      <h2>{details.name}</h2>
      <p>{details.description}</p>
      <p>{details.membersCount}</p>
      <Stack gap="2">
        {details.membersPreview.map((member) => (
          <Cluster key={member.id} gap="2" align="center">
            <Avatar name={member.displayName} src={member.avatarUrl} size="sm" />
            <span>{member.displayName}</span>
          </Cluster>
        ))}
      </Stack>
      <Button type="button" onClick={onAction} disabled={actionDisabled}>
        {actionLabel}
      </Button>
    </Stack>
  </Card>
);
