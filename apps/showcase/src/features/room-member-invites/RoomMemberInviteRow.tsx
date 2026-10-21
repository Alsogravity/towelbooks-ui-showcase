import { type IncomingRoomMemberInvite } from '@towelbooks/schemas';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Avatar, Button } from '../../components/primitives';
import {
  formatNotificationTimestamp,
  useI18n,
  type TranslationSegment,
} from '../../i18n';
import { NotificationRichMessage } from '../notifications/NotificationRichMessage';
import { useNotificationsPanel } from '../notifications/NotificationsPanelContext';
import { useRoomMemberInviteActions } from './useRoomMemberInviteActions';

type RoomMemberInviteRowProps = {
  invite: IncomingRoomMemberInvite;
};

const rowClassName =
  'flex w-full min-w-0 items-center gap-3 rounded-[var(--radius-paper-4)] px-3 py-3';

export function RoomMemberInviteRow({ invite }: RoomMemberInviteRowProps) {
  const { formatDateTime, locale, t } = useI18n();
  const navigate = useNavigate();
  const { close } = useNotificationsPanel();
  const actions = useRoomMemberInviteActions();
  const [pendingAction, setPendingAction] = useState<
    'accept' | 'refuse' | null
  >(null);
  const inviterName =
    invite.invitedBy.displayName?.trim() ||
    invite.invitedBy.username ||
    t('profile.defaultDisplayName');
  const timestamp =
    formatNotificationTimestamp(invite.createdAt, locale) ??
    formatDateTime(invite.createdAt);
  const isPending = pendingAction !== null;
  const feedSegments: readonly TranslationSegment[] = [
    {
      emphasis: true,
      key: 'inviterName',
      text: inviterName,
    },
    {
      emphasis: false,
      key: 'feedAction',
      text: t('rooms.memberInvites.notifications.feedAction', {
        values: { roomName: invite.roomName },
      }),
    },
  ];

  const handleAction = async (action: 'accept' | 'refuse') => {
    setPendingAction(action);
    try {
      const result = await actions.mutateAsync({
        action,
        inviteId: invite.id,
        roomId: invite.roomId,
      });
      if (action === 'accept' && result.roomId) {
        close();
        navigate(`/rooms/${result.roomId}`);
      }
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <article className={rowClassName}>
      <Avatar
        background={invite.invitedBy.avatar.background}
        foreground={invite.invitedBy.avatar.foreground}
        imageAlt={inviterName}
        imageUrl={invite.invitedBy.avatar.imageUrl}
        initial={invite.invitedBy.avatar.initial}
        size="lg"
      />
      <div className="min-w-0 flex-1">
        <NotificationRichMessage
          createdAt={invite.createdAt}
          segments={feedSegments}
          timestamp={timestamp}
        />
      </div>
      <div className="relative z-10 flex shrink-0 items-center gap-2">
        <Button
          disabled={isPending}
          isLoading={pendingAction === 'accept'}
          loadingLabel={t('rooms.memberInvites.notifications.accepting')}
          onClick={() => handleAction('accept')}
          size="sm"
          type="button"
          variant="primary"
        >
          {t('rooms.memberInvites.notifications.accept')}
        </Button>
        <Button
          disabled={isPending}
          isLoading={pendingAction === 'refuse'}
          loadingLabel={t('rooms.memberInvites.notifications.refusing')}
          onClick={() => handleAction('refuse')}
          size="sm"
          type="button"
          variant="secondary"
        >
          {t('rooms.memberInvites.notifications.refuse')}
        </Button>
      </div>
    </article>
  );
}
