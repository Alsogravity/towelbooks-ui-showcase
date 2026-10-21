import { ApiRequestError } from '@towelbooks/sdk';
import { useQuery } from '@tanstack/react-query';

import { type RoomDetailTabKey } from './roomDetailViewModel';
import { getPollListKey } from '../community/polls/pollQueryKeys';
import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';

import type {
  PaginatedDiscussionsResponse,
  PaginatedPollsResponse,
  PaginatedReadingsResponse,
  CommunitySettings,
  RoomOverview,
} from '@towelbooks/schemas';

export function hasBlockingQueryError<T>({
  data,
  isError,
  isLoadingError,
}: {
  data: T | undefined;
  isError: boolean;
  isLoadingError: boolean;
}) {
  return isLoadingError || (isError && data === undefined);
}

export function shouldRetryRoomDetailQuery(
  failureCount: number,
  error: unknown,
) {
  if (
    error instanceof ApiRequestError &&
    (error.status === 403 || error.status === 404)
  ) {
    return false;
  }

  return failureCount < 1;
}

export type RoomDetailData = {
  community: {
    discussions: PaginatedDiscussionsResponse | undefined;
    hasBlockingDiscussionsError: boolean;
    hasBlockingPollsError: boolean;
    hasBlockingCommunitySettingsError: boolean;
    isLoadingDiscussions: boolean;
    isLoadingPolls: boolean;
    isLoadingCommunitySettings: boolean;
    polls: PaginatedPollsResponse | undefined;
    refetchDiscussions: () => Promise<unknown>;
    refetchPolls: () => Promise<unknown>;
    refetchCommunitySettings: () => Promise<unknown>;
    settings: CommunitySettings | undefined;
  };
  hasSecondaryError: boolean;
  readings: {
    data: PaginatedReadingsResponse | undefined;
    hasBlockingError: boolean;
    isLoading: boolean;
    refetch: () => Promise<unknown>;
  };
  retrySecondaryQueries: () => void;
  room: {
    data: RoomOverview | undefined;
    error: unknown;
    isLoading: boolean;
    refetch: () => Promise<unknown>;
  };
};

export function useRoomDetailData(
  roomId: string | undefined,
  activeTab: RoomDetailTabKey,
  communityView: 'discussions' | 'polls' = 'discussions',
): RoomDetailData {
  const { locale } = useI18n();
  const isCommunityTab = activeTab === 'community';
  const hasRoomId = roomId !== undefined;

  const roomQuery = useQuery({
    queryKey: ['rooms', roomId, 'overview', locale],
    queryFn: () => sdk.rooms.getOverview(roomId!),
    enabled: Boolean(roomId),
    retry: shouldRetryRoomDetailQuery,
  });
  const viewerHasRoomAccess = roomQuery.data?.viewer.accessState === 'active';

  const communitySettingsQuery = useQuery({
    queryKey: ['rooms', roomId, 'community', 'settings'],
    queryFn: () => sdk.community.getSettings(roomId!),
    enabled:
      hasRoomId &&
      Boolean(roomQuery.data?.id) &&
      viewerHasRoomAccess &&
      isCommunityTab,
  });

  const discussionsQuery = useQuery({
    queryKey: ['rooms', roomId, 'discussions', 'discussions'],
    queryFn: () => sdk.discussions.listDiscussions(roomId!),
    enabled:
      hasRoomId &&
      Boolean(roomQuery.data?.id) &&
      viewerHasRoomAccess &&
      isCommunityTab &&
      communityView === 'discussions',
  });

  const pollsQuery = useQuery({
    queryKey: getPollListKey(roomId!),
    queryFn: () => sdk.polls.listPolls(roomId!),
    enabled:
      hasRoomId &&
      Boolean(roomQuery.data?.id) &&
      viewerHasRoomAccess &&
      isCommunityTab &&
      communityView === 'polls',
  });

  const readingsQuery = useQuery({
    queryKey: ['rooms', roomId, 'readings', locale],
    queryFn: () => sdk.readings.listForRoom(roomId!),
    enabled:
      hasRoomId &&
      Boolean(roomQuery.data?.id) &&
      viewerHasRoomAccess &&
      activeTab === 'readings',
  });

  const hasSecondaryError = Boolean(
    readingsQuery.error ||
    communitySettingsQuery.error ||
    discussionsQuery.error ||
    pollsQuery.error,
  );

  const retrySecondaryQueries = () => {
    if (readingsQuery.error) {
      void readingsQuery.refetch();
    }

    if (communitySettingsQuery.error) {
      void communitySettingsQuery.refetch();
    }

    if (discussionsQuery.error) {
      void discussionsQuery.refetch();
    }

    if (pollsQuery.error) {
      void pollsQuery.refetch();
    }
  };

  return {
    community: {
      discussions: discussionsQuery.data,
      hasBlockingDiscussionsError: hasBlockingQueryError(discussionsQuery),
      hasBlockingPollsError: hasBlockingQueryError(pollsQuery),
      hasBlockingCommunitySettingsError: hasBlockingQueryError(
        communitySettingsQuery,
      ),
      isLoadingDiscussions: discussionsQuery.isLoading,
      isLoadingPolls: pollsQuery.isLoading,
      isLoadingCommunitySettings: communitySettingsQuery.isLoading,
      polls: pollsQuery.data,
      refetchDiscussions: discussionsQuery.refetch,
      refetchPolls: pollsQuery.refetch,
      refetchCommunitySettings: communitySettingsQuery.refetch,
      settings: communitySettingsQuery.data,
    },
    hasSecondaryError,
    readings: {
      data: readingsQuery.data,
      hasBlockingError: hasBlockingQueryError(readingsQuery),
      isLoading: readingsQuery.isLoading,
      refetch: readingsQuery.refetch,
    },
    retrySecondaryQueries,
    room: {
      data: roomQuery.data,
      error: roomQuery.error,
      isLoading: roomQuery.isLoading,
      refetch: roomQuery.refetch,
    },
  };
}
