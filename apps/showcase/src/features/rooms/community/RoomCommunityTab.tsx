import { useCallback, useMemo, useState } from 'react';

import { ErrorState, LoadingState } from '../../../components/feedback';
import { Button, SegmentedControl } from '../../../components/primitives';
import { useI18n } from '../../../i18n';
import { useIsBelowSmViewport } from '../../../layouts/app/shellViewport';
import { roomTabSectionIcons } from '../detail/roomTabSectionIcons';
import { RoomTabSectionHeader } from '../detail/ui/RoomTabSectionHeader';

import {
  type CommunityView,
  type RegisterCommunityCreateHandler,
} from './communityViewModel';
import { RoomDiscussionsView } from './discussions/RoomDiscussionsView';
import { RoomPollsView } from './polls/RoomPollsView';

import type {
  CommunitySettings,
  Discussion,
  PaginatedPollsResponse,
} from '../types';

type RoomCommunityTabProps = {
  roomId: string;
  communitySettings: CommunitySettings | undefined;
  hasBlockingCommunitySettingsError: boolean;
  communityView: CommunityView;
  discussions: { items: Discussion[] } | undefined;
  hasBlockingDiscussionsError: boolean;
  hasBlockingPollsError: boolean;
  isLoadingCommunitySettings: boolean;
  isLoadingDiscussions: boolean;
  isLoadingPolls: boolean;
  onCommunityViewChange: (view: CommunityView) => void;
  onRetryCommunitySettings: () => void;
  onRetryDiscussions: () => void;
  onRetryPolls: () => void;
  onSelectDiscussion: (discussionId: string | null) => void;
  polls: PaginatedPollsResponse | undefined;
  selectedDiscussionId: string | null;
  selectedPollId: string | null;
};

export function RoomCommunityTab({
  roomId,
  communitySettings,
  hasBlockingCommunitySettingsError,
  communityView,
  discussions,
  hasBlockingDiscussionsError,
  hasBlockingPollsError,
  isLoadingCommunitySettings,
  isLoadingDiscussions,
  isLoadingPolls,
  onCommunityViewChange,
  onRetryCommunitySettings,
  onRetryDiscussions,
  onRetryPolls,
  onSelectDiscussion,
  polls,
  selectedDiscussionId,
  selectedPollId,
}: RoomCommunityTabProps) {
  const { t } = useI18n();
  const isBelowSm = useIsBelowSmViewport();
  const [openCreateHandler, setOpenCreateHandler] = useState<
    (() => void) | null
  >(null);

  const registerCreateHandler = useCallback<RegisterCommunityCreateHandler>(
    (handler) => {
      if (handler === null) {
        setOpenCreateHandler(null);
        return;
      }

      setOpenCreateHandler(() => handler);
    },
    [],
  );

  const showSubnav = !selectedDiscussionId && !selectedPollId;
  const discussionCount = discussions?.items.length ?? 0;
  const pollCount = polls?.items.length ?? 0;

  const createAction = useMemo(() => {
    if (!communitySettings || !showSubnav || !openCreateHandler) {
      return null;
    }

    const canShowCreateAction =
      communityView === 'discussions'
        ? !isLoadingDiscussions &&
          !hasBlockingDiscussionsError &&
          discussionCount > 0 &&
          communitySettings.viewerCanCreateDiscussions
        : !isLoadingPolls &&
          !hasBlockingPollsError &&
          pollCount > 0 &&
          communitySettings.viewerCanCreatePolls;

    if (!canShowCreateAction) {
      return null;
    }

    return {
      label:
        communityView === 'discussions'
          ? t('rooms.detail.discussions.create')
          : t('rooms.detail.polls.create'),
      onClick: openCreateHandler,
    };
  }, [
    communitySettings,
    communityView,
    discussionCount,
    hasBlockingDiscussionsError,
    hasBlockingPollsError,
    isLoadingDiscussions,
    isLoadingPolls,
    openCreateHandler,
    pollCount,
    showSubnav,
    t,
  ]);

  if (isLoadingCommunitySettings) {
    return (
      <div className="rounded-2xl border border-rule/80 bg-paper p-12 shadow-sm">
        <LoadingState
          label={{
            key: 'rooms.detail.community.loading',
            fallback: 'Loading community...',
          }}
        />
      </div>
    );
  }

  if (hasBlockingCommunitySettingsError || !communitySettings) {
    return (
      <ErrorState
        body={{ key: 'rooms.detail.community.error.body' }}
        title={{ key: 'rooms.detail.community.error.title' }}
        action={
          <Button
            variant="secondary"
            onClick={() => void onRetryCommunitySettings()}
          >
            {t('errors.action.retry')}
          </Button>
        }
      />
    );
  }

  const communitySubnav = (
    <SegmentedControl
      ariaLabel={t('rooms.detail.community.subnav.ariaLabel')}
      name="room-community-view"
      onChange={onCommunityViewChange}
      segmentSize="content"
      segmentDisplay="icon-only md:icon-label"
      iconSize={20}
      value={communityView}
      options={[
        {
          value: 'discussions',
          ariaLabel: t('rooms.detail.community.subnav.discussions'),
          icon: 'discussion-glyph',
          label: t('rooms.detail.community.subnav.discussions'),
        },
        {
          value: 'polls',
          ariaLabel: t('rooms.detail.community.subnav.polls'),
          icon: 'poll-glyph',
          label: t('rooms.detail.community.subnav.polls'),
        },
      ]}
    />
  );

  return (
    <div className="space-y-8 py-4">
      {showSubnav ? (
        <div className="space-y-3">
          <RoomTabSectionHeader
            icon={roomTabSectionIcons.community}
            title={t('rooms.detail.hero.stats.community')}
            actions={
              <div className="flex items-center gap-2">
                {createAction ? (
                  isBelowSm ? (
                    <Button
                      aria-label={createAction.label}
                      className="shrink-0"
                      icon="plus"
                      onClick={createAction.onClick}
                      size="sm"
                      variant="icon"
                    />
                  ) : (
                    <Button
                      onClick={createAction.onClick}
                      prependIcon="plus"
                      size="md"
                      variant="secondary"
                    >
                      {createAction.label}
                    </Button>
                  )
                ) : null}
                {communitySubnav}
              </div>
            }
          />
        </div>
      ) : null}

      {communityView === 'discussions' ? (
        <RoomDiscussionsView
          roomId={roomId}
          communitySettings={communitySettings}
          discussions={discussions}
          hasBlockingDiscussionsError={hasBlockingDiscussionsError}
          isLoadingDiscussions={isLoadingDiscussions}
          onRetryDiscussions={onRetryDiscussions}
          registerCreateHandler={registerCreateHandler}
          selectedDiscussionId={selectedDiscussionId}
          onSelectDiscussion={onSelectDiscussion}
        />
      ) : (
        <RoomPollsView
          roomId={roomId}
          communitySettings={communitySettings}
          hasBlockingPollsError={hasBlockingPollsError}
          isLoadingPolls={isLoadingPolls}
          onRetryPolls={onRetryPolls}
          polls={polls}
          registerCreateHandler={registerCreateHandler}
          selectedPollId={selectedPollId}
        />
      )}
    </div>
  );
}
