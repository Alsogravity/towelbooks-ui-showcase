import { useState } from 'react';
import { type RoomJoinRequest } from '@towelbooks/schemas';
import { getApiErrorCode } from '@towelbooks/sdk';

import {
  CircleSpinner,
  LoadingState,
  useToast,
} from '../../../components/feedback';
import { Alert, Avatar, Button, Input } from '../../../components/primitives';
import { handleApiProblem } from '../../errors';
import { useI18n } from '../../../i18n';
import {
  useDebouncedJoinRequestSearch,
  useRoomJoinRequestActions,
  useRoomJoinRequests,
} from '../join/useRoomJoinRequests';

type RoomJoinRequestsSectionProps = {
  roomId: string;
};

function RoomJoinRequestRow({
  onAccept,
  onDecline,
  pendingAction,
  request,
}: {
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  pendingAction: { id: string; type: 'accept' | 'decline' } | null;
  request: RoomJoinRequest;
}) {
  const { t } = useI18n();
  const displayName =
    request.requester.displayName?.trim() ||
    request.requester.username ||
    t('profile.defaultDisplayName');
  const isPending = pendingAction?.id === request.id;

  return (
    <article className="flex min-w-0 items-center gap-3 py-3">
      <Avatar
        background={request.requester.avatar.background}
        foreground={request.requester.avatar.foreground}
        imageAlt={displayName}
        imageUrl={request.requester.avatar.imageUrl}
        initial={request.requester.avatar.initial}
        size="lg"
      />
      <div className="min-w-0 flex-1">
        <p className="app-text-row-title truncate text-ink">{displayName}</p>
        {request.requester.username ? (
          <p className="mt-0.5 truncate text-xs text-ink-3">
            {t('profile.handle', {
              values: { handle: request.requester.username },
            })}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          disabled={isPending}
          isLoading={pendingAction?.type === 'accept' && isPending}
          loadingLabel={t('rooms.joinRequests.accepting')}
          onClick={() => onAccept(request.id)}
          size="sm"
          type="button"
        >
          {t('rooms.joinRequests.accept')}
        </Button>
        <Button
          disabled={isPending}
          isLoading={pendingAction?.type === 'decline' && isPending}
          loadingLabel={t('rooms.joinRequests.declining')}
          onClick={() => onDecline(request.id)}
          size="sm"
          type="button"
          variant="secondary"
        >
          {t('rooms.joinRequests.decline')}
        </Button>
      </div>
    </article>
  );
}

export function RoomJoinRequestsSection({
  roomId,
}: RoomJoinRequestsSectionProps) {
  const { t } = useI18n();
  const { pushToast } = useToast();
  const { debouncedSearch, searchInput, setSearchInput } =
    useDebouncedJoinRequestSearch();
  const {
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    items,
    loadMoreRef,
    refetch,
    error,
  } = useRoomJoinRequests(roomId, {
    q: debouncedSearch,
  });
  const { acceptMutation, declineMutation } = useRoomJoinRequestActions(roomId);
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    type: 'accept' | 'decline';
  } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <LoadingState
        label={{
          key: 'rooms.joinRequests.loading',
          fallback: 'Loading join requests...',
        }}
      />
    );
  }

  if (isError) {
    return (
      <Alert variant="warning">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>
            {
              handleApiProblem(error, {
                fallbackKey: 'rooms.joinRequests.error.load',
                t,
              }).message
            }
          </span>
          <Button onClick={() => void refetch()} size="sm" variant="secondary">
            {t('errors.action.retry')}
          </Button>
        </div>
      </Alert>
    );
  }

  const showEmpty = items.length === 0;

  const handleActionError = (error: unknown) => {
    if (getApiErrorCode(error) === 'ROOM_JOIN_REQUEST_NOT_FOUND') {
      pushToast({
        title: t('rooms.join.error.requestNotFound'),
        variant: 'error',
      });
      return;
    }

    setActionError(
      handleApiProblem(error, {
        fallbackKey: 'rooms.joinRequests.error.action',
        messageKeys: {
          ROOM_JOIN_REQUEST_NOT_FOUND: 'rooms.join.error.requestNotFound',
        },
        t,
      }).message,
    );
  };

  const handleAccept = (requestId: string) => {
    setActionError(null);
    setPendingAction({ id: requestId, type: 'accept' });
    acceptMutation.mutate(requestId, {
      onError: handleActionError,
      onSettled: () => setPendingAction(null),
    });
  };

  const handleDecline = (requestId: string) => {
    setActionError(null);
    setPendingAction({ id: requestId, type: 'decline' });
    declineMutation.mutate(requestId, {
      onError: handleActionError,
      onSettled: () => setPendingAction(null),
    });
  };

  return (
    <section aria-label={t('rooms.joinRequests.title')} className="space-y-3">
      <Input
        aria-label={t('rooms.joinRequests.search.label')}
        className="h-10 w-full border-rule/60 bg-vellum/50 text-sm focus:bg-vellum"
        clearable
        clearButtonLabel={t('rooms.list.search.clearLabel')}
        enterKeyHint="search"
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder={t('rooms.joinRequests.search.placeholder')}
        prependIcon="search"
        type="search"
        value={searchInput}
      />
      {actionError ? <Alert variant="error">{actionError}</Alert> : null}
      {showEmpty ? (
        <p className="text-sm text-ink-3">{t('rooms.joinRequests.empty')}</p>
      ) : (
        <>
          <ul className="divide-y divide-rule">
            {items.map((request) => (
              <li key={request.id}>
                <RoomJoinRequestRow
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  pendingAction={pendingAction}
                  request={request}
                />
              </li>
            ))}
          </ul>
          {hasNextPage ? (
            <div ref={loadMoreRef} className="flex justify-center py-2">
              {isFetchingNextPage ? (
                <div className="flex justify-center text-ink-3">
                  <CircleSpinner label={t('rooms.joinRequests.loadingMore')} />
                </div>
              ) : (
                <Button
                  onClick={() => void fetchNextPage()}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  {t('rooms.joinRequests.loadMore')}
                </Button>
              )}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
