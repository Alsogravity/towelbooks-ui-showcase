import type { Notification, NotificationCategory } from '@towelbooks/schemas';

import type { TranslationSegment, useI18n } from '../../i18n';

import type { IconName } from '../../components/primitives';

/** Maps a notification category to its inbox icon. */
export const NOTIFICATION_CATEGORY_ICON: Record<
  NotificationCategory,
  IconName
> = {
  announcements: 'megaphone-glyph',
  meetings: 'calendar-clock',
  polls: 'poll-glyph',
  comments: 'message-circle',
  security: 'shield-check',
};

export function notificationCategoryLabelKey(
  category: NotificationCategory,
): string {
  return `notifications.category.${category}`;
}

type Translate = ReturnType<typeof useI18n>['t'];

export type NotificationMessagePresentation = {
  excerpt: string | null;
  segments: readonly TranslationSegment[];
};

function emphasized(text: string, key?: string): TranslationSegment {
  return {
    emphasis: true,
    key,
    text,
  };
}

function plain(text: string, key?: string): TranslationSegment {
  return {
    emphasis: false,
    key,
    text,
  };
}

function readMetadataString(
  metadata: Notification['metadata'],
  key: string,
): string | null {
  const value = metadata[key];

  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

function normalizeInlineText(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().replace(/\s+/g, ' ');

  return normalized.length > 0 ? normalized : null;
}

function localizedNotificationTitle(
  notification: Notification,
  t: Translate,
): string {
  return t(`notifications.type.${notification.type}`, {
    fallback: notification.title,
  });
}

function appendRoomContext(
  segments: TranslationSegment[],
  roomTitle: string | null,
  t: Translate,
): TranslationSegment[] {
  if (!roomTitle) {
    return segments;
  }

  return [
    ...segments,
    plain(t('notifications.rich.context.inRoom'), 'roomContextPrefix'),
    emphasized(roomTitle, 'roomTitle'),
  ];
}

function appendTrailingTitle(
  segments: TranslationSegment[],
  title: string | null,
  key: string,
): TranslationSegment[] {
  if (!title) {
    return segments;
  }

  return [...segments, plain(': ', `${key}Separator`), emphasized(title, key)];
}

function actorAwareBaseSegments(
  notification: Notification,
  suffixKey: string,
  t: Translate,
): TranslationSegment[] {
  if (!notification.actor?.username) {
    return [plain(localizedNotificationTitle(notification, t), 'title')];
  }

  return [
    emphasized(notification.actor.username, 'actorUsername'),
    plain(t(suffixKey), 'actorSuffix'),
  ];
}

export function presentNotificationMessage(
  notification: Notification,
  t: Translate,
): NotificationMessagePresentation {
  const roomTitle = notification.context?.room?.title ?? null;
  const excerpt = normalizeInlineText(notification.body);

  switch (notification.type) {
    case 'comment.on_my_activity':
      return {
        excerpt,
        segments: appendRoomContext(
          actorAwareBaseSegments(
            notification,
            'notifications.rich.actorSuffix.comment.on_my_activity',
            t,
          ),
          roomTitle,
          t,
        ),
      };
    case 'comment.on_my_discussion':
      return {
        excerpt,
        segments: appendRoomContext(
          actorAwareBaseSegments(
            notification,
            'notifications.rich.actorSuffix.comment.on_my_discussion',
            t,
          ),
          roomTitle,
          t,
        ),
      };
    case 'comment.liked':
      return {
        excerpt,
        segments: appendRoomContext(
          actorAwareBaseSegments(
            notification,
            'notifications.rich.actorSuffix.comment.liked',
            t,
          ),
          roomTitle,
          t,
        ),
      };
    case 'comment.reply_to_my_comment':
      return {
        excerpt,
        segments: appendRoomContext(
          actorAwareBaseSegments(
            notification,
            'notifications.rich.actorSuffix.comment.reply_to_my_comment',
            t,
          ),
          roomTitle,
          t,
        ),
      };
    case 'room.meeting_updated':
      return {
        excerpt,
        segments: appendTrailingTitle(
          appendRoomContext(
            actorAwareBaseSegments(
              notification,
              'notifications.rich.actorSuffix.room.meeting_updated',
              t,
            ),
            roomTitle,
            t,
          ),
          readMetadataString(notification.metadata, 'meetingTitle'),
          'meetingTitle',
        ),
      };
    case 'room.meeting_cancelled':
      return {
        excerpt,
        segments: appendTrailingTitle(
          appendRoomContext(
            actorAwareBaseSegments(
              notification,
              'notifications.rich.actorSuffix.room.meeting_cancelled',
              t,
            ),
            roomTitle,
            t,
          ),
          readMetadataString(notification.metadata, 'meetingTitle'),
          'meetingTitle',
        ),
      };
    case 'room.poll_closed':
      return {
        excerpt,
        segments: appendTrailingTitle(
          appendRoomContext(
            actorAwareBaseSegments(
              notification,
              'notifications.rich.actorSuffix.room.poll_closed',
              t,
            ),
            roomTitle,
            t,
          ),
          readMetadataString(notification.metadata, 'pollTitle'),
          'pollTitle',
        ),
      };
    case 'room.announcement_created':
      return {
        excerpt,
        segments: appendRoomContext(
          actorAwareBaseSegments(
            notification,
            'notifications.rich.actorSuffix.room.announcement_created',
            t,
          ),
          roomTitle,
          t,
        ),
      };
  }
}
