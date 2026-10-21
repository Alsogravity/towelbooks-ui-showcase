import {
  type RoomAccessGrantSource,
  type RoomMember,
  type RoomMemberAccessGrantSummary,
} from '@towelbooks/schemas';

import { type TagVariant } from '../../../components/primitives';

import type { RoomMemberManagementEventType } from '@towelbooks/schemas';

import type { RoomMemberManagementDetail } from '../types';

export const roomMemberRoleColor: Record<RoomMember['role'], TagVariant> = {
  admin: 'reading',
  member: 'role',
  moderator: 'gilt',
  owner: 'private',
};

export const roomMemberAccessStatusVariant: Record<
  RoomMember['access']['state'],
  TagVariant
> = {
  active: 'reading',
  expired: 'paused',
  revoked: 'private',
  none: 'default',
  suspended: 'paused',
};

const SOURCE_DISPLAY_ORDER: RoomAccessGrantSource[] = [
  'manual',
  'invite',
  'payment',
  'system',
];

export type MemberAccessDisplayKind =
  'owner' | 'admin' | 'active' | 'expired' | 'revoked' | 'none' | 'suspended';

export type MemberAccessDisplay = {
  kind: MemberAccessDisplayKind;
  activeSources: RoomAccessGrantSource[];
  lastSource: RoomAccessGrantSource | null;
  expirationIso: string | null;
};

export function sortAccessSources(
  sources: RoomAccessGrantSource[],
): RoomAccessGrantSource[] {
  return [...sources].sort(
    (left, right) =>
      SOURCE_DISPLAY_ORDER.indexOf(left) - SOURCE_DISPLAY_ORDER.indexOf(right),
  );
}

function findLastInactiveGrant(
  grants: RoomMemberAccessGrantSummary[],
): RoomMemberAccessGrantSummary | null {
  const inactiveGrants = grants.filter(
    (grant) => grant.state === 'expired' || grant.state === 'revoked',
  );

  if (inactiveGrants.length === 0) {
    return null;
  }

  return inactiveGrants.sort((left, right) => {
    const leftTime = new Date(
      left.expiresAt ?? left.revokedAt ?? left.startsAt,
    ).getTime();
    const rightTime = new Date(
      right.expiresAt ?? right.revokedAt ?? right.startsAt,
    ).getTime();

    return rightTime - leftTime;
  })[0];
}

export function getMemberAccessDisplay(
  member: Pick<RoomMember, 'role' | 'access'>,
): MemberAccessDisplay {
  const { access } = member;

  if (access.state === 'suspended') {
    return {
      kind: 'suspended',
      activeSources: [],
      lastSource: null,
      expirationIso: null,
    };
  }

  if (member.role === 'owner') {
    return {
      kind: 'owner',
      activeSources: [],
      lastSource: null,
      expirationIso: null,
    };
  }

  if (member.role === 'admin' && access.state === 'active') {
    return {
      kind: 'admin',
      activeSources: [],
      lastSource: null,
      expirationIso: null,
    };
  }

  if (access.state === 'active') {
    return {
      kind: 'active',
      activeSources: sortAccessSources(access.activeSources),
      lastSource: null,
      expirationIso: access.effectiveExpiresAt,
    };
  }

  const lastInactiveGrant = findLastInactiveGrant(access.grants);

  return {
    kind: access.state,
    activeSources: [],
    lastSource: lastInactiveGrant?.source ?? null,
    expirationIso:
      lastInactiveGrant?.expiresAt ?? lastInactiveGrant?.revokedAt ?? null,
  };
}

export function getRoomMemberRoleLabelKey(
  role: RoomMember['role'],
): `rooms.role.${RoomMember['role']}` {
  return `rooms.role.${role}`;
}

export function getRoomMemberAccessSourceLabelKey(
  source: RoomAccessGrantSource,
): `rooms.members.access.source.${RoomAccessGrantSource}` {
  return `rooms.members.access.source.${source}`;
}

export function getRoomMemberManagementEventTypeLabelKey(
  eventType: RoomMemberManagementEventType,
): `rooms.members.management.history.eventType.${RoomMemberManagementEventType}` {
  return `rooms.members.management.history.eventType.${eventType}`;
}

export type RoomMemberEffectiveAccessDisplayState =
  | 'owner'
  | 'admin'
  | 'active_access'
  | 'suspended'
  | 'expired'
  | 'revoked'
  | 'none';

export const roomMemberEffectiveAccessStatusVariant: Record<
  RoomMemberEffectiveAccessDisplayState,
  TagVariant
> = {
  owner: 'private',
  admin: 'reading',
  active_access: 'reading',
  suspended: 'paused',
  expired: 'paused',
  revoked: 'private',
  none: 'default',
};

export function resolveRoomMemberEffectiveAccessDisplayState(
  detail: Pick<RoomMemberManagementDetail, 'participation' | 'access'>,
): RoomMemberEffectiveAccessDisplayState {
  if (detail.participation.status === 'suspended') {
    return 'suspended';
  }

  if (detail.participation.role === 'owner') {
    return 'owner';
  }

  if (
    detail.participation.role === 'admin' &&
    detail.access.state === 'active'
  ) {
    return 'admin';
  }

  if (detail.access.state === 'active') {
    return 'active_access';
  }

  return detail.access.state;
}

export function getRoomMemberEffectiveAccessDisplayLabelKey(
  state: RoomMemberEffectiveAccessDisplayState,
):
  | `rooms.members.access.display.${'owner' | 'admin'}`
  | `rooms.members.effectiveAccess.status.${Exclude<RoomMemberEffectiveAccessDisplayState, 'owner' | 'admin'>}` {
  if (state === 'owner' || state === 'admin') {
    return `rooms.members.access.display.${state}`;
  }

  return `rooms.members.effectiveAccess.status.${state}`;
}
