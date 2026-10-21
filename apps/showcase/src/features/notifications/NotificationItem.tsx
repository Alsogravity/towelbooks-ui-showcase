import { resolveNotificationRoute } from '@towelbooks/schemas';
import { useNavigate } from 'react-router';

import {
  NOTIFICATION_CATEGORY_ICON,
  presentNotificationMessage,
} from './notificationPresentation';
import { NotificationRichMessage } from './NotificationRichMessage';
import { useNotificationsPanel } from './NotificationsPanelContext';
import { Avatar, Icon } from '../../components/primitives';
import { formatNotificationTimestamp, useI18n } from '../../i18n';

import type { Notification } from '@towelbooks/schemas';

type NotificationItemProps = {
  isUnreadHighlighted: boolean;
  notification: Notification;
};

export function NotificationItem({
  isUnreadHighlighted,
  notification,
}: NotificationItemProps) {
  const { formatDateTime, locale, t } = useI18n();
  const navigate = useNavigate();
  const { close } = useNotificationsPanel();
  const actor = notification.actor;
  const actorName = actor?.displayName?.trim() || actor?.username || null;
  const isActionable = notification.href !== null;

  const timestamp =
    formatNotificationTimestamp(notification.createdAt, locale) ??
    formatDateTime(notification.createdAt);
  const message = presentNotificationMessage(notification, t);

  const activate = () => {
    const href =
      resolveNotificationRoute(notification.type, notification.metadata) ??
      notification.href;

    if (href) {
      close();
      navigate(href);
    }
  };

  const rowClassName = [
    'flex w-full items-center gap-3 rounded-[var(--radius-paper-4)] px-3 py-3 text-left transition-colors hover:bg-paper-2',
    isActionable
      ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/40'
      : null,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span
        aria-hidden="true"
        className={[
          'flex size-11 shrink-0 items-center justify-center text-ink-2',
          isUnreadHighlighted ? 'text-brick' : null,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {actor ? (
          <Avatar
            background={actor.avatar.background}
            foreground={actor.avatar.foreground}
            imageAlt={actorName ?? undefined}
            imageUrl={actor.avatar.imageUrl}
            imageUrls={actor.avatar.imageUrls}
            initial={actor.avatar.initial}
            size="lg"
          />
        ) : (
          <Icon
            name={NOTIFICATION_CATEGORY_ICON[notification.category]}
            size={20}
          />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <NotificationRichMessage
          createdAt={notification.createdAt}
          excerpt={message.excerpt}
          moreLabel={message.excerpt ? t('notifications.rich.more') : null}
          segments={message.segments}
          timestamp={timestamp}
        />
      </div>
    </>
  );

  return isActionable ? (
    <button className={rowClassName} onClick={activate} type="button">
      {content}
    </button>
  ) : (
    <div className={rowClassName}>{content}</div>
  );
}
