import type { NotificationType } from './notifications';

function str(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function activityEventRoute(meta: Record<string, unknown>): string | null {
  const activityEventId = str(meta.activityEventId);
  const activityOwnerUsername = str(meta.activityOwnerUsername);
  const roomId = str(meta.roomId);

  if (activityOwnerUsername && activityEventId) {
    return `/${encodeURIComponent(activityOwnerUsername)}`;
  }

  return roomId && activityEventId ? `/rooms/${roomId}?tab=activity` : null;
}

function discussionRoute(meta: Record<string, unknown>): string | null {
  const roomId = str(meta.roomId);
  const discussionId = str(meta.discussionId);

  return roomId && discussionId
    ? `/rooms/${roomId}?tab=community&view=discussions&discussion=${discussionId}`
    : null;
}

const ROUTE_RESOLVERS: Record<
  NotificationType,
  ((meta: Record<string, unknown>) => string | null) | undefined
> = {
  'room.poll_closed': (meta) => {
    const roomId = str(meta.roomId);
    const pollId = str(meta.pollId);
    return roomId && pollId
      ? `/rooms/${roomId}?tab=community&view=polls&poll=${pollId}`
      : null;
  },
  'room.announcement_created': (meta) => {
    const roomId = str(meta.roomId);
    const announcementId = str(meta.announcementId);
    return roomId && announcementId
      ? `/rooms/${roomId}?tab=announcements&announcement=${announcementId}`
      : null;
  },
  'comment.on_my_activity': (meta) => activityEventRoute(meta),
  'comment.on_my_discussion': (meta) => discussionRoute(meta),
  'room.meeting_updated': (meta) => {
    const roomId = str(meta.roomId);
    return roomId ? `/rooms/${roomId}?tab=meetings` : null;
  },
  'room.meeting_cancelled': (meta) => {
    const roomId = str(meta.roomId);
    return roomId ? `/rooms/${roomId}?tab=meetings` : null;
  },
  'comment.reply_to_my_comment': (meta) => {
    if (meta.targetType === 'activity_event') {
      return activityEventRoute(meta);
    }

    if (meta.targetType === 'discussion') {
      return discussionRoute(meta);
    }

    const roomId = str(meta.roomId);
    const readingId = str(meta.readingId);
    return roomId && readingId
      ? `/rooms/${roomId}/readings/${readingId}`
      : null;
  },
  'comment.liked': (meta) => {
    if (
      meta.targetType === 'activity_event' ||
      str(meta.activityEventId) !== null
    ) {
      return activityEventRoute(meta);
    }

    if (str(meta.discussionId) !== null) {
      return discussionRoute(meta);
    }

    const roomId = str(meta.roomId);
    const readingId = str(meta.readingId);
    return roomId && readingId
      ? `/rooms/${roomId}/readings/${readingId}`
      : null;
  },
};

export function resolveNotificationRoute(
  type: NotificationType,
  metadata: Record<string, unknown>,
): string | null {
  return ROUTE_RESOLVERS[type]?.(metadata) ?? null;
}
