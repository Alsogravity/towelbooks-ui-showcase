export const INCOMING_FOLLOW_REQUESTS_QUERY_ROOT = 'follow-requests' as const;

export function incomingFollowRequestsQueryKey() {
  return ['me', INCOMING_FOLLOW_REQUESTS_QUERY_ROOT] as const;
}

export function incomingFollowRequestsSummaryQueryKey() {
  return ['me', INCOMING_FOLLOW_REQUESTS_QUERY_ROOT, 'summary'] as const;
}
