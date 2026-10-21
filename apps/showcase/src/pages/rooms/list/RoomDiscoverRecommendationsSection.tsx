import { type RoomDiscoveryItem } from '@towelbooks/schemas';

import { EmptyState } from '../../../components/feedback';
import { Alert, Button } from '../../../components/primitives';
import { RoomCardSkeleton } from '../../../entities/room/ui';
import { useI18n } from '../../../i18n';
import { RoomDiscoverEmptyStateLayout } from './RoomDiscoverEmptyStateLayout';
import { RoomDiscoverRoomList } from './RoomDiscoverRoomList';

const RECOMMENDATION_SKELETON_COUNT = 3;

type RoomDiscoverRecommendationsSectionProps = {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  results: RoomDiscoveryItem[] | null;
};

function RecommendationsSkeleton({ label }: { label: string }) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      aria-live="polite"
      className="flex flex-col gap-4"
      role="status"
    >
      {Array.from({ length: RECOMMENDATION_SKELETON_COUNT }).map((_, index) => (
        <RoomCardSkeleton key={index} variant="horizontal" />
      ))}
    </div>
  );
}

export function RoomDiscoverRecommendationsSection({
  isError,
  isLoading,
  onRetry,
  results,
}: RoomDiscoverRecommendationsSectionProps) {
  const { t } = useI18n();

  return (
    <section
      aria-labelledby="rooms-discover-recommendations-heading"
      className="flex flex-col gap-4"
    >
      <h3
        id="rooms-discover-recommendations-heading"
        className="app-text-section-title text-ink"
      >
        {t('rooms.list.discover.recommendations.heading')}
      </h3>

      {isError ? (
        <Alert
          className="flex flex-wrap items-center justify-between gap-3"
          variant="error"
        >
          <span className="app-text-body-sm min-w-0 flex-1 text-left">
            {t('rooms.list.discover.recommendations.error')}
          </span>
          <Button onClick={onRetry} size="sm" variant="secondary">
            {t('rooms.list.discover.recommendations.retry')}
          </Button>
        </Alert>
      ) : null}

      {isLoading && results === null ? (
        <RecommendationsSkeleton
          label={t('rooms.list.discover.recommendations.loading')}
        />
      ) : null}

      {!isLoading && !isError && results?.length === 0 ? (
        <RoomDiscoverEmptyStateLayout>
          <EmptyState
            className="-translate-y-8"
            icon="sparkles"
            title={{
              key: 'rooms.list.discover.recommendations.empty.title',
            }}
            body={{
              key: 'rooms.list.discover.recommendations.empty.body',
            }}
          />
        </RoomDiscoverEmptyStateLayout>
      ) : null}

      {results && results.length > 0 ? (
        <RoomDiscoverRoomList
          ariaLabel={t('rooms.list.discover.recommendations.listLabel')}
          rooms={results}
        />
      ) : null}
    </section>
  );
}
