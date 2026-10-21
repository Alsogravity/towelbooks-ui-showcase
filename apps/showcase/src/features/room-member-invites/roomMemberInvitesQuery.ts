export const ROOM_MEMBER_INVITES_QUERY_ROOT = 'room-member-invites' as const;

export function incomingRoomMemberInvitesQueryKey() {
  return [ROOM_MEMBER_INVITES_QUERY_ROOT, 'incoming'] as const;
}

export function incomingRoomMemberInvitesSummaryQueryKey() {
  return [ROOM_MEMBER_INVITES_QUERY_ROOT, 'summary'] as const;
}
