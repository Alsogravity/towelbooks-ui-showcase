import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AppActionRow, AppSubsection } from '../../../components/application';
import { LoadingState } from '../../../components/feedback';
import { ResponsiveOverlayShell } from '../../../components/overlay';
import { Button, DialogActions } from '../../../components/primitives';
import { useI18n } from '../../../i18n';
import { useIsBelowSmViewport } from '../../../layouts/app/shellViewport';
import { sdk } from '../../../lib/sdk';
import { ROOM_INVITE_CREATE_FORM_ID } from '../invites/RoomInviteCreateForm';
import { RoomInviteCreateView } from '../invites/RoomInviteCreateView';
import { RoomInviteDetailsContentLoader } from '../invites/RoomInviteDetailsContentLoader';
import { RoomInvitesListView } from '../invites/RoomInvitesListView';
import { useRoomInvitesManagement } from '../invites/useRoomInvitesManagement';
import { RoomMemberInvitesSection } from '../member-invites/RoomMemberInvitesSection';
import { RoomJoinRequestsSection } from '../join/RoomJoinRequestsSection';
import { useRoomJoinRequestsPendingCount } from '../join/useRoomJoinRequests';
import { RoomMemberAccessContent } from '../members/RoomMemberAccessContent';
import { RoomMemberManagementContentLoader } from '../members/RoomMemberManagementContentLoader';
import { RoomMemberManagementHistoryContent } from '../members/RoomMemberManagementHistoryContent';
import { RoomMembersSection } from '../members/RoomMembersSection';

import type { ParticipantsHashView } from './participantsHash';
import type { RoomMember } from '../types';
import type { HeaderChromeAction } from '../../../components/overlay/HeaderActionCapsule';

import { inviteDetailFromCurrentView } from './participantsHash';
import { useRoomParticipantsHashNavigation } from './useRoomParticipantsHashNavigation';

type RoomParticipantsOverlayProps = {
  canManage: boolean;
  canReviewJoinRequests?: boolean;
  getReturnFocusElement?: () => HTMLElement | null;
  onClose: () => void;
  roomId: string;
};

const participantsDialogPanelClassName =
  'app-dialog-panel relative flex h-[min(680px,calc(100dvh-2rem))] w-full max-w-[640px] flex-col overflow-hidden rounded-xl border border-paper-3 bg-paper shadow-2xl outline-none';

const participantsDialogPanelHugClassName =
  'app-dialog-panel relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[560px] flex-col overflow-hidden rounded-xl border border-paper-3 bg-paper shadow-2xl outline-none';

function memberIdFromView(view: ParticipantsHashView): string | null {
  if (
    view.type === 'member-detail' ||
    view.type === 'member-access' ||
    view.type === 'member-history'
  ) {
    return view.memberId;
  }
  return null;
}

export function RoomParticipantsOverlay({
  canManage,
  canReviewJoinRequests = false,
  getReturnFocusElement,
  onClose,
  roomId,
}: RoomParticipantsOverlayProps) {
  const { t, formatDate, formatNumber } = useI18n();
  const isBelowSmViewport = useIsBelowSmViewport();
  const closeLabel = t('common.close');
  const invitesManagement = useRoomInvitesManagement(roomId, canManage);
  const { pendingCount: pendingJoinRequestsCount } =
    useRoomJoinRequestsPendingCount(roomId, {
      enabled: canReviewJoinRequests,
    });

  const handleBeforeBack = useCallback(
    (currentView: ParticipantsHashView) => {
      if (currentView.type === 'invite-create') {
        invitesManagement.dismissCreatedInvite();
      }
    },
    [invitesManagement],
  );

  const { back, scrollRef, setView, view } = useRoomParticipantsHashNavigation({
    onBeforeBack: handleBeforeBack,
    onClose,
  });

  const activeMemberId = view != null ? memberIdFromView(view) : null;
  const memberDetailQuery = useQuery({
    enabled: activeMemberId != null,
    queryKey: ['rooms', roomId, 'members', activeMemberId, 'management'],
    queryFn: () =>
      sdk.rooms.getMemberManagementDetail(roomId, activeMemberId as string),
  });
  const resolvedMember: RoomMember | undefined = memberDetailQuery.data?.member;

  const handleMemberClick = useCallback(
    (member: RoomMember) => {
      setView({ type: 'member-detail', memberId: member.id });
    },
    [setView],
  );

  const handleViewMemberAccess = useCallback(
    (memberId: string) => {
      setView({ type: 'member-access', memberId });
    },
    [setView],
  );

  const handleViewMemberHistory = useCallback(
    (memberId: string) => {
      setView({ type: 'member-history', memberId });
    },
    [setView],
  );

  const handleOpenInvites = useCallback(() => {
    setView({ type: 'invites' });
  }, [setView]);

  const handleOpenJoinRequests = useCallback(() => {
    setView({ type: 'join-requests' });
  }, [setView]);

  const handleCreateInvite = useCallback(() => {
    setView({ type: 'invite-create' });
  }, [setView]);

  const handleViewInviteDetails = useCallback(
    (inviteId: string) => {
      setView({
        type: 'invite-detail',
        from: inviteDetailFromCurrentView(view),
        inviteId,
      });
    },
    [setView, view],
  );

  const autoNavInviteIdRef = useRef<string | null>(null);
  const [createdAlertInviteId, setCreatedAlertInviteId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (
      invitesManagement.createInviteMutation.isSuccess &&
      invitesManagement.createInviteMutation.data?.restriction.type ===
        'none' &&
      view?.type === 'invite-create' &&
      autoNavInviteIdRef.current !==
        invitesManagement.createInviteMutation.data.id
    ) {
      autoNavInviteIdRef.current =
        invitesManagement.createInviteMutation.data.id;
      setCreatedAlertInviteId(invitesManagement.createInviteMutation.data.id);
      setView({
        type: 'invite-detail',
        from: 'invite-create',
        inviteId: invitesManagement.createInviteMutation.data.id,
      });
    }
  }, [
    invitesManagement.createInviteMutation.isSuccess,
    invitesManagement.createInviteMutation.data,
    setView,
    view,
  ]);

  const showCreatedAlert =
    view?.type === 'invite-detail' &&
    createdAlertInviteId === view.inviteId &&
    invitesManagement.createdInviteRestrictionType != null;

  const content = useMemo(() => {
    if (view == null) {
      return null;
    }

    switch (view.type) {
      case 'members':
        return (
          <RoomMembersSection
            canManage={canManage}
            onManageMember={handleMemberClick}
            roomId={roomId}
            scrollRootRef={scrollRef}
          />
        );
      case 'member-detail':
        if (resolvedMember == null) {
          return null;
        }
        return (
          <RoomMemberManagementContentLoader
            member={resolvedMember}
            onClose={onClose}
            onOwnershipTransferred={() => setView({ type: 'members' })}
            onViewAccess={() => handleViewMemberAccess(view.memberId)}
            onViewManagementHistory={() =>
              handleViewMemberHistory(view.memberId)
            }
            roomId={roomId}
          />
        );
      case 'member-access':
        if (resolvedMember == null) {
          return null;
        }
        return (
          <RoomMemberAccessContent
            member={resolvedMember}
            onClose={onClose}
            roomId={roomId}
          />
        );
      case 'member-history':
        if (resolvedMember == null) {
          return null;
        }
        return (
          <RoomMemberManagementHistoryContent
            member={resolvedMember}
            roomId={roomId}
          />
        );
      case 'invites':
        return (
          <div className="flex flex-col gap-8">
            {canManage ? (
              <AppSubsection
                description={t('rooms.memberInvites.section.description')}
                title={t('rooms.memberInvites.section.title')}
              >
                <div className="divide-y divide-rule">
                  <AppActionRow
                    icon="user-round-plus"
                    label={t('rooms.memberInvites.send.action')}
                    onClick={() => setView({ type: 'member-invites' })}
                  />
                  <AppActionRow
                    icon="user-round-arrow-left"
                    label={t('rooms.memberInvites.history.title')}
                    onClick={() => setView({ type: 'member-invites-history' })}
                  />
                </div>
              </AppSubsection>
            ) : null}
            <AppSubsection
              description={t('rooms.memberInvites.linksSection.description')}
              title={t('rooms.memberInvites.linksSection.title')}
            >
              <div className="divide-y divide-rule">
                <AppActionRow
                  icon="mail-plus"
                  label={t('rooms.memberInvites.linksSection.send')}
                  onClick={() => setView({ type: 'invite-create' })}
                />
                <AppActionRow
                  icon="mail-check"
                  label={t('rooms.memberInvites.linksSection.active')}
                  onClick={() => setView({ type: 'invite-links-active' })}
                />
                <AppActionRow
                  icon="mail-x"
                  label={t('rooms.memberInvites.linksSection.inactive')}
                  onClick={() => setView({ type: 'invite-links-inactive' })}
                />
              </div>
            </AppSubsection>
          </div>
        );
      case 'invite-create':
        return (
          <RoomInviteCreateView
            accessMode={invitesManagement.accessMode}
            allowedEmailCount={invitesManagement.allowedEmailCount}
            control={invitesManagement.control}
            errors={invitesManagement.errors}
            isSubmitting={invitesManagement.createInviteMutation.isPending}
            onSubmit={invitesManagement.handleSubmit(
              invitesManagement.onSubmit,
            )}
            register={invitesManagement.register}
            showSubmitButton={false}
            t={invitesManagement.t}
            trigger={invitesManagement.trigger}
          />
        );
      case 'invite-detail':
        return (
          <RoomInviteDetailsContentLoader
            createdInviteRestrictionType={
              showCreatedAlert
                ? invitesManagement.createdInviteRestrictionType
                : null
            }
            inviteId={view.inviteId}
            inviteUrl={showCreatedAlert ? invitesManagement.inviteUrl : null}
            copyStatus={showCreatedAlert ? invitesManagement.copyStatus : null}
            onCopyInviteLink={invitesManagement.copyInviteLink}
            onDismissCreatedAlert={
              showCreatedAlert
                ? () => {
                    invitesManagement.dismissCreatedInvite();
                    setCreatedAlertInviteId(null);
                  }
                : undefined
            }
            roomId={roomId}
          />
        );
      case 'member-invites':
        return (
          <RoomMemberInvitesSection
            enabled={canManage}
            roomId={roomId}
            variant="form"
          />
        );
      case 'member-invites-history':
        return (
          <RoomMemberInvitesSection
            enabled={canManage}
            roomId={roomId}
            variant="history"
          />
        );
      case 'invite-links-active':
        return (
          <RoomInvitesListView
            allInvites={invitesManagement.allInvites}
            displayMode="active"
            formatDate={formatDate}
            formatNumber={formatNumber}
            hasMore={invitesManagement.hasMore}
            invitesError={invitesManagement.invitesError}
            isLoadingInvites={invitesManagement.isLoadingInvites}
            isLoadingMore={invitesManagement.isLoadingMore}
            onCreateInvite={handleCreateInvite}
            onLoadMore={invitesManagement.loadMore}
            onRetry={() => void invitesManagement.refetchInvites()}
            onViewDetails={handleViewInviteDetails}
            t={invitesManagement.t}
          />
        );
      case 'invite-links-inactive':
        return (
          <RoomInvitesListView
            allInvites={invitesManagement.allInvites}
            displayMode="inactive"
            formatDate={formatDate}
            formatNumber={formatNumber}
            hasMore={invitesManagement.hasMore}
            invitesError={invitesManagement.invitesError}
            isLoadingInvites={invitesManagement.isLoadingInvites}
            isLoadingMore={invitesManagement.isLoadingMore}
            onCreateInvite={handleCreateInvite}
            onLoadMore={invitesManagement.loadMore}
            onRetry={() => void invitesManagement.refetchInvites()}
            onViewDetails={handleViewInviteDetails}
            t={invitesManagement.t}
          />
        );
      case 'join-requests':
        return <RoomJoinRequestsSection roomId={roomId} />;
    }
  }, [
    canManage,
    formatDate,
    formatNumber,
    handleCreateInvite,
    handleMemberClick,
    handleViewInviteDetails,
    handleViewMemberAccess,
    handleViewMemberHistory,
    invitesManagement,
    onClose,
    resolvedMember,
    roomId,
    scrollRef,
    setView,
    showCreatedAlert,
    t,
    view,
  ]);

  // Hash can briefly be empty while closing; avoid rendering an empty shell.
  if (view == null) {
    return null;
  }

  const memberScopedLoading =
    activeMemberId != null &&
    resolvedMember == null &&
    memberDetailQuery.isLoading;

  const inviteCreateSubmitButton =
    view.type === 'invite-create' ? (
      <Button
        form={ROOM_INVITE_CREATE_FORM_ID}
        isLoading={invitesManagement.createInviteMutation.isPending}
        loadingLabel={t('invites.form.submitting')}
        type="submit"
      >
        {t('invites.form.submit')}
      </Button>
    ) : null;

  const footer =
    view.type === 'invite-create' && inviteCreateSubmitButton ? (
      isBelowSmViewport ? (
        inviteCreateSubmitButton
      ) : (
        <DialogActions stackOnMobile>{inviteCreateSubmitButton}</DialogActions>
      )
    ) : undefined;

  const memberTitleName = resolvedMember
    ? resolvedMember.username
      ? `@${resolvedMember.username}`
      : (resolvedMember.displayName ?? t('shell.userFallback'))
    : t('shell.userFallback');

  const title =
    view.type === 'member-detail'
      ? t('rooms.members.overlay.title', {
          values: {
            name: memberTitleName,
          },
        })
      : view.type === 'member-access'
        ? t('rooms.members.management.access.title')
        : view.type === 'member-history'
          ? t('rooms.members.management.history.title')
          : view.type === 'invites'
            ? t('rooms.participants.invites.title')
            : view.type === 'member-invites'
              ? t('rooms.memberInvites.send.action')
              : view.type === 'member-invites-history'
                ? t('rooms.memberInvites.history.title')
                : view.type === 'invite-links-active'
                  ? t('rooms.memberInvites.linksSection.active')
                  : view.type === 'invite-links-inactive'
                    ? t('rooms.memberInvites.linksSection.inactive')
                    : view.type === 'invite-create'
                      ? t('invites.new.title')
                      : view.type === 'invite-detail'
                        ? t('invites.details.title')
                        : view.type === 'join-requests'
                          ? t('rooms.joinRequests.title')
                          : t('rooms.detail.hero.stats.members');

  const backLabel =
    view.type === 'member-detail' ||
    view.type === 'invites' ||
    view.type === 'join-requests'
      ? t('rooms.participants.backToMembers')
      : view.type === 'member-access' || view.type === 'member-history'
        ? t('rooms.members.management.history.backToDetails')
        : view.type === 'invite-create' ||
            view.type === 'invite-detail' ||
            view.type === 'member-invites' ||
            view.type === 'member-invites-history' ||
            view.type === 'invite-links-active' ||
            view.type === 'invite-links-inactive'
          ? t('rooms.participants.backToInvites')
          : undefined;

  let leadingAction: HeaderChromeAction | undefined;
  let primaryAction: HeaderChromeAction | undefined;

  if (
    (view.type === 'invite-links-active' ||
      view.type === 'invite-links-inactive') &&
    canManage
  ) {
    primaryAction = {
      ariaLabel: t('invites.action.create'),
      iconName: 'plus',
      onClick: handleCreateInvite,
    };
  }

  if (view.type === 'members' && (canManage || canReviewJoinRequests)) {
    const joinRequestsAriaLabel =
      pendingJoinRequestsCount > 0
        ? t('rooms.joinRequests.manage.pendingAria', {
            values: { count: pendingJoinRequestsCount },
          })
        : t('rooms.joinRequests.manage.action');

    if (canReviewJoinRequests) {
      const joinRequestsAction: HeaderChromeAction = {
        ariaLabel: joinRequestsAriaLabel,
        badgeCount: pendingJoinRequestsCount,
        iconName: 'bell',
        onClick: handleOpenJoinRequests,
      };

      if (canManage) {
        leadingAction = joinRequestsAction;
      } else {
        primaryAction = joinRequestsAction;
      }
    }

    if (canManage) {
      primaryAction = {
        ariaLabel: t('rooms.invites.manage.action'),
        iconName: 'user-round-plus',
        onClick: handleOpenInvites,
      };
    }
  }

  return (
    <ResponsiveOverlayShell
      backLabel={backLabel}
      breakpoint="sm"
      closeLabel={closeLabel}
      dialogBodyClassName="gap-6 px-6 pt-1 pb-8"
      dialogPanelClassName={
        canManage || canReviewJoinRequests
          ? participantsDialogPanelClassName
          : participantsDialogPanelHugClassName
      }
      footer={footer}
      getReturnFocusElement={getReturnFocusElement}
      leadingAction={leadingAction}
      onBack={back}
      onClose={onClose}
      primaryAction={primaryAction}
      scrollRef={scrollRef}
      showBack={backLabel != null}
      slideOverDesktopVisibility="visible"
      slideOverPanelClassName="max-w-md"
      title={title}
    >
      {memberScopedLoading ? (
        <LoadingState
          className="p-4"
          label={{
            key: 'rooms.members.overlay.loading',
            fallback: 'Loading member management...',
          }}
        />
      ) : (
        content
      )}
    </ResponsiveOverlayShell>
  );
}
