import {
  buildAvatar,
  type ActivityActor,
  type ActivityEvent,
} from '@towelbooks/schemas';

export function buildProfileActivityActor(
  overrides: Partial<ActivityActor> = {},
): ActivityActor {
  const displayName = overrides.displayName ?? 'Rafa';
  const username = overrides.username ?? 'rafa_reads';

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

export const profileActivityEventBase: Omit<
  ActivityEvent,
  'id' | 'metadata' | 'type'
> = {
  actor: buildProfileActivityActor(),
  roomId: null,
  ownerUserId: 'user-1',
  sourceType: 'rating',
  sourceId: null,
  scope: 'profile',
  visibility: 'profile_public',
  lifecycleStatus: 'active',
  moderationStatus: 'clean',
  hiddenReason: null,
  source: {},
  commentCount: 0,
  reactions: {
    counts: {
      like: 0,
    },
    viewerReaction: null,
  },
  occurredAt: '2026-05-10T12:00:00.000Z',
  createdAt: '2026-05-12T12:00:00.000Z',
  updatedAt: '2026-05-10T12:00:00.000Z',
  hiddenAt: null,
};

export function buildProfileActivityEvent(
  overrides: Partial<ActivityEvent> & Pick<ActivityEvent, 'id' | 'type'>,
): ActivityEvent {
  return {
    ...profileActivityEventBase,
    metadata: {},
    ...overrides,
  };
}
