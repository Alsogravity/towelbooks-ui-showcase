import { useId, useRef, useState } from 'react';

import { MobilePanelShell } from '../../components/overlay';
import { NotificationCenter } from './NotificationCenter';
import { useI18n } from '../../i18n';
import { FollowRequestsList } from '../follow-requests/FollowRequestsList';
import { RoomJoinRequestsList } from '../room-join-requests/RoomJoinRequestsSummaryRow';
import { useRoomJoinRequestsSummary } from '../room-join-requests/useRoomJoinRequestsSummary';

type NotificationsPanelProps = {
  onClose: () => void;
  side: 'left' | 'right';
};

type NotificationPanelView =
  'notifications' | 'followRequests' | 'roomJoinRequests';

export function NotificationsPanel({ onClose, side }: NotificationsPanelProps) {
  const { t } = useI18n();
  const titleId = useId();
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState<NotificationPanelView>('notifications');
  const roomJoinRequestsSummaryQuery = useRoomJoinRequestsSummary({
    enabled: view === 'roomJoinRequests',
  });
  const isFollowRequestsView = view === 'followRequests';
  const isRoomJoinRequestsView = view === 'roomJoinRequests';
  const isSubView = isFollowRequestsView || isRoomJoinRequestsView;
  const title = isFollowRequestsView
    ? t('notifications.followRequests.title')
    : isRoomJoinRequestsView
      ? t('notifications.roomJoinRequests.title')
      : t('notifications.panel.title');
  const backLabel = isFollowRequestsView
    ? t('notifications.followRequests.back')
    : t('notifications.roomJoinRequests.back');

  return (
    <MobilePanelShell
      back={
        isSubView
          ? {
              ariaLabel: backLabel,
              onBack: () => setView('notifications'),
            }
          : undefined
      }
      closeLabel={t('common.close')}
      contentClassName="gap-5"
      onClose={onClose}
      overlayClassName={
        side === 'left' ? 'border-r border-rule' : 'border-l border-rule'
      }
      panelClassName="max-w-[min(32rem,100vw)]"
      scrollRef={bodyRef}
      side={side}
      title={title}
      titleId={titleId}
    >
      {isFollowRequestsView ? (
        <FollowRequestsList />
      ) : isRoomJoinRequestsView ? (
        <RoomJoinRequestsList
          preview={roomJoinRequestsSummaryQuery.data?.preview ?? []}
        />
      ) : (
        <NotificationCenter
          onOpenFollowRequests={() => setView('followRequests')}
          onOpenRoomJoinRequests={() => setView('roomJoinRequests')}
          scrollRootRef={bodyRef}
        />
      )}
    </MobilePanelShell>
  );
}
