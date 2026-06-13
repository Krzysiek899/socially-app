import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Avatar, Card, Button, Modal, TextField } from '../../../shared/components/index.ts';
import { Stack } from '../../../shared/layout/index.tsx';
import { t } from '../../../i18n/index.ts';
import { useAppDispatch } from '../../../redux/hooks.ts';
import { submitProfileReview, fetchPublicProfile } from '../../../redux/profile/profileSlice.ts';
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
}: PublicProfileReviewsCardProps): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const { userId } = useParams<{ userId: string }>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formContent, setFormContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  if (formRating === 0 || !userId) return;

  setIsSubmitting(true);
  try {
    
    await dispatch(
      submitProfileReview({
        userId,
        payload: { rating: formRating, content: formContent.trim() },
      })
    ).unwrap();

    
    void dispatch(fetchPublicProfile(userId));

   
    setIsModalOpen(false);
    setFormRating(0);
    setFormContent('');
  } catch (error) {
    console.error('Failed to submit review', error);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <>
      <Card as="section" variant="raised">
        <Stack gap="4">
          <div className="public-profile__card-header">
            <div>
              <h3 className="public-profile__card-title">{t('profile.public.reviews')}</h3>
              <p className="public-profile__card-subtitle">
                {t('profile.public.rating_label')}: <strong>{rating.toFixed(1)}</strong> · {reviewsCount} {t('profile.public.reviews_count')}
              </p>
            </div>
            
            <Button onClick={() => setIsModalOpen(true)} variant="primary" size="sm">
              {t('profile.public.add_review')}
            </Button>
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
                  {/* 👇 ZMIANA: Renderuj tag <p> tylko wtedy, gdy treść rzeczywiście istnieje */}
                  {review.content && review.content.trim().length > 0 && (
                    <p className="public-profile__review-content">{review.content}</p>
                  )}
                </article>
              ))}
            </Stack>
          )}
        </Stack>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={t('profile.public.add_review_title')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={formRating === 0 || isSubmitting}>
              {t('common.submit')}
            </Button>
          </>
        }
      >
        <Stack gap="4">
          <div>
            <p className="public-profile__modal-rating-label">
              {t('profile.public.your_rating')}
            </p>
            <div className="public-profile__star-selector">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormRating(star)}
                  className={`public-profile__star-button ${
                    star <= formRating ? 'public-profile__star-button--active' : ''
                  }`}
                >
                  <Star fill={star <= formRating ? 'currentColor' : 'none'} size={24} />
                </button>
              ))}
            </div>
          </div>
          <TextField
            id="review-content"
            label={t('profile.public.review_content')}
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
          />
        </Stack>
      </Modal>
    </>
  );
};