export const PRIVACY_PREFERENCES_QUERY_ROOT = 'privacy-preferences' as const;

export function privacyPreferencesQueryKey(userId: string) {
  return [PRIVACY_PREFERENCES_QUERY_ROOT, userId] as const;
}
