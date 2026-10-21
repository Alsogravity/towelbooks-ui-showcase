import type {
  IncomingFollowRequestItem,
  IncomingRoomMemberInvite,
  Notification,
} from '@towelbooks/schemas';

// Follow / room join / member invites are domain pending rows, not Notification rows.
export type NotificationCenterFeedItem =
  | {
      createdAt: string;
      id: string;
      kind: 'notification';
      notification: Notification;
    }
  | {
      createdAt: string;
      id: string;
      kind: 'followRequest';
      request: IncomingFollowRequestItem;
    }
  | {
      createdAt: string;
      id: string;
      kind: 'roomMemberInvite';
      invite: IncomingRoomMemberInvite;
    };

export type NotificationCenterSectionKey =
  'today' | 'thisWeek' | 'thisMonth' | 'previous';

export type NotificationCenterSection = {
  key: NotificationCenterSectionKey;
  items: NotificationCenterFeedItem[];
};

const SECTION_ORDER: NotificationCenterSectionKey[] = [
  'today',
  'thisWeek',
  'thisMonth',
  'previous',
];

export function getNotificationCenterFeedItemKey(
  item: NotificationCenterFeedItem,
) {
  return `${item.kind}:${item.id}`;
}

function startOfLocalDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function startOfLocalWeek(value: Date) {
  const start = startOfLocalDay(value);
  start.setDate(start.getDate() - start.getDay());

  return start;
}

function startOfLocalMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function getSectionKey(
  item: NotificationCenterFeedItem,
  boundaries: {
    startOfMonth: number;
    startOfToday: number;
    startOfWeek: number;
  },
): NotificationCenterSectionKey {
  const createdAt = new Date(item.createdAt).getTime();

  if (createdAt >= boundaries.startOfToday) {
    return 'today';
  }

  if (createdAt >= boundaries.startOfWeek) {
    return 'thisWeek';
  }

  if (createdAt >= boundaries.startOfMonth) {
    return 'thisMonth';
  }

  return 'previous';
}

export function groupNotificationCenterItemsByDate(
  items: NotificationCenterFeedItem[],
  now: Date = new Date(),
): NotificationCenterSection[] {
  const boundaries = {
    startOfMonth: startOfLocalMonth(now).getTime(),
    startOfToday: startOfLocalDay(now).getTime(),
    startOfWeek: startOfLocalWeek(now).getTime(),
  };
  const groupedItems = new Map<
    NotificationCenterSectionKey,
    NotificationCenterFeedItem[]
  >();

  for (const item of items) {
    const sectionKey = getSectionKey(item, boundaries);
    const sectionItems = groupedItems.get(sectionKey) ?? [];
    sectionItems.push(item);
    groupedItems.set(sectionKey, sectionItems);
  }

  return SECTION_ORDER.flatMap((key) => {
    const sectionItems = groupedItems.get(key);

    return sectionItems === undefined || sectionItems.length === 0
      ? []
      : [{ key, items: sectionItems }];
  });
}
