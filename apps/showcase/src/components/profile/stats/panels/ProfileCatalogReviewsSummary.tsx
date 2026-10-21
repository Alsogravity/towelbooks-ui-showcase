import { LoadingState } from '../../../feedback';
import { Button, ButtonLink, Alert } from '../../../primitives';
import { getProfileReviewsPath } from '../../../../app/profileRoutes';
import { useI18n } from '../../../../i18n';
import {
  PROFILE_CATALOG_REVIEWS_PREVIEW_LIMIT,
  useProfileCatalogReviews,
} from '../../../../features/profile/useProfileCatalogReviews';
import { ProfileCatalogReviewCard } from './ProfileCatalogReviewCard';

export function ProfileCatalogReviewsSummary({
  totalCount,
  username,
}: {
  totalCount: number;
  username: string;
}) {
  const { t } = useI18n();
  const reviewsQuery = useProfileCatalogReviews({
    enabled: totalCount > 0,
    limit: PROFILE_CATALOG_REVIEWS_PREVIEW_LIMIT,
    username,
  });

  if (totalCount === 0) {
    return null;
  }

  if (reviewsQuery.isFetching) {
    return (
      <section
        aria-busy="true"
        aria-labelledby="profile-catalog-reviews-summary-title"
        className="mt-8 space-y-4"
      >
        <h2
          id="profile-catalog-reviews-summary-title"
          className="app-text-section-title text-ink"
        >
          {t('profile.catalog-reviews.summaryTitle')}
        </h2>
        <LoadingState label={t('profile.catalog-reviews.loading')} />
      </section>
    );
  }

  if (reviewsQuery.error) {
    return (
      <section
        aria-labelledby="profile-catalog-reviews-summary-title"
        className="mt-8 space-y-4"
      >
        <h2
          id="profile-catalog-reviews-summary-title"
          className="app-text-section-title text-ink"
        >
          {t('profile.catalog-reviews.summaryTitle')}
        </h2>
        <Alert variant="error">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{t('profile.catalog-reviews.error.loadPublished')}</span>
            <Button
              variant="secondary"
              onClick={() => void reviewsQuery.refetch()}
            >
              {t('errors.action.retry')}
            </Button>
          </div>
        </Alert>
      </section>
    );
  }

  if (reviewsQuery.items.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="profile-catalog-reviews-summary-title"
      className="mt-8 space-y-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2
          id="profile-catalog-reviews-summary-title"
          className="app-text-section-title text-ink"
        >
          {t('profile.catalog-reviews.summaryTitle')}
        </h2>
        <ButtonLink
          to={getProfileReviewsPath(username)}
          variant="secondary"
          prependIcon="arrow-right"
        >
          {t('profile.catalog-reviews.viewAll')}
        </ButtonLink>
      </div>
      <div className="space-y-4" aria-live="polite">
        {reviewsQuery.items.map((item) => (
          <ProfileCatalogReviewCard
            key={item.id}
            item={item}
            profileUsername={username}
          />
        ))}
      </div>
    </section>
  );
}
