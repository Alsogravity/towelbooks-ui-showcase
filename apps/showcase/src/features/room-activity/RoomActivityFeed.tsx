import { RoomActivityEmptyState } from './RoomActivityEmptyState';
import { RoomActivityItem } from './RoomActivityItem';
import { RoomActivitySkeleton } from './RoomActivitySkeleton';
import { useRoomActivityFeed } from './useRoomActivityFeed';
import { CircleSpinner } from '../../components/feedback';
import { Alert, Button } from '../../components/primitives';
import { useI18n } from '../../i18n';

type RoomActivityFeedProps = {
  roomId: string;
};

export function RoomActivityFeed({ roomId }: RoomActivityFeedProps) {
  const { t } = useI18n();
  const {
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    items: activityEvents,
    loadMoreRef,
    refetch,
  } = useRoomActivityFeed(roomId);
  const supportsIntersectionObserver =
    typeof IntersectionObserver === 'function';

  if (isLoading) {
    return <RoomActivitySkeleton />;
  }

  if (error) {
    return (
      <Alert variant="warning">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{t('rooms.detail.activity.error')}</span>
          <Button onClick={() => void refetch()} size="sm" variant="secondary">
            {t('errors.action.retry')}
          </Button>
        </div>
      </Alert>
    );
  }

  if (activityEvents.length === 0) {
    return <RoomActivityEmptyState />;
  }

  return (
    <section
      aria-label={t('rooms.detail.activity.eyebrow')}
      className="space-y-4 sm:space-y-5"
    >
      <ol className="flex flex-col gap-3 sm:gap-4">
        {activityEvents.map((event) => (
          <li key={event.id}>
            <RoomActivityItem event={event} />
          </li>
        ))}
      </ol>
      {hasNextPage ? (
        supportsIntersectionObserver ? (
          <div ref={loadMoreRef} className="flex justify-center py-2">
            {isFetchingNextPage ? (
              <div className="flex justify-center py-1 text-ink-3">
                <CircleSpinner label={t('rooms.detail.activity.loadingMore')} />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex justify-center pt-1">
            <Button
              disabled={isFetchingNextPage}
              isLoading={isFetchingNextPage}
              loadingLabel={t('rooms.detail.activity.loadingMore')}
              onClick={() => void fetchNextPage()}
              size="sm"
              variant="secondary"
            >
              {t('rooms.detail.activity.loadMore')}
            </Button>
          </div>
        )
      ) : null}
    </section>
  );
}
