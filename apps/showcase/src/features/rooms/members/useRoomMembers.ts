import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useStableIntersectionLoadMore } from '../../../hooks/useStableIntersectionLoadMore';
import { sdk } from '../../../lib/sdk';

import type { RefObject } from 'react';

export const ROOM_MEMBERS_PAGE_SIZE = 20;

export function roomMembersQueryKey(roomId: string, q = '') {
  return ['rooms', roomId, 'members', q] as const;
}

export function useRoomMembers(
  roomId: string,
  options?: {
    enabled?: boolean;
    q?: string;
    scrollRootRef?: RefObject<HTMLElement | null>;
  },
) {
  const q = options?.q?.trim() ?? '';
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const query = useInfiniteQuery({
    enabled: options?.enabled ?? true,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      sdk.rooms.listMembers(roomId, {
        ...(pageParam ? { cursor: pageParam } : {}),
        limit: ROOM_MEMBERS_PAGE_SIZE,
        ...(q ? { q } : {}),
      }),
    queryKey: roomMembersQueryKey(roomId, q),
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
    enabled: options?.enabled ?? true,
    hasNextPage,
    isFetchingNextPage,
    loadMore: () => void fetchNextPage(),
    loadMoreRef,
    rootRef: options?.scrollRootRef,
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

export function useDebouncedMemberSearch(initialValue = '') {
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
