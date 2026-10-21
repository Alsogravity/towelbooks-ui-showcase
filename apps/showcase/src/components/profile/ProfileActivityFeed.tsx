import { ProfileActivityItem } from './ProfileActivityItem';
import { useProfileActivityFeed } from './useProfileActivityFeed';
import { EmptyPanel } from './stats/panels/EmptyPanel';
import { CircleSpinner } from '../../components/feedback';
import { Alert, Button } from '../../components/primitives';
import { useI18n } from '../../i18n';

type ProfileActivityFeedProps = {
  username: string;
};

export function ProfileActivityFeed({ username }: ProfileActivityFeedProps) {
  const { t } = useI18n();
  const {
    error,
    fetchNextPage,
    hasLoadedData,
    hasNextPage,
    isFetchingNextPage,
    isInitialLoading,
    isNextPageError,
    items: activityEvents,
    loadMoreRef,
    refetch,
  } = useProfileActivityFeed(username);
  const supportsIntersectionObserver =
    typeof IntersectionObserver === 'function';

  if (isInitialLoading) {
    return (
      <div
        aria-label={t('profile.feed.loading')}
        className="space-y-6"
        role="status"
      >
        {[0, 1, 2].map((item) => (
          <div className="flex items-center gap-4" key={item}>
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-vellum" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-4 w-2/3 animate-pulse rounded bg-vellum" />
              <div className="h-3 w-32 animate-pulse rounded bg-vellum/80" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error && !hasLoadedData) {
    return (
      <Alert variant="warning">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{t('profile.feed.error')}</span>
          <Button onClick={() => void refetch()} size="sm" variant="secondary">
            {t('errors.action.retry')}
          </Button>
        </div>
      </Alert>
    );
  }

  if (activityEvents.length === 0) {
    return (
      <EmptyPanel
        icon="profile-activity"
        message={t('profile.empty.activity')}
      />
    );
  }

  return (
    <section
      aria-label={t('profile.feed.activityTitle')}
      className="space-y-4 sm:space-y-5"
    >
      <ol className="flex flex-col gap-3 sm:gap-4">
        {activityEvents.map((event) => (
          <li key={event.id}>
            <ProfileActivityItem event={event} username={username} />
          </li>
        ))}
      </ol>
      {isNextPageError ? (
        <Alert variant="warning" role="alert">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm">
              {t('profile.feed.nextPageError')}
              <span className="ml-1 text-ink-3">
                {t('profile.feed.preservedNotice')}
              </span>
            </span>
            <Button
              disabled={isFetchingNextPage}
              isLoading={isFetchingNextPage}
              loadingLabel={t('profile.feed.retryNextPage')}
              onClick={() => void fetchNextPage()}
              size="sm"
              variant="secondary"
            >
              {t('profile.feed.retryNextPage')}
            </Button>
          </div>
        </Alert>
      ) : hasNextPage ? (
        supportsIntersectionObserver ? (
          <div ref={loadMoreRef} className="flex justify-center py-2">
            {isFetchingNextPage ? (
              <div className="flex justify-center py-1 text-ink-3">
                <CircleSpinner label={t('profile.feed.loadingMore')} />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex justify-center pt-1">
            <Button
              disabled={isFetchingNextPage}
              isLoading={isFetchingNextPage}
              loadingLabel={t('profile.feed.loadingMore')}
              onClick={() => void fetchNextPage()}
              size="sm"
              variant="secondary"
            >
              {t('profile.feed.loadMore')}
            </Button>
          </div>
        )
      ) : null}
    </section>
  );
}
