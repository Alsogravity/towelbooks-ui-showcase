import { useQuery } from '@tanstack/react-query';

import { EmptyState } from '../../../../components/feedback';
import { CatalogRatingDeleteDialog } from '../../../../features/ratings/CatalogRatingDeleteDialog';
import { CatalogRatingEditorCard } from '../../../../features/ratings/CatalogRatingEditorCard';
import { CatalogRatingViewerCard } from '../../../../features/ratings/CatalogRatingViewerCard';
import { RatingCard } from '../../../../features/ratings/rating-ui';
import { libraryItemOwnerRatingQueryKey } from '../../../../features/ratings/queries';
import { useCatalogRatingsPanel } from '../../../../features/ratings/useCatalogRatingsPanel';
import { Alert, ButtonLink, Card } from '../../../../components/primitives';
import { useI18n } from '../../../../i18n';
import { sdk } from '../../../../lib/sdk';

export function LibraryItemRatingPanel({
  canManage,
  catalogWorkId,
  enabled = true,
  itemId,
  libraryId,
  ownerUserId,
}: {
  catalogWorkId: string;
  canManage: boolean;
  enabled?: boolean;
  itemId: string;
  libraryId: string;
  ownerUserId: string;
}) {
  const { formatDate: formatReadOnlyDate, t: translate } = useI18n();
  const ownerRatingQuery = useQuery({
    enabled: enabled && !canManage && ownerUserId.length > 0,
    queryKey: libraryItemOwnerRatingQueryKey(
      libraryId,
      itemId,
      ownerUserId,
      catalogWorkId,
    ),
    queryFn: () =>
      sdk.ratings.listForCatalogWork(catalogWorkId, {
        authorUserId: ownerUserId,
        page: 1,
        pageSize: 1,
      }),
    retry: false,
  });
  const {
    closeDeleteDialog,
    closeForm,
    confirmDelete,
    dismissFormError,
    draftNote,
    draftRating,
    formatDate,
    formError,
    isAuthenticated,
    isAuthLoading,
    isDeleteDialogOpen,
    isDeletingRating,
    isSavingRating,
    isViewerRatingLoading,
    openDeleteDialog,
    setDraftBody,
    setDraftRating,
    shouldShowReviewForm,
    startEditing,
    submitReview,
    t,
    viewerReview,
    viewerReviewError,
  } = useCatalogRatingsPanel(catalogWorkId, {
    enabled: enabled && canManage,
    includeCommunity: false,
  });

  if (!canManage) {
    if (ownerRatingQuery.isLoading) {
      return (
        <p className="app-text-supporting-copy text-ink-3">
          {translate('catalog.workDetail.ratings.loading')}
        </p>
      );
    }

    if (ownerRatingQuery.isError) {
      return (
        <Alert variant="error">
          {translate('catalog.workDetail.ratings.viewerError')}
        </Alert>
      );
    }

    const ownerRating = ownerRatingQuery.data?.items[0] ?? null;
    return ownerRating ? (
      <RatingCard
        formatDate={formatReadOnlyDate}
        rating={ownerRating}
        ratingLabel={translate('catalog.workDetail.ratings.ratingOption', {
          values: { rating: ownerRating.rating },
        })}
      />
    ) : (
      <EmptyState
        body={{
          key: 'catalog.workDetail.ratings.empty',
          fallback: 'No ratings for this catalog work yet.',
        }}
        icon="star"
        title={{
          key: 'catalog.workDetail.tabs.ratings',
          fallback: 'Rating',
        }}
      />
    );
  }

  if (isAuthLoading) {
    return (
      <p className="app-text-supporting-copy text-ink-3">
        {t('catalog.workDetail.ratings.loading')}
      </p>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="space-y-4">
        <div className="space-y-1">
          <h2 className="app-text-section-title text-ink">
            {t('catalog.workDetail.ratings.form.createTitle')}
          </h2>
          <p className="text-sm text-ink-3">
            {t('catalog.workDetail.ratings.loginCta')}
          </p>
        </div>
        <ButtonLink to="/login" variant="secondary">
          {t('catalog.workDetail.ratings.loginAction')}
        </ButtonLink>
      </Card>
    );
  }

  if (viewerReviewError) {
    return (
      <Alert variant="error">
        {t('catalog.workDetail.ratings.viewerError')}
      </Alert>
    );
  }

  if (isViewerRatingLoading) {
    return (
      <p className="app-text-supporting-copy text-ink-3">
        {t('catalog.workDetail.ratings.loading')}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {shouldShowReviewForm ? (
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
      )}
      <CatalogRatingDeleteDialog
        isDeletingRating={isDeletingRating}
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
