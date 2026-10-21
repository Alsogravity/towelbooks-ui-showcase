import { CatalogRatingDeleteDialog } from './CatalogRatingDeleteDialog';
import { CatalogRatingEditorCard } from './CatalogRatingEditorCard';
import { CatalogRatingViewerCard } from './CatalogRatingViewerCard';
import { RatingCard } from './rating-ui';
import { useCatalogRatingsPanel } from './useCatalogRatingsPanel';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../components/feedback';
import { Alert, Button, ButtonLink, Card } from '../../components/primitives';

export interface CatalogRatingsPanelProps {
  catalogWorkId: string;
  showEmptyState?: boolean;
  workTypeLabel: string;
}

export function CatalogRatingsPanel({
  catalogWorkId,
  showEmptyState = true,
  workTypeLabel,
}: CatalogRatingsPanelProps) {
  const {
    closeDeleteDialog,
    closeForm,
    confirmDelete,
    dismissFormError,
    draftNote,
    draftRating,
    fetchNextPage,
    formatDate,
    formError,
    hasNextPage,
    isAuthenticated,
    isAuthLoading,
    isDeleteDialogOpen,
    isDeletingRating,
    isFetchingNextPage,
    isReviewsLoading,
    isSavingRating,
    loadMoreRef,
    openDeleteDialog,
    otherPublicReviews,
    reviewsError,
    retryReviews,
    setDraftBody,
    setDraftRating,
    shouldShowReviewForm,
    startEditing,
    submitReview,
    t,
    viewerReview,
    viewerReviewError,
  } = useCatalogRatingsPanel(catalogWorkId);

  if (isReviewsLoading) {
    return (
      <LoadingState
        label={{
          key: 'catalog.workDetail.ratings.loading',
          fallback: 'Loading ratings...',
        }}
      />
    );
  }

  if (reviewsError) {
    return (
      <ErrorState
        body={{
          key: 'catalog.workDetail.ratings.error',
          fallback: 'Unable to load ratings right now.',
        }}
        title={{
          key: 'catalog.workDetail.error.loadTitle',
          fallback: 'Unable to load this catalog work.',
        }}
        action={
          <Button variant="secondary" onClick={retryReviews}>
            {t('catalog.works.error.retry')}
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {!isAuthLoading ? (
        isAuthenticated ? (
          shouldShowReviewForm ? (
            <CatalogRatingEditorCard
              dismissFormError={dismissFormError}
              draftNote={draftNote}
              draftRating={draftRating}
              formError={formError}
              isDeletingRating={isDeletingRating}
              isSavingRating={isSavingRating}
              onClose={viewerReview ? closeForm : null}
              onDraftNoteChange={setDraftBody}
              onDraftRatingChange={setDraftRating}
              onSubmit={submitReview}
              viewerRatingExists={viewerReview !== null}
            />
          ) : (
            <CatalogRatingViewerCard
              dismissFormError={dismissFormError}
              formatDate={formatDate}
              formError={formError}
              isDeletingRating={isDeletingRating}
              onDelete={openDeleteDialog}
              onEdit={startEditing}
              viewerReview={viewerReview!}
            />
          )
        ) : (
          <Card className="space-y-4">
            <div className="space-y-1">
              <h2 className="app-text-section-title text-ink">
                {t('catalog.workDetail.ratings.form.createTitle')}
              </h2>
              <p className="text-sm text-ink-3">
                {t('catalog.workDetail.ratings.loginCta')}
              </p>
            </div>
            <div>
              <ButtonLink to="/login" variant="secondary">
                {t('catalog.workDetail.ratings.loginAction')}
              </ButtonLink>
            </div>
          </Card>
        )
      ) : null}

      {showEmptyState || otherPublicReviews.length > 0 ? (
        <div className="space-y-4">
          {viewerReview === null && otherPublicReviews.length === 0 ? (
            <EmptyState
              body={{
                key: 'catalog.workDetail.ratings.empty',
                fallback: `No ratings for this ${workTypeLabel.toLowerCase()} yet.`,
              }}
              title={{
                key: 'catalog.workDetail.tabs.ratings',
                fallback: 'Ratings',
              }}
            />
          ) : (
            otherPublicReviews.map((rating) => (
              <RatingCard
                key={rating.id}
                formatDate={formatDate}
                ratingLabel={t('catalog.workDetail.ratings.ratingOption', {
                  values: { rating: rating.rating },
                })}
                rating={rating}
              />
            ))
          )}
        </div>
      ) : null}

      {hasNextPage ? (
        typeof IntersectionObserver === 'undefined' ? (
          <div className="flex justify-center">
            <Button
              isLoading={isFetchingNextPage}
              loadingLabel={t('catalog.workDetail.ratings.loadingMore')}
              variant="secondary"
              onClick={() => {
                void fetchNextPage();
              }}
            >
              {t('catalog.workDetail.ratings.loadMore')}
            </Button>
          </div>
        ) : (
          <div ref={loadMoreRef} className="flex justify-center py-2">
            {isFetchingNextPage ? (
              <p className="text-sm text-ink-3">
                {t('catalog.workDetail.ratings.loadingMore')}
              </p>
            ) : null}
          </div>
        )
      ) : null}

      {viewerReviewError ? (
        <Alert variant="error">
          {t('catalog.workDetail.ratings.viewerError')}
        </Alert>
      ) : null}

      <CatalogRatingDeleteDialog
        isDeletingRating={isDeletingRating}
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
