export const ROOM_JOIN_REQUESTS_QUERY_ROOT = 'room-join-requests' as const;

export function roomJoinRequestsSummaryQueryKey() {
  return ['me', ROOM_JOIN_REQUESTS_QUERY_ROOT, 'summary'] as const;
}
