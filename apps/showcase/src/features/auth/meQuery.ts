export const ME_QUERY_ROOT = 'me' as const;

export function meQueryKey(userId: string) {
  return [ME_QUERY_ROOT, userId] as const;
}
