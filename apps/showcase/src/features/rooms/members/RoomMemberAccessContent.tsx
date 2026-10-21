import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../../components/feedback';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
} from '../../../components/primitives';
import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';

import { ManualAccessExpirationDialog } from './ManualAccessExpirationDialog';
import { RoomMemberAccessSection } from './RoomMemberAccessSection';
import { useRoomMemberManagementActions } from './useRoomMemberManagementActions';

import type { RoomMember } from '../types';
import type { DialogAction } from './ManualAccessExpirationDialog';

type RoomMemberAccessContentProps = {
  member: RoomMember;
  onClose: () => void;
  roomId: string;
};

export function RoomMemberAccessContent({
  member,
  onClose,
  roomId,
}: RoomMemberAccessContentProps) {
  const { t } = useI18n();
  const [pendingDialog, setPendingDialog] = useState<
    'expiration' | 'revoke' | 'revokeInvite' | 'restoreInvite' | null
  >(null);
  const [pendingExpirationAction, setPendingExpirationAction] =
    useState<DialogAction | null>(null);

  const detailsQuery = useQuery({
    queryKey: ['rooms', roomId, 'members', member.id, 'management'],
    queryFn: () => sdk.rooms.getMemberManagementDetail(roomId, member.id),
  });

  const actions = useRoomMemberManagementActions({
    memberId: member.id,
    onMemberRemoved: onClose,
    roomId,
  });

  if (detailsQuery.isLoading) {
    return (
      <LoadingState
        label={{
          key: 'rooms.members.overlay.loading',
          fallback: 'Loading member management...',
        }}
        className="p-4"
      />
    );
  }

  if (detailsQuery.error) {
    return (
      <ErrorState
        title={{ key: 'rooms.members.overlay.error.title' }}
        body={{ key: 'rooms.members.overlay.error.body' }}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant="secondary"
              onClick={() => void detailsQuery.refetch()}
            >
              {t('errors.action.retry')}
            </Button>
            <Button variant="tertiary" onClick={onClose}>
              {t('common.close')}
            </Button>
          </div>
        }
      />
    );
  }

  const detail = detailsQuery.data;

  if (!detail) {
    return (
      <EmptyState
        title={{ key: 'rooms.members.overlay.empty.title' }}
        body={{ key: 'rooms.members.overlay.empty.body' }}
        action={
          <Button variant="tertiary" onClick={onClose}>
            {t('common.close')}
          </Button>
        }
      />
    );
  }

  function handleExpirationSubmit(input: { expiresAt: string | null }) {
    actions.clearError();

    if (pendingExpirationAction === 'restore') {
      actions.restoreManualAccessMutation.mutate(input);
    } else {
      actions.setManualAccessMutation.mutate(input);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {actions.error ? (
          <p role="alert" className="meta text-brick">
            {actions.error}
          </p>
        ) : null}

        <RoomMemberAccessSection
          key={`${detail.member.id}-${detail.manualAccess.state}-${detail.manualAccess.expiresAt ?? 'none'}-${detail.manualAccess.revokedAt ?? 'none'}`}
          detail={detail}
          isSubmittingRevoke={actions.revokeManualAccessMutation.isPending}
          isSubmittingRevokeInvite={
            actions.revokeInviteAccessMutation.isPending
          }
          isSubmittingRestoreInvite={
            actions.restoreInviteAccessMutation.isPending
          }
          onRevoke={() => {
            actions.clearError();
            setPendingDialog('revoke');
          }}
          onRevokeInvite={() => {
            actions.clearError();
            setPendingDialog('revokeInvite');
          }}
          onRestoreInvite={() => {
            actions.clearError();
            setPendingDialog('restoreInvite');
          }}
          onSetAccess={() => {
            actions.clearError();
            setPendingExpirationAction('set');
            setPendingDialog('expiration');
          }}
          onRestoreAccess={() => {
            actions.clearError();
            setPendingExpirationAction('restore');
            setPendingDialog('expiration');
          }}
          onUpdateExpiration={() => {
            actions.clearError();
            setPendingExpirationAction('update');
            setPendingDialog('expiration');
          }}
        />
      </div>

      {pendingDialog === 'expiration' && pendingExpirationAction ? (
        <ManualAccessExpirationDialog
          action={pendingExpirationAction}
          currentExpiresAt={detail.manualAccess.expiresAt}
          error={actions.error}
          isSubmitting={
            actions.setManualAccessMutation.isPending ||
            actions.restoreManualAccessMutation.isPending
          }
          onClose={() => {
            if (
              !actions.setManualAccessMutation.isPending &&
              !actions.restoreManualAccessMutation.isPending
            ) {
              setPendingDialog(null);
              setPendingExpirationAction(null);
            }
          }}
          onSubmit={handleExpirationSubmit}
        />
      ) : null}

      {pendingDialog === 'revoke' &&
      detail.availableActions.canRevokeManualAccess ? (
        <Dialog
          onClose={() => {
            if (!actions.revokeManualAccessMutation.isPending) {
              setPendingDialog(null);
            }
          }}
          title={t('rooms.members.access.revokeDialog.title')}
          size="sm"
        >
          <DialogBody className="gap-4">
            <p className="supporting-copy text-ink-3">
              {t('rooms.members.access.revokeDialog.body', {
                values: {
                  name:
                    detail.member.displayName ??
                    detail.member.username ??
                    t('shell.userFallback'),
                },
              })}
            </p>
            {actions.error ? (
              <p role="alert" className="meta text-brick">
                {actions.error}
              </p>
            ) : null}
          </DialogBody>
          <DialogActions>
            <Button
              type="button"
              variant="tertiary"
              disabled={actions.revokeManualAccessMutation.isPending}
              onClick={() => setPendingDialog(null)}
            >
              {t('rooms.members.access.revokeDialog.cancel')}
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={actions.revokeManualAccessMutation.isPending}
              loadingLabel={t('rooms.members.access.revokeDialog.revoking')}
              onClick={() => {
                actions.clearError();
                actions.revokeManualAccessMutation.mutate();
              }}
            >
              {t('rooms.members.access.revokeDialog.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}

      {pendingDialog === 'revokeInvite' &&
      detail.availableActions.canRevokeInviteAccess ? (
        <Dialog
          onClose={() => {
            if (!actions.revokeInviteAccessMutation.isPending) {
              setPendingDialog(null);
            }
          }}
          title={t('rooms.members.access.invite.revokeDialog.title')}
          size="sm"
        >
          <DialogBody className="gap-4">
            <p className="supporting-copy text-ink-3">
              {t('rooms.members.access.invite.revokeDialog.body')}
            </p>
            {actions.error ? (
              <p role="alert" className="meta text-brick">
                {actions.error}
              </p>
            ) : null}
          </DialogBody>
          <DialogActions>
            <Button
              type="button"
              variant="tertiary"
              disabled={actions.revokeInviteAccessMutation.isPending}
              onClick={() => setPendingDialog(null)}
            >
              {t('rooms.members.access.invite.revokeDialog.cancel')}
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={actions.revokeInviteAccessMutation.isPending}
              loadingLabel={t(
                'rooms.members.access.invite.revokeDialog.revoking',
              )}
              onClick={() => {
                actions.clearError();
                actions.revokeInviteAccessMutation.mutate();
              }}
            >
              {t('rooms.members.access.invite.revokeDialog.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}

      {pendingDialog === 'restoreInvite' &&
      detail.availableActions.canRestoreInviteAccess ? (
        <Dialog
          onClose={() => {
            if (!actions.restoreInviteAccessMutation.isPending) {
              setPendingDialog(null);
            }
          }}
          title={t('rooms.members.access.invite.restoreDialog.title')}
          size="sm"
        >
          <DialogBody className="gap-4">
            <p className="supporting-copy text-ink-3">
              {t('rooms.members.access.invite.restoreDialog.body')}
            </p>
            {actions.error ? (
              <p role="alert" className="meta text-brick">
                {actions.error}
              </p>
            ) : null}
          </DialogBody>
          <DialogActions>
            <Button
              type="button"
              variant="tertiary"
              disabled={actions.restoreInviteAccessMutation.isPending}
              onClick={() => setPendingDialog(null)}
            >
              {t('rooms.members.access.invite.restoreDialog.cancel')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              isLoading={actions.restoreInviteAccessMutation.isPending}
              loadingLabel={t(
                'rooms.members.access.invite.restoreDialog.restoring',
              )}
              onClick={() => {
                actions.clearError();
                actions.restoreInviteAccessMutation.mutate();
              }}
            >
              {t('rooms.members.access.invite.restoreDialog.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </>
  );
}
