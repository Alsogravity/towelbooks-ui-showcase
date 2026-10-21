import { useInfiniteQuery } from '@tanstack/react-query';
import { CATALOG_REVIEW_DISCOVERY_DEFAULT_LIMIT } from '@towelbooks/schemas';

import { EmptyState, LoadingState } from '../../components/feedback';
import { PageContainer, PageHeader, PageShell } from '../../components/layout';
import { Button, ButtonLink } from '../../components/primitives';
import { useDocumentMetadata } from '../../app/DocumentMetadataProvider';
import {
  CatalogReviewCard,
  CatalogReviewCardSkeleton,
} from '../../entities/catalog-reviews/ui';
import { catalogReviewDiscoveryQueryKey } from '../../features/catalog-reviews/queries';
import { ApiProblemPageState } from '../../features/errors';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';
import { INDEXABLE_ROBOTS_DIRECTIVE } from '../../lib/documentMetadata';
import { NotFoundPage } from '../NotFoundPage';

export function CatalogReviewDiscoveryPage() {
  const { formatDate, t } = useI18n();

  usePageTitle({ key: 'catalog.catalogReviewDiscovery.title' });
  useDocumentMetadata({
    canonicalPath: '/catalog-reviews',
    description: { key: 'catalog.catalogReviewDiscovery.metaDescription' },
    robots: INDEXABLE_ROBOTS_DIRECTIVE,
    shareTitle: { key: 'catalog.catalogReviewDiscovery.metaTitle' },
  });

  const reviewsQuery = useInfiniteQuery({
    queryKey: catalogReviewDiscoveryQueryKey(),
    queryFn: ({ pageParam }) =>
      sdk.catalogReviews.list({
        ...(pageParam ? { cursor: pageParam } : {}),
        limit: CATALOG_REVIEW_DISCOVERY_DEFAULT_LIMIT,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage
        ? (lastPage.pageInfo.nextCursor ?? undefined)
        : undefined,
  });

  if (reviewsQuery.error instanceof Error && !reviewsQuery.data) {
    if ('status' in reviewsQuery.error && reviewsQuery.error.status === 404) {
      return <NotFoundPage />;
    }
  }

  const reviews = reviewsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const isInitialLoading = reviewsQuery.isLoading && reviews.length === 0;

  return (
    <PageShell background="paper" minHeight>
      <PageContainer size="comfortable" className="flex min-w-0 flex-col gap-8">
        <PageHeader
          description={t('catalog.catalogReviewDiscovery.description')}
          title={t('catalog.catalogReviewDiscovery.title')}
        />
        <header className="space-y-2 lg:hidden">
          <h1 className="app-text-page-title text-ink">
            {t('catalog.catalogReviewDiscovery.title')}
          </h1>
          <p className="app-text-page-description text-ink-2">
            {t('catalog.catalogReviewDiscovery.description')}
          </p>
        </header>

        {isInitialLoading ? (
          <div className="space-y-4" aria-busy="true">
            <LoadingState label={t('catalog.catalogReviewDiscovery.loading')} />
            {[0, 1, 2].map((index) => (
              <CatalogReviewCardSkeleton key={index} />
            ))}
          </div>
        ) : reviewsQuery.error ? (
          <ApiProblemPageState
            error={reviewsQuery.error}
            title={{ key: 'catalog.catalogReviewDiscovery.error.loadTitle' }}
            body={{ key: 'catalog.catalogReviewDiscovery.error.loadBody' }}
            fallbackAction={
              <Button
                variant="secondary"
                onClick={() => void reviewsQuery.refetch()}
              >
                {t('errors.action.retry')}
              </Button>
            }
            action={
              <ButtonLink to="/catalog" variant="secondary">
                {t('errors.page.backToLibrary')}
              </ButtonLink>
            }
          />
        ) : reviews.length === 0 ? (
          <EmptyState
            body={{ key: 'catalog.catalogReviewDiscovery.emptyBody' }}
            icon="feather"
            title={{ key: 'catalog.catalogReviewDiscovery.emptyTitle' }}
          />
        ) : (
          <div className="space-y-4" aria-live="polite">
            {reviews.map((review) => (
              <CatalogReviewCard
                key={review.id}
                author={review.author}
                catalogEdition={review.catalogEdition}
                catalogWork={review.catalogWork}
                commentCount={review.commentCount}
                dateLabel={t('catalog.catalogReviewDiscovery.publishedOn', {
                  values: { date: formatDate(review.publishedAt) },
                })}
                excerpt={review.excerpt}
                href={`/catalog-reviews/${encodeURIComponent(review.id)}`}
                linkState={{
                  origin: { kind: 'catalog-review-discovery' },
                }}
                title={review.title}
                workHref={`/catalog/${encodeURIComponent(review.catalogWork.id)}`}
                workTypeLabel={t(
                  `catalog.workDetail.type.${review.catalogWork.type}`,
                )}
              />
            ))}

            {reviewsQuery.hasNextPage ? (
              <div className="flex justify-center pt-4">
                <Button
                  isLoading={reviewsQuery.isFetchingNextPage}
                  loadingLabel={t('catalog.catalogReviewDiscovery.loadingMore')}
                  variant="secondary"
                  onClick={() => void reviewsQuery.fetchNextPage()}
                >
                  {t('catalog.catalogReviewDiscovery.loadMore')}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </PageContainer>
    </PageShell>
  );
}
