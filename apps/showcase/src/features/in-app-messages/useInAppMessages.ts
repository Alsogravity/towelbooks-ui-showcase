import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RecordInAppMessageReceiptRequest } from '@towelbooks/schemas';

import { SUPPORTED_WEB_IN_APP_MESSAGE_CAPABILITIES } from './inAppMessageCapabilities';
import { inAppMessagesQueryKeys } from './inAppMessagesQueryKeys';
import { useAuth } from '../auth/AuthContext';
import { sdk } from '../../lib/sdk';

export { inAppMessagesQueryKeys } from './inAppMessagesQueryKeys';

/**
 * Loads the in-app messages pending for the current user. The query is scoped by
 * the authenticated user id, so a different user signing in on the same browser
 * never reads the previous user's cached pending state. The web client's
 * supported type/surface capabilities are sent so the server can avoid
 * delivering messages this build cannot render. Failures are not retried and do
 * not surface as errors to the host — a message platform must never trap the
 * user behind a failed overlay fetch.
 */
export function usePendingInAppMessages() {
  const { user } = useAuth();

  return useQuery({
    queryKey: inAppMessagesQueryKeys.pending(user?.id ?? null),
    queryFn: () =>
      sdk.inAppMessages.listPending({
        supports: SUPPORTED_WEB_IN_APP_MESSAGE_CAPABILITIES,
      }),
    enabled: user !== null,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useRecordInAppMessageReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: RecordInAppMessageReceiptRequest) =>
      sdk.inAppMessages.recordReceipt(body),
    onSuccess: (receipt) => {
      // A dismissed or completed receipt suppresses future delivery, so refresh
      // the pending list to drop the message server-side as the source of truth.
      // Invalidating the user-agnostic prefix covers the scoped pending key.
      if (receipt.dismissedAt !== null || receipt.completedAt !== null) {
        void queryClient.invalidateQueries({
          queryKey: inAppMessagesQueryKeys.pendingRoot,
        });
      }
    },
  });
}
