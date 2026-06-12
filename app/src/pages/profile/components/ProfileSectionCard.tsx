import React from 'react';
import { Badge, Card } from '../../../shared/components/index.ts';
import { Stack } from '../../../shared/layout/index.tsx';
import type { PublicProfileSection } from '../domain/profileModels.ts';

type ProfileSectionCardProps = {
  section: PublicProfileSection;
};

export const ProfileSectionCard = ({ section }: ProfileSectionCardProps): React.JSX.Element => (
  <Card
    as="section"
    aria-label={section.title}
    header={(
      <Stack gap="1">
        <h2 className="profile-page__section-title">{section.title}</h2>
        <p className="profile-page__section-description">{section.description}</p>
      </Stack>
    )}
  >
    {section.items.length === 0 ? (
      <p className="profile-page__section-empty">{section.emptyText}</p>
    ) : (
      <Stack gap="2">
        {section.items.map((item) => (
          <article key={item.id} className="profile-page__section-item">
            <Stack gap="1">
              <div className="profile-page__section-item-top">
                <strong>{item.title}</strong>
                {item.badge ? (
                  <Badge variant="info" size="sm">
                    {item.badge}
                  </Badge>
                ) : null}
              </div>
              <p>{item.subtitle}</p>
              <span className="profile-page__section-item-meta">{item.meta}</span>
            </Stack>
          </article>
        ))}
      </Stack>
    )}
  </Card>
);
