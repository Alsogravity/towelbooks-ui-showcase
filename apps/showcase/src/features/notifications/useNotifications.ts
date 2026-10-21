import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useMemo, useRef, type RefObject } from 'react';
import type {
  NotificationType,
  UpdateNotificationPreferenceRequest,
} from '@towelbooks/schemas';

import { useStableIntersectionLoadMore } from '../../hooks/useStableIntersectionLoadMore';
import { sdk } from '../../lib/sdk';
import { NOTIFICATIONS_BELL_POLL_MS } from './notificationsPolling';

const NOTIFICATIONS_ROOT_KEY = 'notifications';

export const notificationQueryKeys = {
  list: () => [NOTIFICATIONS_ROOT_KEY, 'list'] as const,
  preferences: () => [NOTIFICATIONS_ROOT_KEY, 'preferences'] as const,
  unreadCount: () => [NOTIFICATIONS_ROOT_KEY, 'unread-count'] as const,
};

export function useUnreadNotificationsCount(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: notificationQueryKeys.unreadCount(),
    queryFn: () => sdk.notifications.unreadCount(),
    refetchInterval: NOTIFICATIONS_BELL_POLL_MS,
    refetchOnWindowFocus: true,
    enabled: options?.enabled ?? true,
  });
}

export function useNotificationsList(options?: {
  enabled?: boolean;
  scrollRootRef?: RefObject<HTMLDivElement | null>;
}) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const enabled = options?.enabled ?? true;
  const scrollRootRef = options?.scrollRootRef;

  const query = useInfiniteQuery({
    enabled,
    queryKey: notificationQueryKeys.list(),
    queryFn: ({ pageParam }) =>
      pageParam
        ? sdk.notifications.list({ cursor: pageParam })
        : sdk.notifications.list(),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage
        ? (lastPage.pageInfo.nextCursor ?? undefined)
        : undefined,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  useStableIntersectionLoadMore({
    enabled,
    hasNextPage,
    isFetchingNextPage,
    loadMore: () => void fetchNextPage(),
    loadMoreRef,
    rootRef: scrollRootRef,
  });

  return {
    ...query,
    items,
    loadMoreRef,
  };
}

export function useAcknowledgeNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => sdk.notifications.acknowledge(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: notificationQueryKeys.list(),
        }),
        queryClient.invalidateQueries({
          queryKey: notificationQueryKeys.unreadCount(),
        }),
      ]);
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationQueryKeys.preferences(),
    queryFn: () => sdk.notifications.getPreferences(),
  });
}

export function useUpdateNotificationPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      type,
      body,
    }: {
      body: UpdateNotificationPreferenceRequest;
      type: NotificationType;
    }) => sdk.notifications.updatePreference(type, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.preferences(),
      });
    },
  });
}
