import { Link } from 'react-router';

import {
  BrowseSection,
  BrowseSectionCarousel,
} from '../../../components/layout';
import { Alert, Button } from '../../../components/primitives';
import {
  CatalogWorkCard,
  CatalogWorkCardSkeleton,
} from '../../../entities/reading/ui';
import { catalogCoverSourcesFromUrl } from '../../../entities/reading/ui/coverImages';

import { useI18n } from '../../../i18n';

import type { ContinueCatalogWork } from '../content';

interface CatalogCarouselProps {
  isError: boolean;
  items: ContinueCatalogWork[];
  isLoading: boolean;
  onRetry: () => void;
  seeAllLabel: string;
  seeAllTo: string;
  title: string;
}

const SKELETON_COUNT = 4;
const COVER_WIDTH = 180;

export function CatalogCarousel({
  isError,
  items,
  isLoading,
  onRetry,
  seeAllLabel,
  seeAllTo,
  title,
}: CatalogCarouselProps) {
  const { t } = useI18n();

  if (items.length > 0) {
    return (
      <BrowseSection
        title={title}
        titleAction={{ ariaLabel: seeAllLabel, to: seeAllTo }}
      >
        <BrowseSectionCarousel
          ariaLabel={title}
          itemWidth={COVER_WIDTH}
          nextLabel={t('dashboard.section.carouselNext', {
            values: { title },
          })}
          previousLabel={t('dashboard.section.carouselPrevious', {
            values: { title },
          })}
        >
          {items.map((book) => (
            <Link
              key={book.href}
              to={book.href}
              className="group block shrink-0 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2"
            >
              <CatalogWorkCard
                author={book.author ?? ''}
                coverDelivery={{
                  loading: 'lazy',
                  preferredVariant: 'detail',
                }}
                coverSources={catalogCoverSourcesFromUrl(
                  book.coverUrl,
                  book.coverThumbnailUrl,
                  book.coverGeometry,
                )}
                coverWidth={COVER_WIDTH}
                hideAuthor
                hideTitle
                themeSeed={book.href}
                title={book.title}
              />
            </Link>
          ))}
        </BrowseSectionCarousel>
      </BrowseSection>
    );
  }

  if (isLoading) {
    return (
      <BrowseSection title={title}>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <CatalogWorkCardSkeleton key={index} coverWidth={COVER_WIDTH} />
          ))}
        </div>
      </BrowseSection>
    );
  }

  if (isError) {
    return (
      <BrowseSection title={title}>
        <Alert variant="warning">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{t('dashboard.catalog.error')}</span>
            <Button onClick={onRetry} size="sm" variant="secondary">
              {t('errors.action.retry')}
            </Button>
          </div>
        </Alert>
      </BrowseSection>
    );
  }

  return null;
}
