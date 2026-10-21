import { useEffect, useRef } from 'react';

import {
  CircleSpinner,
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../../components/feedback';
import { Button } from '../../../components/primitives';
import { useI18n } from '../../../i18n';

import {
  getRoomMemberAccessSourceLabelKey,
  getRoomMemberManagementEventTypeLabelKey,
  getRoomMemberRoleLabelKey,
} from './roomMembersDisplay';
import { useRoomMemberManagementHistory } from './useRoomMemberManagementHistory';

import type { RoomMember } from '../types';

const LOAD_MORE_ROOT_MARGIN = '160px 0px';

type RoomMemberManagementHistoryContentProps = {
  member: RoomMember;
  roomId: string;
};

export function RoomMemberManagementHistoryContent({
  member,
  roomId,
}: RoomMemberManagementHistoryContentProps) {
  const { t, formatDate } = useI18n();
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  const {
    error,
    flattenedItems,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
    retry,
  } = useRoomMemberManagementHistory({ memberId: member.id, roomId });

  useEffect(() => {
    if (!hasMore || isLoadingMore) {
      return;
    }

    const sentinel = loadMoreSentinelRef.current;

    if (!sentinel || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        observer.disconnect();
        loadMore();
      },
      { root: null, rootMargin: LOAD_MORE_ROOT_MARGIN },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, loadMore]);

  if (isLoading) {
    return (
      <LoadingState
        label={{
          key: 'rooms.members.management.history.loading',
          fallback: 'Loading history...',
        }}
        className="p-4"
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title={{
          key: 'rooms.members.management.history.error.title',
          fallback: 'Unable to load history.',
        }}
        body={{
          key: 'rooms.members.management.history.error.body',
          fallback: 'Try again in a moment.',
        }}
        action={
          <Button variant="secondary" onClick={() => void retry()}>
            {t('errors.action.retry')}
          </Button>
        }
      />
    );
  }

  if (flattenedItems.length === 0) {
    return (
      <section className="flex min-h-0 flex-1 flex-col items-center justify-center">
        <EmptyState
          className="mb-0"
          icon="history"
          title={{
            key: 'rooms.members.management.history.empty.title',
            fallback: 'No management history yet',
          }}
          body={{
            key: 'rooms.members.management.history.empty.body',
            fallback:
              'Access, role, and participation changes for this member will appear here.',
          }}
        />
      </section>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="divide-y divide-rule">
        {flattenedItems.map((event, index) => (
          <HistoryEventRow
            key={`history-${event.occurredAt}-${index}`}
            event={event}
            formatDate={formatDate}
            t={t}
          />
        ))}
      </div>

      {hasMore ? (
        <div
          ref={loadMoreSentinelRef}
          aria-hidden={isLoadingMore ? undefined : true}
          className={
            isLoadingMore ? 'border-t border-rule px-4 pb-8 pt-5' : 'h-px'
          }
        >
          {isLoadingMore ? (
            <div className="flex justify-center text-ink-3">
              <CircleSpinner
                label={t('rooms.members.management.history.loadingMore')}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

type HistoryEventRowProps = {
  event: {
    type: string;
    occurredAt: string;
    actor: {
      displayName: string | null;
      kind: string;
    };
    metadata: Record<string, string | null | undefined>;
  };
  formatDate: (value: string) => string;
  t: (key: string, options?: { values?: Record<string, string> }) => string;
};

function HistoryEventRow({ event, formatDate, t }: HistoryEventRowProps) {
  const eventTypeLabel = t(
    getRoomMemberManagementEventTypeLabelKey(
      event.type as Parameters<
        typeof getRoomMemberManagementEventTypeLabelKey
      >[0],
    ),
  );

  const actorLabel =
    event.actor.displayName ??
    t('rooms.members.management.history.actorSystem');

  const metadataRows = buildMetadataRows(event, t);

  return (
    <div className="px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="app-text-caption font-medium text-ink">
            {eventTypeLabel}
          </p>
          <p className="meta mt-0.5 text-ink-3">{actorLabel}</p>
        </div>
        <time
          className="meta mt-0.5 shrink-0 text-ink-3"
          dateTime={event.occurredAt}
        >
          {formatDate(event.occurredAt)}
        </time>
      </div>

      {metadataRows.length > 0 ? (
        <div className="mt-2 space-y-1 border-t border-rule pt-2">
          {metadataRows.map((row, i) => (
            <div
              key={`${row.label}-${i}`}
              className="flex items-baseline gap-2"
            >
              <span className="meta shrink-0 text-ink-3">{row.label}:</span>
              <span className="app-text-caption text-ink">{row.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function buildMetadataRows(
  event: {
    metadata: {
      source?: string | undefined;
      previousRole?: string | undefined;
      newRole?: string | undefined;
      previousExpiresAt?: string | null | undefined;
      newExpiresAt?: string | null | undefined;
    };
  },
  t: (key: string) => string,
): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];

  if (event.metadata.source) {
    rows.push({
      label: t('rooms.members.management.history.metadata.source'),
      value: t(
        getRoomMemberAccessSourceLabelKey(
          event.metadata.source as Parameters<
            typeof getRoomMemberAccessSourceLabelKey
          >[0],
        ),
      ),
    });
  }

  if (event.metadata.previousRole) {
    rows.push({
      label: t('rooms.members.management.history.metadata.previousRole'),
      value: t(
        getRoomMemberRoleLabelKey(
          event.metadata.previousRole as Parameters<
            typeof getRoomMemberRoleLabelKey
          >[0],
        ),
      ),
    });
  }

  if (event.metadata.newRole) {
    rows.push({
      label: t('rooms.members.management.history.metadata.newRole'),
      value: t(
        getRoomMemberRoleLabelKey(
          event.metadata.newRole as Parameters<
            typeof getRoomMemberRoleLabelKey
          >[0],
        ),
      ),
    });
  }

  return rows;
}
