import {
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router';

import { LoadingState } from '../../../components/feedback';
import {
  PageContainer,
  PageShell,
  PageStateShell,
} from '../../../components/layout';
import { Button, ButtonLink } from '../../../components/primitives';
import { useShareAction } from '../../../components/share/useShareAction';
import { useAuth } from '../../../features/auth/AuthContext';
import { createRoomDetailViewModel } from '../../../features/rooms/detail/roomDetailViewModel';
import { useRoomDetailData } from '../../../features/rooms/detail/useRoomDetailData';
import { useReconcileStaleRoomMembership } from '../../../features/rooms/detail/useReconcileStaleRoomMembership';
import { canReviewRoomJoinRequests } from '../../../features/rooms/join/canReviewRoomJoinRequests';
import { RoomDetailHero } from '../../../features/rooms/detail/ui/RoomDetailHero';
import { RoomJoinActions } from '../../../features/rooms/detail/ui/RoomJoinActions';
import { RoomDetailSettingsLink } from '../../../features/rooms/detail/ui/RoomDetailSettingsLink';
import {
  RoomLeaveRoomAction,
  roomLeaveIconButtonClassName,
} from '../../../features/rooms/detail/ui/RoomLeaveRoomAction';
import { RoomParticipantsOverlayController } from '../../../features/rooms/participants/RoomParticipantsOverlayController';
import { useRoomParticipantsOverlayState } from '../../../features/rooms/participants/useRoomParticipantsOverlayState';
import { ApiProblemPageState } from '../../../features/errors';
import { CreateReadingPanel } from '../../../features/readings/create-reading/CreateReadingPanel';
import {
  buildRoomCreateReadingHash,
  isRoomCreateReadingHashOpen,
  ROOM_CATALOG_QUERY_PARAM,
} from '../../../features/readings/create-reading/readingCreationNavigation';
import { ReportActionButton } from '../../../features/reports/ReportActionButton';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useI18n } from '../../../i18n';
import { RoomSettingsNavigationProvider } from '../settings/useRoomSettingsNavigation';
import { RoomSettingsOverlay } from '../settings/RoomSettingsOverlay';
import { RoomDetailTabs } from './RoomDetailTabs';
import { useRoomDetailMobileHeader } from './useRoomDetailMobileHeader';
import {
  buildCanonicalRoomDetailSearchParams,
  parseRoomDetailNavigation,
  useRoomDetailNavigationState,
} from './useRoomDetailNavigationState';

export function RoomDetailPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const parsedNavigation = parseRoomDetailNavigation(searchParams);
  const { isAuthenticated: authState, user } = useAuth();
  const isAuthenticated = authState ?? user !== null;
  const { formatDate, formatNumber, t } = useI18n();
  const addReadingTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const isCreateReadingOpen = isRoomCreateReadingHashOpen(location.hash);
  const readingQuery = searchParams.get(ROOM_CATALOG_QUERY_PARAM) ?? undefined;

  const detailData = useRoomDetailData(
    roomId,
    parsedNavigation.activeTab,
    parsedNavigation.communityView,
  );
  useReconcileStaleRoomMembership(roomId);

  const room = detailData.room.data;
  const hasMemberRoomAccess = room?.viewer.accessState === 'active';
  const roomLoaded = room != null;
  const viewerCanReportRoom =
    room != null &&
    room.viewer.role !== 'owner' &&
    room.viewer.role !== 'admin';
  const canReviewJoinRequests = canReviewRoomJoinRequests(room?.viewer);

  const navigation = useRoomDetailNavigationState({
    hasMemberRoomAccess,
    roomLoaded,
  });

  const {
    activeReadings,
    canManageRoomOperations,
    canManageMeetings,
    historicalReadings,
    tabs,
  } = createRoomDetailViewModel({
    activeTab: hasMemberRoomAccess ? navigation.activeTab : 'room',
    room,
    hasSecondaryError: detailData.hasSecondaryError,
    readings: detailData.readings.data,
    t,
  });

  const participantsOverlay = useRoomParticipantsOverlayState({
    canManageRoomOperations,
    canReviewJoinRequests,
    hasMemberRoomAccess,
    roomLoaded,
  });

  const leaveActionLabel = t('rooms.members.leave.action');

  useRoomDetailMobileHeader({
    hasMemberRoomAccess,
    leaveActionLabel,
    onLeaveOpen: () => setIsLeaveOpen(true),
  });

  usePageTitle(
    room?.name ?? { key: 'page.rooms.detail.title', fallback: 'Room' },
  );

  const shareUrl = room ? `/rooms/${room.id}` : '';
  const isPrivateRoom = room?.visibility === 'private';
  const shareSubject = room
    ? t('rooms.detail.share.subject', { values: { name: room.name } })
    : '';
  const getShareMessage = useMemo(
    () => (fullUrl: string) =>
      room
        ? t(
            isPrivateRoom
              ? 'rooms.detail.share.privateMessage'
              : 'rooms.detail.share.message',
            {
              values: { name: room.name, url: fullUrl },
            },
          )
        : fullUrl,
    [isPrivateRoom, room, t],
  );
  const { shareDialog, shareTriggerButton } = useShareAction({
    actionLabel: t(
      isPrivateRoom ? 'rooms.detail.share.privateAction' : 'share.action',
    ),
    getMessage: getShareMessage,
    helperText: isPrivateRoom
      ? t('rooms.detail.share.privateHelper')
      : undefined,
    subject: shareSubject,
    url: shareUrl,
  });

  const handleOpenCreateReading = (event: MouseEvent<HTMLButtonElement>) => {
    addReadingTriggerRef.current = event.currentTarget;
    const nextSearchParams = new URLSearchParams(location.search);
    nextSearchParams.set('tab', 'readings');
    nextSearchParams.delete(ROOM_CATALOG_QUERY_PARAM);

    void navigate({
      hash: buildRoomCreateReadingHash(),
      pathname: location.pathname,
      search: `?${buildCanonicalRoomDetailSearchParams(nextSearchParams).toString()}`,
    });
  };

  const handleCloseCreateReading = useCallback(() => {
    if (!isRoomCreateReadingHashOpen(location.hash)) {
      return;
    }

    const nextSearchParams = new URLSearchParams(location.search);
    nextSearchParams.delete(ROOM_CATALOG_QUERY_PARAM);
    const nextSearch = nextSearchParams.toString();

    void navigate(
      {
        hash: '',
        pathname: location.pathname,
        search: nextSearch.length > 0 ? `?${nextSearch}` : '',
      },
      { replace: true },
    );
  }, [location.hash, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!roomLoaded || !isCreateReadingOpen || canManageRoomOperations) {
      return;
    }

    handleCloseCreateReading();
  }, [
    canManageRoomOperations,
    handleCloseCreateReading,
    isCreateReadingOpen,
    roomLoaded,
  ]);

  if (detailData.room.isLoading) {
    return (
      <PageStateShell>
        <LoadingState
          label={{ key: 'rooms.detail.loading', fallback: 'Loading room...' }}
        />
      </PageStateShell>
    );
  }

  if (detailData.room.error || !room) {
    return (
      <PageStateShell containerSize="comfortable">
        <ApiProblemPageState
          error={detailData.room.error}
          title={{ key: 'rooms.detail.error.loadTitle' }}
          body={{ key: 'rooms.detail.error.loadBody' }}
          fallbackAction={
            <Button
              variant="secondary"
              onClick={() => void detailData.room.refetch()}
            >
              {t('errors.action.retry')}
            </Button>
          }
          action={
            <ButtonLink to="/" variant="tertiary" size="sm">
              {t('rooms.detail.error.action')}
            </ButtonLink>
          }
        />
      </PageStateShell>
    );
  }

  return (
    <RoomSettingsNavigationProvider>
      <PageShell background="paper" minHeight>
        <PageContainer
          size="comfortable"
          padding="none"
          gutters="none"
          className="flex flex-col gap-6"
        >
          <RoomDetailHero
            bannerPresetId={room.bannerPresetId}
            bannerImageUrl={room.bannerImage?.imageUrl ?? null}
            bannerImageUrls={room.bannerImage?.imageUrls ?? null}
            room={room}
            formatNumber={formatNumber}
            canManageRoomOperations={canManageRoomOperations}
            hasMemberRoomAccess={hasMemberRoomAccess}
            roomId={roomId ?? ''}
            headerActions={
              <div className="flex items-center gap-2">
                {!hasMemberRoomAccess ? (
                  <RoomJoinActions
                    joinPolicy={room.joinPolicy}
                    roomId={room.id}
                    viewer={room.viewer}
                  />
                ) : null}
                {hasMemberRoomAccess ? (
                  <Button
                    aria-label={leaveActionLabel}
                    className={roomLeaveIconButtonClassName}
                    icon="log-out"
                    size="sm"
                    title={leaveActionLabel}
                    type="button"
                    variant="icon"
                    onClick={() => setIsLeaveOpen(true)}
                  />
                ) : null}
                {isAuthenticated && viewerCanReportRoom ? (
                  <ReportActionButton
                    targetId={room.id}
                    targetType="room"
                    variant="icon"
                  />
                ) : null}
                {shareTriggerButton}
                {canManageRoomOperations ? (
                  <RoomDetailSettingsLink
                    label={t('rooms.detail.actions.openSettings')}
                  />
                ) : null}
              </div>
            }
            members={room.previewMembers}
            membersTotal={room.memberCount}
            readingsCount={room.readingsCount}
            t={t}
            title={room.name}
            onMembersClick={
              hasMemberRoomAccess
                ? participantsOverlay.handleOpenMembersOverlay
                : undefined
            }
            onReadingsClick={
              hasMemberRoomAccess
                ? () => navigation.handleTabChange('readings')
                : undefined
            }
          />

          <RoomDetailTabs
            activeReadings={activeReadings}
            canManageMeetings={canManageMeetings}
            canManageRoomOperations={canManageRoomOperations}
            community={detailData.community}
            displayedActiveTab={navigation.displayedActiveTab}
            formatDate={formatDate}
            historicalReadings={historicalReadings}
            navigation={{
              communityView: navigation.communityView,
              onCommunityViewChange: navigation.handleCommunityViewChange,
              onSelectDiscussion: navigation.handleDiscussionSelect,
              onTabChange: navigation.handleTabChange,
              selectedDiscussionId: navigation.selectedDiscussionId,
              selectedPollId: navigation.selectedPollId,
            }}
            onOpenCreateReading={handleOpenCreateReading}
            readings={detailData.readings}
            room={room}
            tabs={tabs}
            tabsContainerRef={navigation.tabsContainerRef}
            t={t}
          />
        </PageContainer>

        {canManageRoomOperations && isCreateReadingOpen && (
          <CreateReadingPanel
            initialQuery={readingQuery}
            roomId={room.id}
            onClose={handleCloseCreateReading}
            returnFocusRef={addReadingTriggerRef}
          />
        )}
        {shareDialog}
        {participantsOverlay.isParticipantsOverlayVisible ? (
          <RoomParticipantsOverlayController
            canManageRoomOperations={canManageRoomOperations}
            canReviewJoinRequests={canReviewJoinRequests}
            getReturnFocusElement={participantsOverlay.getReturnFocusElement}
            onClose={participantsOverlay.onClose}
            roomId={room.id}
          />
        ) : null}
        {hasMemberRoomAccess ? (
          <RoomLeaveRoomAction
            isOpen={isLeaveOpen}
            roomId={room.id}
            roomName={room.name}
            roomVisibility={room.visibility}
            showTrigger={false}
            viewerRole={room.viewer.role}
            onOpenChange={setIsLeaveOpen}
          />
        ) : null}
        {room && roomId && (
          <RoomSettingsOverlay
            canManageRoom={canManageRoomOperations}
            room={room}
            roomId={roomId}
          />
        )}
      </PageShell>
    </RoomSettingsNavigationProvider>
  );
}
