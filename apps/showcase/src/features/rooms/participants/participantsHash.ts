/**
 * URL-hash routes for the room participants (members) overlay.
 * Paths form a tree under `#members` so nested views keep their parent segment:
 *
 * - `#members`
 * - `#members/join-requests`
 * - `#members/member/:memberId`
 * - `#members/member/:memberId/access`
 * - `#members/member/:memberId/history`
 * - `#members/invites`
 * - `#members/invites/create`
 * - `#members/invites/create/detail/:inviteId`
 * - `#members/invites/send`
 * - `#members/invites/history`
 * - `#members/invites/links/active`
 * - `#members/invites/links/active/detail/:inviteId`
 * - `#members/invites/links/inactive`
 * - `#members/invites/links/inactive/detail/:inviteId`
 * - `#members/invites/detail/:inviteId`
 */

export type InviteDetailFrom =
  'invites' | 'invite-create' | 'invite-links-active' | 'invite-links-inactive';

export type ParticipantsHashView =
  | { type: 'members' }
  | { type: 'invites' }
  | { type: 'join-requests' }
  | { type: 'invite-create' }
  | { type: 'invite-links-active' }
  | { type: 'invite-links-inactive' }
  | {
      type: 'invite-detail';
      from: InviteDetailFrom;
      inviteId: string;
    }
  | { type: 'member-invites' }
  | { type: 'member-invites-history' }
  | { type: 'member-detail'; memberId: string }
  | { type: 'member-access'; memberId: string }
  | { type: 'member-history'; memberId: string };

export type ParticipantsRootView = 'members' | 'invites' | 'join-requests';

const PARTICIPANTS_HASH_PREFIX = '#members';

function isSafeIdSegment(value: string): boolean {
  return value.length > 0 && !value.includes('/') && !value.includes('#');
}

function inviteDetailFromPath(
  segments: string[],
): { from: InviteDetailFrom; inviteId: string } | null {
  // #members/invites/detail/:id
  if (
    segments.length === 3 &&
    segments[0] === 'invites' &&
    segments[1] === 'detail' &&
    segments[2] != null &&
    isSafeIdSegment(segments[2])
  ) {
    return { from: 'invites', inviteId: segments[2] };
  }

  // #members/invites/create/detail/:id
  if (
    segments.length === 4 &&
    segments[0] === 'invites' &&
    segments[1] === 'create' &&
    segments[2] === 'detail' &&
    segments[3] != null &&
    isSafeIdSegment(segments[3])
  ) {
    return { from: 'invite-create', inviteId: segments[3] };
  }

  // #members/invites/links/active|inactive/detail/:id
  if (
    segments.length === 5 &&
    segments[0] === 'invites' &&
    segments[1] === 'links' &&
    (segments[2] === 'active' || segments[2] === 'inactive') &&
    segments[3] === 'detail' &&
    segments[4] != null &&
    isSafeIdSegment(segments[4])
  ) {
    return {
      from:
        segments[2] === 'active'
          ? 'invite-links-active'
          : 'invite-links-inactive',
      inviteId: segments[4],
    };
  }

  return null;
}

export function parseParticipantsHash(
  hash: string,
): ParticipantsHashView | null {
  if (hash === PARTICIPANTS_HASH_PREFIX) {
    return { type: 'members' };
  }

  if (!hash.startsWith(`${PARTICIPANTS_HASH_PREFIX}/`)) {
    return null;
  }

  const rest = hash.slice(`${PARTICIPANTS_HASH_PREFIX}/`.length);
  if (!rest) {
    return null;
  }

  const segments = rest.split('/');
  if (segments.some((segment) => segment.length === 0)) {
    return null;
  }

  // #members/join-requests
  if (segments.length === 1 && segments[0] === 'join-requests') {
    return { type: 'join-requests' };
  }

  // #members/invites
  if (segments.length === 1 && segments[0] === 'invites') {
    return { type: 'invites' };
  }

  // #members/member/:memberId
  if (
    segments.length === 2 &&
    segments[0] === 'member' &&
    segments[1] != null &&
    isSafeIdSegment(segments[1])
  ) {
    return { type: 'member-detail', memberId: segments[1] };
  }

  // #members/member/:memberId/access|history
  if (
    segments.length === 3 &&
    segments[0] === 'member' &&
    segments[1] != null &&
    isSafeIdSegment(segments[1]) &&
    (segments[2] === 'access' || segments[2] === 'history')
  ) {
    return {
      type: segments[2] === 'access' ? 'member-access' : 'member-history',
      memberId: segments[1],
    };
  }

  // #members/invites/create|send|history
  if (segments.length === 2 && segments[0] === 'invites') {
    if (segments[1] === 'create') {
      return { type: 'invite-create' };
    }
    if (segments[1] === 'send') {
      return { type: 'member-invites' };
    }
    if (segments[1] === 'history') {
      return { type: 'member-invites-history' };
    }
    return null;
  }

  // #members/invites/links/active|inactive
  if (
    segments.length === 3 &&
    segments[0] === 'invites' &&
    segments[1] === 'links' &&
    (segments[2] === 'active' || segments[2] === 'inactive')
  ) {
    return {
      type:
        segments[2] === 'active'
          ? 'invite-links-active'
          : 'invite-links-inactive',
    };
  }

  const inviteDetail = inviteDetailFromPath(segments);
  if (inviteDetail != null) {
    return {
      type: 'invite-detail',
      from: inviteDetail.from,
      inviteId: inviteDetail.inviteId,
    };
  }

  return null;
}

export function buildParticipantsHash(view: ParticipantsHashView): string {
  switch (view.type) {
    case 'members':
      return PARTICIPANTS_HASH_PREFIX;
    case 'join-requests':
      return `${PARTICIPANTS_HASH_PREFIX}/join-requests`;
    case 'invites':
      return `${PARTICIPANTS_HASH_PREFIX}/invites`;
    case 'invite-create':
      return `${PARTICIPANTS_HASH_PREFIX}/invites/create`;
    case 'member-invites':
      return `${PARTICIPANTS_HASH_PREFIX}/invites/send`;
    case 'member-invites-history':
      return `${PARTICIPANTS_HASH_PREFIX}/invites/history`;
    case 'invite-links-active':
      return `${PARTICIPANTS_HASH_PREFIX}/invites/links/active`;
    case 'invite-links-inactive':
      return `${PARTICIPANTS_HASH_PREFIX}/invites/links/inactive`;
    case 'invite-detail':
      switch (view.from) {
        case 'invite-create':
          return `${PARTICIPANTS_HASH_PREFIX}/invites/create/detail/${view.inviteId}`;
        case 'invite-links-active':
          return `${PARTICIPANTS_HASH_PREFIX}/invites/links/active/detail/${view.inviteId}`;
        case 'invite-links-inactive':
          return `${PARTICIPANTS_HASH_PREFIX}/invites/links/inactive/detail/${view.inviteId}`;
        case 'invites':
        default:
          return `${PARTICIPANTS_HASH_PREFIX}/invites/detail/${view.inviteId}`;
      }
    case 'member-detail':
      return `${PARTICIPANTS_HASH_PREFIX}/member/${view.memberId}`;
    case 'member-access':
      return `${PARTICIPANTS_HASH_PREFIX}/member/${view.memberId}/access`;
    case 'member-history':
      return `${PARTICIPANTS_HASH_PREFIX}/member/${view.memberId}/history`;
  }
}

export function isParticipantsHashOpen(hash: string): boolean {
  return parseParticipantsHash(hash) !== null;
}

export function getParticipantsParentView(
  view: ParticipantsHashView,
): ParticipantsHashView | 'close' {
  switch (view.type) {
    case 'members':
      return 'close';
    case 'member-detail':
    case 'invites':
    case 'join-requests':
      return { type: 'members' };
    case 'member-access':
    case 'member-history':
      return { type: 'member-detail', memberId: view.memberId };
    case 'invite-create':
    case 'member-invites':
    case 'member-invites-history':
    case 'invite-links-active':
    case 'invite-links-inactive':
      return { type: 'invites' };
    case 'invite-detail':
      switch (view.from) {
        case 'invite-create':
          return { type: 'invite-create' };
        case 'invite-links-active':
          return { type: 'invite-links-active' };
        case 'invite-links-inactive':
          return { type: 'invite-links-inactive' };
        case 'invites':
        default:
          return { type: 'invites' };
      }
  }
}

export function participantsRootFromView(
  view: ParticipantsHashView,
): ParticipantsRootView {
  switch (view.type) {
    case 'invites':
    case 'invite-create':
    case 'invite-detail':
    case 'invite-links-active':
    case 'invite-links-inactive':
    case 'member-invites':
    case 'member-invites-history':
      return 'invites';
    case 'join-requests':
      return 'join-requests';
    default:
      return 'members';
  }
}

export function rootViewToParticipantsHash(
  root: ParticipantsRootView,
): ParticipantsHashView {
  if (root === 'invites') {
    return { type: 'invites' };
  }
  if (root === 'join-requests') {
    return { type: 'join-requests' };
  }
  return { type: 'members' };
}

/** Map the current view to an invite-detail parent when opening a detail. */
export function inviteDetailFromCurrentView(
  view: ParticipantsHashView | null,
): InviteDetailFrom {
  if (view == null) {
    return 'invites';
  }

  switch (view.type) {
    case 'invite-create':
    case 'invite-links-active':
    case 'invite-links-inactive':
    case 'invites':
      return view.type;
    case 'invite-detail':
      return view.from;
    default:
      return 'invites';
  }
}
