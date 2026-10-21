import { CircleSpinner, LoadingState } from '../../components/feedback';
import { Alert, Button } from '../../components/primitives';
import { useI18n } from '../../i18n';
import { FollowRequestRow } from './FollowRequestRow';
import { useIncomingFollowRequests } from './useIncomingFollowRequests';

export function FollowRequestsList() {
  const { t } = useI18n();
  const {
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    items,
    loadMoreRef,
    refetch,
  } = useIncomingFollowRequests({ enabled: true });

  if (isLoading) {
    return <LoadingState label={t('notifications.followRequests.loading')} />;
  }

  if (isError) {
    return (
      <Alert variant="warning">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{t('notifications.followRequests.error')}</span>
          <Button onClick={() => void refetch()} size="sm" variant="secondary">
            {t('errors.action.retry')}
          </Button>
        </div>
      </Alert>
    );
  }

  if (items.length === 0) {
    return (
      <p className="rounded-[var(--radius-paper-4)] bg-paper-2 px-4 py-5 body-sm text-ink-3">
        {t('notifications.followRequests.empty')}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <ul>
        {items.map((request) => (
          <li key={request.id}>
            <FollowRequestRow request={request} />
          </li>
        ))}
      </ul>

      {hasNextPage ? (
        <div ref={loadMoreRef} className="flex justify-center py-2">
          {isFetchingNextPage ? (
            <div className="flex justify-center text-ink-3">
              <CircleSpinner
                label={t('notifications.followRequests.loadingMore')}
              />
            </div>
          ) : (
            <Button
              onClick={() => void fetchNextPage()}
              size="sm"
              type="button"
              variant="secondary"
            >
              {t('notifications.followRequests.loadMore')}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
