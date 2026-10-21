import { useQuery } from '@tanstack/react-query';

import { EmptyState } from '../../../../components/feedback';
import { LibrarySection } from '../../ui/LibrarySection';
import { CatalogReviewViewerAction } from '../../../../features/catalog-reviews/CatalogReviewViewerAction';
import { libraryItemOwnerCatalogReviewQueryKey } from '../../../../features/catalog-reviews/queries';
import { useViewerCatalogReview } from '../../../../features/catalog-reviews/useViewerCatalogReview';
import { CatalogReviewCard } from '../../../../entities/catalog-reviews/ui';
import { useI18n } from '../../../../i18n';
import { sdk } from '../../../../lib/sdk';

import { buildCatalogReviewExcerpt } from '@towelbooks/schemas';

export function LibraryItemReviewPanel({
  canManage,
  enabled = true,
  catalogWorkId,
  libraryId,
  libraryItemId,
  ownerUserId,
}: {
  canManage: boolean;
  enabled?: boolean;
  catalogWorkId: string;
  libraryId: string;
  libraryItemId: string;
  ownerUserId: string;
}) {
  const { formatDate, t } = useI18n();
  const ownerCatalogReviewQuery = useQuery({
    enabled: enabled && !canManage && ownerUserId.length > 0,
    queryKey: libraryItemOwnerCatalogReviewQueryKey(
      libraryId,
      libraryItemId,
      ownerUserId,
      catalogWorkId,
    ),
    queryFn: () =>
      sdk.catalog.listCatalogReviews(catalogWorkId, {
        authorUserId: ownerUserId,
      }),
    retry: false,
  });
  const viewerCatalogReviewQuery = useViewerCatalogReview(
    catalogWorkId,
    enabled && canManage,
  );

  const ownerReview = ownerCatalogReviewQuery.data?.items[0] ?? null;

  return (
    <LibrarySection
      actions={
        canManage ? (
          <CatalogReviewViewerAction
            catalogWorkId={catalogWorkId}
            hasViewerReviewError={viewerCatalogReviewQuery.error != null}
            isAuthenticated
            isViewerCatalogReviewPending={viewerCatalogReviewQuery.isLoading}
            layout="sectionHeader"
            origin={{
              kind: 'library-item',
              libraryId,
              libraryItemId,
            }}
            showPublishedAction
            viewerCatalogReview={viewerCatalogReviewQuery.data?.item ?? null}
          />
        ) : undefined
      }
      description={t(
        canManage
          ? 'myLibrary.items.review.description'
          : 'myLibrary.items.review.ownerDescription',
      )}
      icon="feather"
      title={t(
        canManage
          ? 'myLibrary.items.review.title'
          : 'myLibrary.items.review.ownerTitle',
      )}
    >
      {canManage ? (
        viewerCatalogReviewQuery.error ? (
          <p className="text-sm text-ink-3" role="alert">
            {t('catalog.workDetail.catalogReviews.viewerCheckError')}
          </p>
        ) : null
      ) : ownerCatalogReviewQuery.isLoading ? (
        <p className="app-text-supporting-copy text-ink-3">
          {t('catalog.workDetail.catalogReviews.loading')}
        </p>
      ) : ownerCatalogReviewQuery.isError ? (
        <p className="text-sm text-ink-3" role="alert">
          {t('catalog.workDetail.catalogReviews.error')}
        </p>
      ) : ownerReview ? (
        <CatalogReviewCard
          author={ownerReview.author}
          catalogWork={{
            id: ownerReview.target.id,
            subtitle: ownerReview.target.subtitle,
            title: ownerReview.target.title,
          }}
          dateLabel={t('catalog.workDetail.catalogReviews.publishedOn', {
            values: { date: formatDate(ownerReview.publishedAt) },
          })}
          excerpt={buildCatalogReviewExcerpt(ownerReview.body)}
          href={`/catalog-reviews/${encodeURIComponent(ownerReview.id)}`}
          title={ownerReview.title}
          workHref={`/catalog/${encodeURIComponent(ownerReview.catalogWorkId)}`}
        />
      ) : (
        <EmptyState
          body={{
            key: 'catalog.workDetail.catalogReviews.empty',
            fallback: 'No published reviews for this catalog work yet.',
          }}
          icon="feather"
          title={{
            key: 'myLibrary.items.review.ownerTitle',
            fallback: "Library owner's review",
          }}
        />
      )}
    </LibrarySection>
  );
}
