import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';

import {
  resolveCommunityView,
  type CommunityView,
} from '../../../features/rooms/community/communityViewModel';
import {
  resolveRoomDetailTab,
  type RoomDetailTabKey,
} from '../../../features/rooms/detail/roomDetailViewModel';
import { ROOM_CATALOG_QUERY_PARAM } from '../../../features/readings/create-reading/readingCreationNavigation';

export type RoomDetailNavigationState = {
  activeTab: RoomDetailTabKey;
  communityView: CommunityView;
  selectedDiscussionId: string | null;
  selectedPollId: string | null;
};

export function parseRoomDetailNavigation(
  searchParams: URLSearchParams,
): RoomDetailNavigationState {
  const activeTab = resolveRoomDetailTab(searchParams.get('tab'));
  const communityView =
    activeTab === 'community'
      ? resolveCommunityView(searchParams.get('view'))
      : 'discussions';

  return {
    activeTab,
    communityView,
    selectedDiscussionId:
      activeTab === 'community' && communityView === 'discussions'
        ? searchParams.get('discussion')
        : null,
    selectedPollId:
      activeTab === 'community' && communityView === 'polls'
        ? searchParams.get('poll')
        : null,
  };
}

function clearCommunityParams(searchParams: URLSearchParams) {
  searchParams.delete('view');
  searchParams.delete('discussion');
  searchParams.delete('poll');
}

export function buildCanonicalRoomDetailSearchParams(
  searchParams: URLSearchParams,
): URLSearchParams {
  const navigation = parseRoomDetailNavigation(searchParams);
  const canonical = new URLSearchParams(searchParams);

  const rawTab = searchParams.get('tab');
  if (rawTab == null || navigation.activeTab === 'room') {
    canonical.delete('tab');
  } else {
    canonical.set('tab', navigation.activeTab);
  }

  if (navigation.activeTab !== 'community') {
    canonical.delete('view');
    canonical.delete('discussion');
    canonical.delete('poll');
  } else {
    const rawView = searchParams.get('view');
    if (rawView == null || navigation.communityView === 'discussions') {
      canonical.delete('view');
    } else {
      canonical.set('view', navigation.communityView);
    }

    if (navigation.communityView === 'discussions') {
      canonical.delete('poll');
      if (navigation.selectedDiscussionId) {
        canonical.set('discussion', navigation.selectedDiscussionId);
      } else {
        canonical.delete('discussion');
      }
    } else {
      canonical.delete('discussion');
      if (navigation.selectedPollId) {
        canonical.set('poll', navigation.selectedPollId);
      } else {
        canonical.delete('poll');
      }
    }
  }

  if (navigation.activeTab !== 'readings') {
    canonical.delete(ROOM_CATALOG_QUERY_PARAM);
  }

  return canonical;
}

export function needsRoomDetailNavigationCanonicalization(
  searchParams: URLSearchParams,
): boolean {
  const canonical = buildCanonicalRoomDetailSearchParams(searchParams);

  if (canonical.toString() !== searchParams.toString()) {
    return true;
  }

  return false;
}

type UseRoomDetailNavigationStateOptions = {
  hasMemberRoomAccess: boolean;
  roomLoaded: boolean;
};

export function useRoomDetailNavigationState({
  hasMemberRoomAccess,
  roomLoaded,
}: UseRoomDetailNavigationStateOptions) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const navigation = parseRoomDetailNavigation(searchParams);
  const displayedActiveTab = hasMemberRoomAccess
    ? navigation.activeTab
    : 'room';

  const setCanonicalSearchParams = useCallback(
    (nextSearchParams: URLSearchParams, replace = true) => {
      setSearchParams(nextSearchParams, { replace });
    },
    [setSearchParams],
  );

  const handleTabChange = useCallback(
    (nextTab: RoomDetailTabKey) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      if (nextTab === 'room') {
        nextSearchParams.delete('tab');
        clearCommunityParams(nextSearchParams);
      } else {
        nextSearchParams.set('tab', nextTab);
        if (nextTab !== 'community') {
          clearCommunityParams(nextSearchParams);
        }
      }
      setCanonicalSearchParams(
        buildCanonicalRoomDetailSearchParams(nextSearchParams),
      );
    },
    [searchParams, setCanonicalSearchParams],
  );

  const handleCommunityViewChange = useCallback(
    (nextView: CommunityView) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.set('tab', 'community');
      nextSearchParams.set('view', nextView);
      nextSearchParams.delete('discussion');
      nextSearchParams.delete('poll');
      setCanonicalSearchParams(
        buildCanonicalRoomDetailSearchParams(nextSearchParams),
      );
    },
    [searchParams, setCanonicalSearchParams],
  );

  const handleDiscussionSelect = useCallback(
    (discussionId: string | null) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.set('tab', 'community');
      nextSearchParams.set('view', 'discussions');

      if (discussionId) {
        nextSearchParams.set('discussion', discussionId);
      } else {
        nextSearchParams.delete('discussion');
      }

      nextSearchParams.delete('poll');
      setSearchParams(buildCanonicalRoomDetailSearchParams(nextSearchParams), {
        replace: false,
      });
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    if (navigation.selectedDiscussionId || navigation.selectedPollId) {
      tabsContainerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [navigation.selectedDiscussionId, navigation.selectedPollId]);

  useEffect(() => {
    if (!needsRoomDetailNavigationCanonicalization(searchParams)) {
      return;
    }

    setCanonicalSearchParams(
      buildCanonicalRoomDetailSearchParams(searchParams),
    );
  }, [searchParams, setCanonicalSearchParams]);

  useEffect(() => {
    if (!roomLoaded || hasMemberRoomAccess || navigation.activeTab === 'room') {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('tab');
    clearCommunityParams(nextSearchParams);
    setCanonicalSearchParams(
      buildCanonicalRoomDetailSearchParams(nextSearchParams),
    );
  }, [
    hasMemberRoomAccess,
    navigation.activeTab,
    roomLoaded,
    searchParams,
    setCanonicalSearchParams,
  ]);

  return {
    ...navigation,
    displayedActiveTab,
    handleCommunityViewChange,
    handleDiscussionSelect,
    handleTabChange,
    tabsContainerRef,
  };
}
