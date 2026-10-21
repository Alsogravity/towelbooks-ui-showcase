import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { getApiErrorCode } from '@towelbooks/sdk';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useStableIntersectionLoadMore } from '../../../hooks/useStableIntersectionLoadMore';
import { sdk } from '../../../lib/sdk';

export const ROOM_JOIN_REQUESTS_PAGE_SIZE = 20;

export function roomJoinRequestsQueryKey(roomId: string, q = '') {
  return ['rooms', roomId, 'join-requests', q] as const;
}

export function roomJoinRequestsPendingCountQueryKey(roomId: string) {
  return ['rooms', roomId, 'join-requests', 'pending-count'] as const;
}

export function useRoomJoinRequestsPendingCount(
  roomId: string,
  options?: { enabled?: boolean },
) {
  const query = useQuery({
    enabled: options?.enabled ?? true,
    queryFn: () =>
      sdk.rooms.listJoinRequests(roomId, {
        page: 1,
        pageSize: 1,
      }),
    queryKey: roomJoinRequestsPendingCountQueryKey(roomId),
    select: (data) => data.total,
  });

  return {
    isError: query.isError,
    isLoading: query.isLoading,
    pendingCount: query.data ?? 0,
  };
}

export function useRoomJoinRequests(
  roomId: string,
  options?: { enabled?: boolean; q?: string },
) {
  const q = options?.q?.trim() ?? '';
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const query = useInfiniteQuery({
    enabled: options?.enabled ?? true,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      sdk.rooms.listJoinRequests(roomId, {
        page: pageParam,
        pageSize: ROOM_JOIN_REQUESTS_PAGE_SIZE,
        ...(q ? { q } : {}),
      }),
    queryKey: roomJoinRequestsQueryKey(roomId, q),
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.pageSize;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  useStableIntersectionLoadMore({
    enabled: options?.enabled ?? true,
    hasNextPage,
    isFetchingNextPage,
    loadMore: () => void fetchNextPage(),
    loadMoreRef,
  });

  return {
    error: query.error,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isError: query.isError,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    items,
    loadMoreRef,
    refetch: query.refetch,
  };
}

export function useDebouncedJoinRequestSearch(initialValue = '') {
  const [searchInput, setSearchInput] = useState(initialValue);
  const [debouncedSearch, setDebouncedSearch] = useState(initialValue);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  return {
    debouncedSearch,
    searchInput,
    setSearchInput,
  };
}

export function useRoomJoinRequestActions(roomId: string) {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['rooms', roomId, 'join-requests'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['rooms', roomId, 'overview'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['me', 'room-join-requests'],
      }),
    ]);
  };

  const invalidateIfRequestGone = async (error: unknown) => {
    if (getApiErrorCode(error) === 'ROOM_JOIN_REQUEST_NOT_FOUND') {
      await invalidate();
    }
  };

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) =>
      sdk.rooms.acceptJoinRequest(roomId, requestId),
    onError: invalidateIfRequestGone,
    onSuccess: invalidate,
  });

  const declineMutation = useMutation({
    mutationFn: (requestId: string) =>
      sdk.rooms.declineJoinRequest(roomId, requestId),
    onError: invalidateIfRequestGone,
    onSuccess: invalidate,
  });

  return { acceptMutation, declineMutation };
}
