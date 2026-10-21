import { RatingCard } from './rating-ui';
import { Alert, Button, Icon } from '../../components/primitives';
import { useI18n } from '../../i18n';

import type { useCatalogRatingsPanel } from './useCatalogRatingsPanel';

type ViewerReview = NonNullable<
  ReturnType<typeof useCatalogRatingsPanel>['viewerReview']
>;

export function CatalogRatingViewerCard({
  dismissFormError,
  formatDate,
  formError,
  isDeletingRating,
  onDelete,
  onEdit,
  viewerReview,
}: {
  dismissFormError: () => void;
  formatDate: ReturnType<typeof useCatalogRatingsPanel>['formatDate'];
  formError: string | null;
  isDeletingRating: boolean;
  onDelete: () => void;
  onEdit: () => void;
  viewerReview: ViewerReview;
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="app-text-section-title text-ink">
          <span className="inline-flex items-center gap-2">
            <Icon name="star" size={24} strokeWidth={1.7} />
            {t('catalog.workDetail.ratings.form.editTitle')}
          </span>
        </h2>
      </div>
      {formError ? (
        <Alert variant="error">
          <div className="flex items-start justify-between gap-3">
            <span className="min-w-0 flex-1">{formError}</span>
            <button
              type="button"
              onClick={dismissFormError}
              className="shrink-0 rounded-sm px-1 text-sm text-ink-3 transition-colors hover:text-ink"
            >
              {t('common.close')}
            </button>
          </div>
        </Alert>
      ) : null}
      <RatingCard
        actions={
          <div className="flex items-center gap-2">
            <Button
              aria-label={t('catalog.workDetail.ratings.card.edit')}
              icon="pencil-line"
              iconSize={20}
              size="sm"
              variant="ghost"
              onClick={onEdit}
            />
            <Button
              aria-label={t('catalog.workDetail.ratings.card.delete')}
              className="text-brick hover:text-brick-2"
              icon="trash-2"
              iconSize={20}
              isLoading={isDeletingRating}
              loadingLabel={t('catalog.workDetail.ratings.form.deleting')}
              size="sm"
              variant="ghost"
              onClick={onDelete}
            />
          </div>
        }
        formatDate={formatDate}
        ratingLabel={t('catalog.workDetail.ratings.ratingOption', {
          values: { rating: viewerReview.rating },
        })}
        rating={viewerReview}
      />
    </div>
  );
}
