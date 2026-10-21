export const IN_APP_MESSAGES_ROOT_KEY = 'in-app-messages';

/**
 * Query keys for the in-app messages feature. The pending list is scoped by the
 * authenticated user id so one user's cached pending state can never be read by
 * another user sharing the same browser session. `clearAuthenticatedQueryCache`
 * additionally drops the whole root on every auth change as defense in depth.
 */
export const inAppMessagesQueryKeys = {
  root: [IN_APP_MESSAGES_ROOT_KEY] as const,
  pendingRoot: [IN_APP_MESSAGES_ROOT_KEY, 'pending'] as const,
  pending: (userId: string | null) =>
    [IN_APP_MESSAGES_ROOT_KEY, 'pending', userId] as const,
};
