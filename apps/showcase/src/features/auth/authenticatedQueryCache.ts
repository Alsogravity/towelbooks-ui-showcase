import type { QueryClient } from '@tanstack/react-query';

import { ME_QUERY_ROOT } from './meQuery';
import { IN_APP_MESSAGES_ROOT_KEY } from '../in-app-messages/inAppMessagesQueryKeys';
import { PRIVACY_PREFERENCES_QUERY_ROOT } from '../privacy/privacyPreferencesQuery';

export const AUTHENTICATED_QUERY_ROOTS = [
  ['admin'],
  [ME_QUERY_ROOT],
  ['users', 'me'],
  ['libraries'],
  ['collections'],
  [PRIVACY_PREFERENCES_QUERY_ROOT],
  ['rooms'],
  ['dashboard'],
  ['comments'],
  ['profiles'],
  [IN_APP_MESSAGES_ROOT_KEY],
] as const;

type AuthenticatedQueryClient = Pick<
  QueryClient,
  'cancelQueries' | 'removeQueries'
>;

export async function clearAuthenticatedQueryCache(
  queryClient: AuthenticatedQueryClient,
): Promise<void> {
  await queryClient.cancelQueries();

  for (const queryKey of AUTHENTICATED_QUERY_ROOTS) {
    queryClient.removeQueries({ queryKey });
  }
}
