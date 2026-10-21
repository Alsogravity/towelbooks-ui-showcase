import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  EmptyState,
  ErrorState,
  LoadingState,
  useToast,
} from '../../../components/feedback';
import { Button } from '../../../components/primitives';
import { createApiProblemToast } from '../../errors';
import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';
import { RoomInviteDetailsContent } from './RoomInviteDetailsContent';
import { useRoomInviteDetails } from './useRoomInviteDetails';

type RoomInviteDetailsContentLoaderProps = {
  createdInviteRestrictionType?: 'allowed_emails' | 'none' | null;
  inviteId: string;
  inviteUrl?: string | null;
  copyStatus?: string | null;
  onCopyInviteLink?: () => void;
  onDismissCreatedAlert?: () => void;
  roomId: string;
};

export function RoomInviteDetailsContentLoader({
  createdInviteRestrictionType,
  inviteId,
  inviteUrl,
  copyStatus,
  onCopyInviteLink,
  onDismissCreatedAlert,
  roomId,
}: RoomInviteDetailsContentLoaderProps) {
  const { t } = useI18n();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const detailsQuery = useRoomInviteDetails(roomId, inviteId);

  const revealLinkMutation = useMutation({
    mutationFn: () => sdk.invites.revealLink(roomId, inviteId),
    onError: (error: unknown) => {
      pushToast(
        createApiProblemToast(error, {
          fallbackKey: 'invites.details.link.error.load',
          t,
        }),
      );
    },
  });

  const revokeMutation = useMutation({
    mutationFn: () => sdk.invites.revoke(roomId, inviteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['rooms', roomId, 'invites'],
      });
    },
    onError: (error: unknown) => {
      pushToast(
        createApiProblemToast(error, {
          fallbackKey: 'invites.action.error.revoke',
          t,
        }),
      );
    },
  });

  const handleGenerateLink = async () => {
    const response = await revealLinkMutation.mutateAsync();
    return response.inviteUrl;
  };

  if (detailsQuery.isLoading) {
    return (
      <LoadingState
        label={{
          key: 'invites.details.loading',
          fallback: 'Loading invite details...',
        }}
        className="p-4"
      />
    );
  }

  if (detailsQuery.error) {
    return (
      <ErrorState
        title={{
          key: 'invites.details.error.title',
          fallback: 'Unable to load invite details',
        }}
        body={{
          key: 'invites.details.error.body',
          fallback: 'Try again in a moment.',
        }}
        action={
          <Button
            variant="secondary"
            onClick={() => void detailsQuery.refetch()}
          >
            {t('errors.action.retry')}
          </Button>
        }
      />
    );
  }

  if (!detailsQuery.data) {
    return (
      <EmptyState
        title={{
          key: 'invites.details.empty.title',
          fallback: 'Invite details unavailable',
        }}
        body={{
          key: 'invites.details.empty.body',
          fallback: 'Close this panel and try again.',
        }}
      />
    );
  }

  return (
    <RoomInviteDetailsContent
      createdInviteRestrictionType={createdInviteRestrictionType ?? null}
      details={detailsQuery.data}
      inviteUrl={inviteUrl ?? null}
      copyStatus={copyStatus ?? null}
      isGeneratingLink={revealLinkMutation.isPending}
      isRevokingInvite={revokeMutation.isPending}
      onCopyInviteLink={onCopyInviteLink}
      onDismissCreatedAlert={onDismissCreatedAlert}
      onGenerateLink={handleGenerateLink}
      onRevokeInvite={() => void revokeMutation.mutateAsync()}
    />
  );
}
