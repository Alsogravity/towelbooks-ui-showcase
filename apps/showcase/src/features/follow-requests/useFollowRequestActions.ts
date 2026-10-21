import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import type {
  IncomingFollowRequestsResponse,
  IncomingFollowRequestsSummaryResponse,
} from '@towelbooks/schemas';

import { useToast } from '../../components/feedback';
import { createApiProblemToast } from '../errors';
import { useAuth } from '../auth/AuthContext';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';
import { notificationQueryKeys } from '../notifications/useNotifications';
import {
  incomingFollowRequestsQueryKey,
  incomingFollowRequestsSummaryQueryKey,
} from './followRequestsQuery';

type FollowRequestAction = 'accept' | 'decline';

type FollowRequestMutationInput = {
  action: FollowRequestAction;
  requestId: string;
  requesterUsername: string;
};

export function useFollowRequestActions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t } = useI18n();
  const { pushToast } = useToast();
  const incomingQueryKey = incomingFollowRequestsQueryKey();
  const summaryQueryKey = incomingFollowRequestsSummaryQueryKey();

  const invalidateFollowRequestQueries = async (requesterUsername: string) => {
    const ownerUsername = user?.username;

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: incomingQueryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: summaryQueryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.list(),
      }),
      ...(ownerUsername
        ? [
            queryClient.invalidateQueries({
              queryKey: ['profiles', ownerUsername],
            }),
            queryClient.invalidateQueries({
              queryKey: ['profiles', ownerUsername, 'followers'],
            }),
          ]
        : []),
      queryClient.invalidateQueries({
        queryKey: ['profiles', requesterUsername],
      }),
    ]);
  };

  const mutation = useMutation({
    mutationFn: async ({ action, requestId }: FollowRequestMutationInput) => {
      if (action === 'accept') {
        await sdk.users.me.acceptFollowRequest(requestId);
        return;
      }

      await sdk.users.me.declineFollowRequest(requestId);
    },
    onMutate: async ({ requestId }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: incomingQueryKey }),
        queryClient.cancelQueries({ queryKey: summaryQueryKey }),
      ]);

      const previousList =
        queryClient.getQueryData<InfiniteData<IncomingFollowRequestsResponse>>(
          incomingQueryKey,
        );
      const previousSummary =
        queryClient.getQueryData<IncomingFollowRequestsSummaryResponse>(
          summaryQueryKey,
        );
      const removedRequest = previousList?.pages
        .flatMap((page) => page.items)
        .find((request) => request.id === requestId);

      if (previousList) {
        queryClient.setQueryData<InfiniteData<IncomingFollowRequestsResponse>>(
          incomingQueryKey,
          {
            ...previousList,
            pages: previousList.pages.map((page) => ({
              ...page,
              items: page.items.filter((request) => request.id !== requestId),
            })),
          },
        );
      }

      if (previousSummary) {
        queryClient.setQueryData<IncomingFollowRequestsSummaryResponse>(
          summaryQueryKey,
          {
            ...previousSummary,
            pendingCount: Math.max(previousSummary.pendingCount - 1, 0),
            preview: previousSummary.preview.filter(
              (requester) => requester.id !== removedRequest?.requester.id,
            ),
            unseenCount: Math.max(previousSummary.unseenCount - 1, 0),
          },
        );
      }

      return { previousList, previousSummary };
    },
    onSuccess: async (_data, { action, requesterUsername }) => {
      await invalidateFollowRequestQueries(requesterUsername);
      pushToast({
        variant: 'success',
        title: t(
          action === 'accept'
            ? 'notifications.followRequests.accept.success'
            : 'notifications.followRequests.decline.success',
        ),
      });
    },
    onError: (error: unknown, { action }, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(incomingQueryKey, context.previousList);
      }

      if (context?.previousSummary) {
        queryClient.setQueryData(summaryQueryKey, context.previousSummary);
      }

      pushToast(
        createApiProblemToast(error, {
          fallbackKey:
            action === 'accept'
              ? 'notifications.followRequests.accept.error'
              : 'notifications.followRequests.decline.error',
          t,
        }),
      );
    },
  });

  return mutation;
}
