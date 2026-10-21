import { useEffect, useMemo, type ReactNode, type RefObject } from 'react';

import { NotificationEmptyState } from './NotificationEmptyState';
import { NotificationItem } from './NotificationItem';
import { useNotificationsPanel } from './NotificationsPanelContext';
import { NotificationSkeleton } from './NotificationSkeleton';
import {
  getNotificationCenterFeedItemKey,
  groupNotificationCenterItemsByDate,
  type NotificationCenterFeedItem,
  type NotificationCenterSectionKey,
} from './notificationCenterGrouping';
import { useNotificationsList } from './useNotifications';
import { CircleSpinner } from '../../components/feedback';
import { Alert, Button } from '../../components/primitives';
import { useI18n } from '../../i18n';
import { FollowRequestRow } from '../follow-requests/FollowRequestRow';
import { FollowRequestsSummaryRow } from '../follow-requests/FollowRequestsSummaryRow';
import { useFollowRequestsSummary } from '../follow-requests/useFollowRequestsSummary';
import { useIncomingFollowRequests } from '../follow-requests/useIncomingFollowRequests';
import { RoomMemberInviteRow } from '../room-member-invites/RoomMemberInviteRow';
import { useIncomingRoomMemberInvites } from '../room-member-invites/useIncomingRoomMemberInvites';
import { useRoomMemberInvitesSummary } from '../room-member-invites/useRoomMemberInvitesSummary';
import { RoomJoinRequestsSummaryRow } from '../room-join-requests/RoomJoinRequestsSummaryRow';
import { useRoomJoinRequestsSummary } from '../room-join-requests/useRoomJoinRequestsSummary';

type NotificationCenterProps = {
  onOpenFollowRequests: () => void;
  onOpenRoomJoinRequests: () => void;
  scrollRootRef?: RefObject<HTMLDivElement | null>;
};

const notificationSectionLabelKeys: Record<
  NotificationCenterSectionKey,
  string
> = {
  previous: 'notifications.section.previous',
  thisMonth: 'notifications.section.thisMonth',
  thisWeek: 'notifications.section.thisWeek',
  today: 'notifications.section.today',
};

type NotificationSectionHeaderProps = {
  children: ReactNode;
  id: string;
};

function NotificationSectionHeader({
  children,
  id,
}: NotificationSectionHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <h3 className="app-text-row-title m-0 text-ink-3" id={id}>
        {children}
      </h3>
      <span aria-hidden="true" className="h-px flex-1 bg-rule/70" />
    </div>
  );
}

export function NotificationCenter({
  onOpenFollowRequests,
  onOpenRoomJoinRequests,
  scrollRootRef,
}: NotificationCenterProps) {
  const { t } = useI18n();
  const {
    registerFollowRequestsSummary,
    registerRoomJoinRequestsSummary,
    registerRoomMemberInvitesSummary,
    registerVisibleUnreadNotifications,
    sessionOpenedAt,
    sessionUnreadIds,
  } = useNotificationsPanel();
  const listQuery = useNotificationsList({ scrollRootRef });
  const followRequestsSummaryQuery = useFollowRequestsSummary();
  const roomJoinRequestsSummaryQuery = useRoomJoinRequestsSummary();
  const roomMemberInvitesSummaryQuery = useRoomMemberInvitesSummary();
  const followRequestsQuery = useIncomingFollowRequests({ enabled: true });
  const roomMemberInvitesQuery = useIncomingRoomMemberInvites({
    enabled: true,
  });
  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    items: notifications,
    loadMoreRef,
  } = listQuery;
  const followRequests = followRequestsQuery.items;
  const roomMemberInvites = roomMemberInvitesQuery.items;
  const followRequestsSummary = followRequestsSummaryQuery.data;
  const roomJoinRequestsSummary = roomJoinRequestsSummaryQuery.data;
  const roomMemberInvitesSummary = roomMemberInvitesSummaryQuery.data;
  const feedItems = useMemo<NotificationCenterFeedItem[]>(
    () =>
      [
        ...notifications.map((notification) => ({
          createdAt: notification.createdAt,
          id: notification.id,
          kind: 'notification' as const,
          notification,
        })),
        ...followRequests.map((request) => ({
          createdAt: request.createdAt,
          id: request.id,
          kind: 'followRequest' as const,
          request,
        })),
        ...roomMemberInvites.map((invite) => ({
          createdAt: invite.createdAt,
          id: invite.id,
          kind: 'roomMemberInvite' as const,
          invite,
        })),
      ].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [followRequests, notifications, roomMemberInvites],
  );
  const feedSections = groupNotificationCenterItemsByDate(feedItems);
  const unreadCount = listQuery.data?.pages?.[0]?.unreadCount ?? 0;
  const supportsIntersectionObserver =
    typeof IntersectionObserver === 'function';

  useEffect(() => {
    if (sessionOpenedAt === null || followRequestsSummary === undefined) {
      return;
    }

    registerFollowRequestsSummary({
      snapshotAt: followRequestsSummary.snapshotAt,
      unseenCount: followRequestsSummary.unseenCount,
    });
  }, [followRequestsSummary, registerFollowRequestsSummary, sessionOpenedAt]);

  useEffect(() => {
    if (sessionOpenedAt === null || roomJoinRequestsSummary === undefined) {
      return;
    }

    registerRoomJoinRequestsSummary({
      snapshotAt: roomJoinRequestsSummary.snapshotAt,
      unseenCount: roomJoinRequestsSummary.unseenCount,
    });
  }, [
    registerRoomJoinRequestsSummary,
    roomJoinRequestsSummary,
    sessionOpenedAt,
  ]);

  useEffect(() => {
    if (sessionOpenedAt === null || roomMemberInvitesSummary === undefined) {
      return;
    }

    registerRoomMemberInvitesSummary({
      snapshotAt: roomMemberInvitesSummary.snapshotAt,
      unseenCount: roomMemberInvitesSummary.unseenCount,
    });
  }, [
    registerRoomMemberInvitesSummary,
    roomMemberInvitesSummary,
    sessionOpenedAt,
  ]);

  useEffect(() => {
    if (sessionOpenedAt === null || listQuery.data === undefined) {
      return;
    }

    registerVisibleUnreadNotifications({
      unreadCount,
      unreadIds: notifications
        .filter(
          (notification) =>
            notification.readAt === null &&
            new Date(notification.createdAt).getTime() <= sessionOpenedAt,
        )
        .map((notification) => notification.id),
    });
  }, [
    listQuery.data,
    notifications,
    registerVisibleUnreadNotifications,
    sessionOpenedAt,
    unreadCount,
  ]);

  return (
    <section className="space-y-4">
      {listQuery.isLoading ? (
        <NotificationSkeleton />
      ) : listQuery.isError ? (
        <Alert variant="warning">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{t('notifications.list.error')}</span>
            <Button
              onClick={() => void listQuery.refetch()}
              size="sm"
              variant="secondary"
            >
              {t('errors.action.retry')}
            </Button>
          </div>
        </Alert>
      ) : feedItems.length === 0 &&
        !followRequestsQuery.isLoading &&
        !roomJoinRequestsSummaryQuery.isLoading &&
        !roomMemberInvitesQuery.isLoading &&
        (roomJoinRequestsSummary?.pendingCount ?? 0) === 0 ? (
        <NotificationEmptyState />
      ) : (
        <>
          {followRequestsSummary && followRequestsSummary.pendingCount > 0 ? (
            <FollowRequestsSummaryRow
              onOpen={onOpenFollowRequests}
              summary={followRequestsSummary}
            />
          ) : null}

          {roomJoinRequestsSummary &&
          roomJoinRequestsSummary.pendingCount > 0 ? (
            <RoomJoinRequestsSummaryRow
              onOpen={onOpenRoomJoinRequests}
              pendingCount={roomJoinRequestsSummary.pendingCount}
              preview={roomJoinRequestsSummary.preview}
            />
          ) : null}

          <div className="space-y-5">
            {feedSections.map((section) => {
              const headingId = `notifications-section-${section.key}`;

              return (
                <section
                  aria-labelledby={headingId}
                  className="space-y-3"
                  key={section.key}
                >
                  <NotificationSectionHeader id={headingId}>
                    {t(notificationSectionLabelKeys[section.key])}
                  </NotificationSectionHeader>
                  <ul>
                    {section.items.map((item) => (
                      <li key={getNotificationCenterFeedItemKey(item)}>
                        {item.kind === 'notification' ? (
                          <NotificationItem
                            isUnreadHighlighted={sessionUnreadIds.has(
                              item.notification.id,
                            )}
                            notification={item.notification}
                          />
                        ) : item.kind === 'followRequest' ? (
                          <FollowRequestRow
                            isUnreadHighlighted={
                              (followRequestsSummary?.unseenCount ?? 0) > 0 &&
                              sessionOpenedAt !== null &&
                              new Date(item.request.createdAt).getTime() <=
                                sessionOpenedAt
                            }
                            request={item.request}
                            variant="feed"
                          />
                        ) : (
                          <RoomMemberInviteRow invite={item.invite} />
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>

          {hasNextPage ? (
            supportsIntersectionObserver ? (
              <div ref={loadMoreRef} className="flex justify-center py-2">
                {isFetchingNextPage ? (
                  <div className="flex justify-center text-ink-3">
                    <CircleSpinner label={t('notifications.list.loading')} />
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex justify-center pt-2">
                <Button
                  disabled={isFetchingNextPage}
                  isLoading={isFetchingNextPage}
                  loadingLabel={t('notifications.list.loading')}
                  onClick={() => void fetchNextPage()}
                  size="sm"
                  variant="secondary"
                >
                  {t('notifications.list.loadMore')}
                </Button>
              </div>
            )
          ) : null}
        </>
      )}
    </section>
  );
}
