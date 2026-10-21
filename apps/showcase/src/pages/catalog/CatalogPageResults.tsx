import { Link } from 'react-router';

import { EmptyState, ErrorState } from '../../components/feedback';
import { Button, Pagination } from '../../components/primitives';
import {
  CatalogWorkCard,
  CatalogWorkCardSkeleton,
} from '../../entities/reading/ui';
import { CATALOG_SHELF_GRID_CLASS_NAME } from '../../entities/reading/ui/catalogShelfGrid';
import { useI18n } from '../../i18n';
import {
  BookStackIllustration,
  OpenBookIllustration,
} from '../dashboard/ui/illustrations';
import {
  CATALOG_PAGE_SIZE,
  type CatalogWorkSearchResult,
} from './useCatalogPageState';

type CatalogPageResultsProps = {
  currentPage: number;
  error: unknown;
  isLoading: boolean;
  onPageChange: (nextPage: number) => void;
  onRetry: () => void;
  results: CatalogWorkSearchResult[];
  submittedQuery: string;
  totalCatalogWorks: number;
};

export function CatalogPageResults({
  currentPage,
  error,
  isLoading,
  onPageChange,
  onRetry,
  results,
  submittedQuery,
  totalCatalogWorks,
}: CatalogPageResultsProps) {
  const { formatNumber, t } = useI18n();

  if (isLoading) {
    return (
      <div
        aria-label={t('catalog.works.loading', {
          fallback: 'Loading catalog...',
        })}
        aria-busy="true"
        aria-live="polite"
        className="flex w-full min-w-0 flex-col gap-6"
        role="status"
      >
        <div aria-hidden="true" className={CATALOG_SHELF_GRID_CLASS_NAME}>
          {Array.from({ length: CATALOG_PAGE_SIZE }).map((_, index) => (
            <CatalogWorkCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorState
          action={
            <Button variant="secondary" onClick={() => void onRetry()}>
              {t('catalog.works.error.retry')}
            </Button>
          }
          body={{
            key: 'catalog.works.error.body',
            fallback: 'Try again in a moment.',
          }}
          title={{
            key: 'catalog.works.error.title',
            fallback: 'Unable to load the catalog.',
          }}
        />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center gap-6">
        {submittedQuery.length > 0 ? (
          <EmptyState
            className="-translate-y-16"
            ornament={
              <OpenBookIllustration
                className="text-ink-3"
                width={184}
                height={184}
              />
            }
            body={{
              key: 'catalog.works.noResultsBody',
              fallback:
                'Try a different title, creator, or ISBN already imported into TowelBooks.',
            }}
            title={{
              key: 'catalog.works.noResultsTitle',
              fallback: 'No works found',
            }}
          />
        ) : (
          <EmptyState
            className="-translate-y-16"
            ornament={
              <BookStackIllustration
                className="text-ink-3"
                width={184}
                height={184}
              />
            }
            body={{
              key: 'catalog.works.catalogEmptyBody',
              fallback:
                'The TowelBooks catalog is still empty. Works will appear here as they are added to the shared catalog.',
            }}
            title={{
              key: 'catalog.works.catalogEmptyTitle',
              fallback: 'No works in the catalog yet',
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-6">
      <div className={CATALOG_SHELF_GRID_CLASS_NAME}>
        {results.map((candidate) => (
          <Link
            className="group relative flex w-full flex-col items-start rounded-xl text-left no-underline transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brick/30"
            key={candidate.catalogWorkId}
            to={`/catalog/${candidate.catalogWorkId}`}
          >
            <CatalogWorkCard
              author={
                candidate.contributors.join(', ') ||
                t('catalog.works.result.unknownContributor')
              }
              coverDelivery={{ loading: 'lazy', preferredVariant: 'detail' }}
              coverSources={[candidate]}
              themeSeed={candidate.catalogWorkId}
              title={candidate.display.title}
              titleAs="h2"
            />
          </Link>
        ))}
      </div>
      {totalCatalogWorks > 0 ? (
        <div className="mt-auto flex flex-wrap items-center justify-end gap-x-4 gap-y-6 border-t border-rule pt-4 sm:gap-y-4">
          <Pagination
            page={currentPage}
            totalPages={Math.max(
              1,
              Math.ceil(totalCatalogWorks / CATALOG_PAGE_SIZE),
            )}
            currentPageLabel={(pageNumber) =>
              t('catalog.works.pagination.currentPage', {
                values: { page: formatNumber(pageNumber) },
              })
            }
            navLabel={t('catalog.works.pagination.nav')}
            nextLabel={t('libraries.pagination.next')}
            onPageChange={onPageChange}
            pageLabel={(pageNumber) =>
              t('catalog.works.pagination.page', {
                values: { page: formatNumber(pageNumber) },
              })
            }
            previousLabel={t('libraries.pagination.previous')}
          />
        </div>
      ) : null}
    </div>
  );
}
