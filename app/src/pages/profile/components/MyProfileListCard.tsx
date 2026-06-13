import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button, Card } from '../../../shared/components/index.ts';
import { Cluster, Stack } from '../../../shared/layout/index.tsx';

type MyProfileListCardProps = {
  title: string;
  countLabel: string;
  items: React.ReactNode[];
  emptyText: string;
  ctaLabel?: string;
};

export const MyProfileListCard = ({
  title,
  countLabel,
  items,
  emptyText,
  ctaLabel,
}: MyProfileListCardProps): React.JSX.Element => (
  <Card
    as="section"
    header={(
      <div className="my-profile__list-header">
        <h2 className="my-profile__list-title">{title}</h2>
        <span className="my-profile__list-count">{countLabel}</span>
      </div>
    )}
  >
    <Stack gap="2" align="stretch">
      {items.length > 0 ? items : <p className="my-profile__empty-text">{emptyText}</p>}
      {ctaLabel ? (
        <Button type="button" variant="secondary" size="lg">
          {ctaLabel}
        </Button>
      ) : null}
    </Stack>
  </Card>
);

export const MyProfileListRow = ({
  leading,
  label,
  action,
}: {
  leading: React.ReactNode;
  label: string;
  action?: React.ReactNode;
}): React.JSX.Element => (
  <div className="my-profile__list-row">
    <Cluster gap="2" align="center">
      {leading}
      <span className="my-profile__list-row-label">{label}</span>
    </Cluster>
    {action ?? <ChevronRight size={18} aria-hidden="true" />}
  </div>
);
