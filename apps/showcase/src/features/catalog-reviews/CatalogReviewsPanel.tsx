import { useQuery } from '@tanstack/react-query';

import { catalogWorkReviewsQueryKey } from './queries';
import { CatalogReviewViewerAction } from './CatalogReviewViewerAction';
import { useViewerCatalogReview } from './useViewerCatalogReview';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../components/feedback';
import { CatalogReviewCard } from '../../entities/catalog-reviews/ui';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';
import { useAuth } from '../auth/AuthContext';

import { buildCatalogReviewExcerpt } from '@towelbooks/schemas';

export interface CatalogReviewsPanelProps {
  catalogWorkId: string;
  workTypeLabel: string;
}

export function CatalogReviewsPanel({
  catalogWorkId,
  workTypeLabel,
}: CatalogReviewsPanelProps) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { formatDate, t } = useI18n();

  const catalogReviewsQuery = useQuery({
    queryKey: catalogWorkReviewsQueryKey(catalogWorkId),
    queryFn: () => sdk.catalog.listCatalogReviews(catalogWorkId),
  });
  const viewerCatalogReviewQuery = useViewerCatalogReview(
    catalogWorkId,
    isAuthenticated,
  );

  const viewerCatalogReview = viewerCatalogReviewQuery.data?.item ?? null;
  const isViewerCatalogReviewPending =
    isAuthLoading || (isAuthenticated && viewerCatalogReviewQuery.isLoading);
  const hasViewerReviewError =
    isAuthenticated && viewerCatalogReviewQuery.error != null;
  const catalogReviews = catalogReviewsQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      {!isAuthLoading ? (
        <CatalogReviewViewerAction
          catalogWorkId={catalogWorkId}
          hasViewerReviewError={hasViewerReviewError}
          isAuthenticated={isAuthenticated}
          isViewerCatalogReviewPending={isViewerCatalogReviewPending}
          viewerCatalogReview={viewerCatalogReview}
        />
      ) : null}

      {catalogReviewsQuery.isLoading ? (
        <LoadingState
          label={{
            key: 'catalog.workDetail.catalogReviews.loading',
            fallback: 'Loading catalog reviews...',
          }}
        />
      ) : catalogReviewsQuery.error ? (
        <ErrorState
          body={{
            key: 'catalog.workDetail.catalogReviews.error',
            fallback: 'Unable to load catalog reviews right now.',
          }}
          title={{
            key: 'catalog.workDetail.error.loadTitle',
            fallback: 'Unable to load this catalog work.',
          }}
        />
      ) : !isViewerCatalogReviewPending &&
        !hasViewerReviewError &&
        catalogReviews.length === 0 ? (
        <EmptyState
          body={{
            key: 'catalog.workDetail.catalogReviews.empty',
            fallback: 'No published reviews for this catalog work yet.',
          }}
          title={{
            key: 'catalog.workDetail.catalogReviews.title',
            fallback: `${workTypeLabel} reviews`,
            values: { workType: workTypeLabel },
          }}
        />
      ) : (
        <div className="space-y-4">
          {catalogReviews.map((catalogReview) => {
            const dateLabel = t(
              'catalog.workDetail.catalogReviews.publishedOn',
              {
                values: {
                  date: formatDate(
                    catalogReview.publishedAt ?? catalogReview.createdAt,
                  ),
                },
              },
            );
            return (
              <CatalogReviewCard
                key={catalogReview.id}
                author={catalogReview.author}
                catalogWork={{
                  id: catalogReview.target.id,
                  title: catalogReview.target.title,
                  subtitle: catalogReview.target.subtitle,
                }}
                dateLabel={dateLabel}
                excerpt={buildCatalogReviewExcerpt(catalogReview.body)}
                href={`/catalog-reviews/${encodeURIComponent(catalogReview.id)}`}
                title={catalogReview.title}
                workHref={`/catalog/${encodeURIComponent(catalogReview.catalogWorkId)}`}
                workTypeLabel={workTypeLabel}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
