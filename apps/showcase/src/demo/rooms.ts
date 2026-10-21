import { roomRoleCapabilityCodeSchema } from '@towelbooks/schemas';
import { state, date } from './state';
import { paginate, cursorEmpty, record } from './helpers';
const viewer = {
  role: 'owner',
  membershipStatus: 'active',
  accessState: 'active',
  entry: {
    canJoinDirectly: false,
    canRequestJoin: false,
    hasPendingJoinRequest: false,
    canAcceptInvite: false,
    blockedReason: null,
  },
  capabilities: roomRoleCapabilityCodeSchema.options,
};
export function roomsRequest(
  path: string,
  method: string,
  query: URLSearchParams,
  body: unknown,
): { handled: boolean; value?: unknown } {
  if (path === '/rooms')
    return { handled: true, value: paginate(state.rooms, query) };
  if (path === '/rooms/discover')
    return {
      handled: true,
      value: paginate(
        state.rooms.map(
          ({ userRole: _role, lastActivityAt: _activity, ...room }) => room,
        ),
        query,
      ),
    };
  const match = path.match(/^\/rooms\/([^/]+)(?:\/(.*))?$/);
  if (!match) return { handled: false };
  const [, id, rest] = match;
  const room = state.rooms.find((value) => value.id === id);
  if (!room) throw new Error('Room not found');
  if (!rest) {
    if (method === 'PATCH') Object.assign(room, record(body));
    return { handled: true, value: { ...room, viewer } };
  }
  if (rest === 'overview')
    return {
      handled: true,
      value: {
        ...room,
        viewer,
        previewMembers: [
          {
            id: state.user.id,
            displayName: state.user.displayName,
            role: 'owner',
            avatar: state.user.avatar,
          },
        ],
      },
    };
  if (rest === 'readings')
    return { handled: true, value: paginate([room.currentReading], query) };
  if (rest.startsWith('readings/'))
    return { handled: true, value: room.currentReading };
  if (rest === 'activities') return { handled: true, value: cursorEmpty };
  if (
    rest.startsWith('announcements') ||
    rest.startsWith('discussions') ||
    rest.startsWith('polls')
  )
    return { handled: true, value: paginate([], query) };
  if (rest === 'meetings') return { handled: true, value: paginate([], query) };
  if (rest === 'community/settings')
    return {
      handled: true,
      value: {
        roomId: id,
        discussionCreatePolicy: 'members',
        pollCreatePolicy: 'members',
        viewerRole: 'owner',
        viewerCanCreateDiscussions: true,
        viewerCanCreatePolls: true,
        viewerCanModerate: true,
      },
    };
  if (rest === 'role-capabilities')
    return {
      handled: true,
      value: { role: 'moderator', capabilities: [], joinPolicy: 'open' },
    };
  if (rest === 'members')
    return {
      handled: true,
      value: {
        ...cursorEmpty,
        items: [
          {
            id: state.user.id,
            userId: state.user.id,
            roomId: id,
            displayName: state.user.displayName,
            username: state.user.username,
            role: 'owner',
            status: 'active',
            bannedAt: null,
            access: {
              state: 'active',
              activeSources: [],
              effectiveExpiresAt: null,
              grants: [],
            },
            joinedAt: date,
            avatar: state.user.avatar,
          },
        ],
      },
    };
  if (rest === 'join')
    return {
      handled: true,
      value: {
        roomId: id,
        outcome: 'already_member',
        message: 'Demo membership',
      },
    };
  return { handled: false };
}
