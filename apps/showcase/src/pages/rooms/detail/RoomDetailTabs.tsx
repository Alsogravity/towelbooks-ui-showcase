import { type MouseEvent } from 'react';

import {
  AnimatedTabPanel,
  TabPanelsFade,
  Tabs,
} from '../../../components/primitives';
import { RoomCommunityTab } from '../../../features/rooms/community/RoomCommunityTab';
import { RoomAnnouncementsTab } from '../../../features/rooms/detail/ui/RoomAnnouncementsTab';
import { RoomMeetingsTab } from '../../../features/rooms/detail/ui/RoomMeetingsTab';
import { RoomOverviewTab } from '../../../features/rooms/detail/ui/RoomOverviewTab';
import { RoomReadingsTab } from '../../../features/rooms/detail/ui/RoomReadingsTab';

import type { RefObject } from 'react';
import type { CommunityView } from '../../../features/rooms/community/communityViewModel';
import type { RoomDetailData } from '../../../features/rooms/detail/useRoomDetailData';
import type { RoomDetailTabKey } from '../../../features/rooms/detail/roomDetailViewModel';
import type { Tab } from '../../../components/primitives';
import type { RoomOverview } from '@towelbooks/schemas';
import type { Reading } from '@towelbooks/schemas';
import type { useI18n } from '../../../i18n';

export type RoomDetailTabsViewModel = {
  activeReadings: Reading[];
  canManageMeetings: boolean;
  canManageRoomOperations: boolean;
  community: RoomDetailData['community'];
  displayedActiveTab: RoomDetailTabKey;
  formatDate: (value: string) => string;
  historicalReadings: Reading[];
  navigation: {
    communityView: CommunityView;
    onCommunityViewChange: (view: CommunityView) => void;
    onSelectDiscussion: (discussionId: string | null) => void;
    onTabChange: (tab: RoomDetailTabKey) => void;
    selectedDiscussionId: string | null;
    selectedPollId: string | null;
  };
  onOpenCreateReading: (event: MouseEvent<HTMLButtonElement>) => void;
  readings: RoomDetailData['readings'];
  room: RoomOverview;
  tabs: Tab<RoomDetailTabKey>[];
  tabsContainerRef: RefObject<HTMLDivElement | null>;
  t: ReturnType<typeof useI18n>['t'];
};

export function RoomDetailTabs({
  activeReadings,
  canManageMeetings,
  canManageRoomOperations,
  community,
  displayedActiveTab,
  formatDate,
  historicalReadings,
  navigation,
  onOpenCreateReading,
  readings,
  room,
  tabs,
  tabsContainerRef,
  t,
}: RoomDetailTabsViewModel) {
  return (
    <div ref={tabsContainerRef} className="flex flex-col scroll-mt-2">
      <Tabs
        tabs={tabs}
        activeKey={displayedActiveTab}
        onChange={navigation.onTabChange}
        className="z-20 -mx-4 px-4 lg:sticky lg:top-0 lg:mx-0 lg:px-0 lg:bg-paper/95 lg:backdrop-blur-sm lg:pt-2"
      />

      <TabPanelsFade className="px-4 lg:px-0">
        {tabs.map((tab) => {
          const isActive = tab.key === displayedActiveTab;
          return (
            <AnimatedTabPanel
              key={tab.key}
              id={`tab-${tab.key}-panel`}
              aria-labelledby={`tab-${tab.key}`}
              isActive={isActive}
              variant="fade"
            >
              {tab.key === 'room' && (
                <RoomOverviewTab room={room} roomId={room.id} />
              )}
              {tab.key === 'readings' && (
                <RoomReadingsTab
                  activeReadings={activeReadings}
                  canManageReadings={canManageRoomOperations}
                  room={room}
                  historicalReadings={historicalReadings}
                  isLoadingReadings={readings.isLoading}
                  onRetry={() => void readings.refetch()}
                  onOpenCreateReading={onOpenCreateReading}
                  readingsError={readings.hasBlockingError}
                  formatDate={formatDate}
                  t={t}
                />
              )}
              {tab.key === 'meetings' && (
                <RoomMeetingsTab
                  roomId={room.id}
                  canManage={canManageMeetings}
                />
              )}
              {tab.key === 'community' && (
                <RoomCommunityTab
                  roomId={room.id}
                  communitySettings={community.settings}
                  hasBlockingCommunitySettingsError={
                    community.hasBlockingCommunitySettingsError
                  }
                  communityView={navigation.communityView}
                  discussions={community.discussions}
                  hasBlockingDiscussionsError={
                    community.hasBlockingDiscussionsError
                  }
                  hasBlockingPollsError={community.hasBlockingPollsError}
                  isLoadingCommunitySettings={
                    community.isLoadingCommunitySettings
                  }
                  isLoadingDiscussions={community.isLoadingDiscussions}
                  isLoadingPolls={community.isLoadingPolls}
                  onRetryCommunitySettings={() =>
                    void community.refetchCommunitySettings()
                  }
                  onRetryDiscussions={() => void community.refetchDiscussions()}
                  onRetryPolls={() => void community.refetchPolls()}
                  polls={community.polls}
                  selectedDiscussionId={navigation.selectedDiscussionId}
                  selectedPollId={navigation.selectedPollId}
                  onCommunityViewChange={navigation.onCommunityViewChange}
                  onSelectDiscussion={navigation.onSelectDiscussion}
                />
              )}
              {tab.key === 'announcements' && (
                <RoomAnnouncementsTab
                  roomId={room.id}
                  canManage={canManageRoomOperations}
                />
              )}
            </AnimatedTabPanel>
          );
        })}
      </TabPanelsFade>
    </div>
  );
}
