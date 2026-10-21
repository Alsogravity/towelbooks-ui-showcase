import {
  buildAvatar,
  type ActivityActor,
  type ActivityEvent,
} from '@towelbooks/schemas';

export function buildTestActivityActor(
  overrides: Partial<ActivityActor> = {},
): ActivityActor {
  const displayName = overrides.displayName ?? 'Rafa';
  const username = overrides.username ?? 'rafa';

  return {
    avatar: buildAvatar({
      avatarBackground: '#142820',
      avatarForeground: '#E9F5EE',
      avatarImageUrl: null,
      displayName,
      username,
    }),
    displayName,
    userId: overrides.userId ?? 'user-1',
    username,
    ...overrides,
  };
}

export const activityEventBase: Omit<
  ActivityEvent,
  'id' | 'metadata' | 'type'
> = {
  actor: buildTestActivityActor(),
  roomId: 'room-1',
  ownerUserId: null,
  sourceType: 'reading',
  sourceId: 'reading-1',
  scope: 'room',
  visibility: 'room_members',
  lifecycleStatus: 'active',
  moderationStatus: 'clean',
  hiddenReason: null,
  source: {},
  commentCount: 0,
  reactions: {
    counts: { like: 0 },
    viewerReaction: null,
  },
  occurredAt: '2026-05-10T12:00:00.000Z',
  createdAt: '2026-05-10T12:00:00.000Z',
  updatedAt: '2026-05-10T12:00:00.000Z',
  hiddenAt: null,
};

export function buildActivityEvent(
  overrides: Partial<ActivityEvent> & Pick<ActivityEvent, 'id' | 'type'>,
): ActivityEvent {
  return {
    ...activityEventBase,
    metadata: {},
    ...overrides,
  };
}
