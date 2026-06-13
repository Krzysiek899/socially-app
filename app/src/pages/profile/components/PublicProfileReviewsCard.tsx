import React from 'react';
import { Avatar, Card } from '../../../shared/components/index.ts';
import { Stack } from '../../../shared/layout/index.tsx';
import { t } from '../../../i18n/index.ts';
import type { PublicProfileReview } from '../domain/profileModels.ts';

type PublicProfileReviewsCardProps = {
  rating: number;
  reviewsCount: number;
  reviews: PublicProfileReview[];
};

export const PublicProfileReviewsCard = ({
  rating,
  reviewsCount,
  reviews,
}: PublicProfileReviewsCardProps): React.JSX.Element => (
  <Card as="section" variant="raised">
    <Stack gap="4">
      <div className="public-profile__card-header">
        <div>
          <h3 className="public-profile__card-title">{t('profile.public.reviews')}</h3>
          <p className="public-profile__card-subtitle">
            {t('profile.public.rating_label')}: <strong>{rating.toFixed(1)}</strong> · {reviewsCount} {t('profile.public.reviews_count')}
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="public-profile__empty-text">{t('profile.public.empty_reviews')}</p>
      ) : (
        <Stack gap="3">
          {reviews.map((review) => (
            <article key={review.id} className="public-profile__review-item">
              <div className="public-profile__review-header">
                <Avatar name={review.authorName} src={review.authorAvatarUrl} size="md" />
                <div>
                  <p className="public-profile__review-author">{review.authorName}</p>
                  <p className="public-profile__review-meta">
                    {review.rating.toFixed(1)} · {review.publishedAtLabel}
                  </p>
                </div>
              </div>
              <p className="public-profile__review-content">{review.content}</p>
            </article>
          ))}
        </Stack>
      )}
    </Stack>
  </Card>
);
