import { useCallback, useEffect, useReducer } from 'react';
import { useQuery } from '@tanstack/react-query';

import { sdk } from '../../../lib/sdk';

import type { RoomMemberManagementEvent } from '../types';

const PAGE_SIZE = 20;

type PagesMap = Record<number, RoomMemberManagementEvent[]>;

type HistoryState = {
  currentPage: number;
  pages: PagesMap;
  total: number;
};

type HistoryAction =
  | {
      type: 'accumulate-page';
      page: number;
      items: RoomMemberManagementEvent[];
      total: number;
    }
  | { type: 'next-page' }
  | { type: 'reset' };

function historyReducer(
  state: HistoryState,
  action: HistoryAction,
): HistoryState {
  switch (action.type) {
    case 'accumulate-page': {
      if (state.pages[action.page]) {
        return state;
      }

      return {
        ...state,
        pages: { ...state.pages, [action.page]: action.items },
        total: state.total === 0 ? action.total : state.total,
      };
    }
    case 'next-page':
      return { ...state, currentPage: state.currentPage + 1 };
    case 'reset':
      return { currentPage: 1, pages: {}, total: 0 };
    default:
      return state;
  }
}

type UseRoomMemberManagementHistoryOptions = {
  memberId: string;
  roomId: string;
};

export function useRoomMemberManagementHistory({
  memberId,
  roomId,
}: UseRoomMemberManagementHistoryOptions) {
  const [state, dispatch] = useReducer(historyReducer, {
    currentPage: 1,
    pages: {},
    total: 0,
  });

  const query = useQuery({
    queryKey: [
      'rooms',
      roomId,
      'members',
      memberId,
      'management-history',
      state.currentPage,
    ],
    queryFn: () =>
      sdk.rooms.listMemberManagementHistory(roomId, memberId, {
        page: state.currentPage,
        pageSize: PAGE_SIZE,
      }),
  });

  useEffect(() => {
    dispatch({ type: 'reset' });
  }, [roomId, memberId]);

  useEffect(() => {
    if (query.data && !state.pages[query.data.page]) {
      dispatch({
        type: 'accumulate-page',
        page: query.data.page,
        items: query.data.items,
        total: query.data.total,
      });
    }
  }, [query.data, state.pages]);

  const flattenedItems = Object.keys(state.pages)
    .map(Number)
    .sort((a, b) => a - b)
    .flatMap((page) => state.pages[page] ?? []);

  const hasMore = flattenedItems.length < state.total;

  const isLoadingMore = state.currentPage > 1 && query.isFetching;

  const loadMore = useCallback(() => {
    if (!hasMore || query.isFetching) {
      return;
    }

    dispatch({ type: 'next-page' });
  }, [hasMore, query.isFetching]);

  const retry = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    error: query.error,
    flattenedItems,
    hasMore,
    isLoading: state.currentPage === 1 && query.isLoading,
    isLoadingMore,
    loadMore,
    retry,
  };
}
