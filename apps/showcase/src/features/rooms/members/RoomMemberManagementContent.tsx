import { useState } from 'react';

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../../components/feedback';
import {
  AppActionRow,
  AppContentRow,
  AppSubsection,
} from '../../../components/application';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  FormSelectField,
} from '../../../components/primitives';
import { UserAvatar } from '../../../entities/user/ui';
import { useI18n } from '../../../i18n';
import { Link } from 'react-router';

import { RoomMemberDangerZone } from './RoomMemberDangerZone';
import { RoomMemberParticipationSection } from './RoomMemberParticipationSection';
import { getRoomMemberRoleLabelKey } from './roomMembersDisplay';
import { useRoomMemberManagementActions } from './useRoomMemberManagementActions';

import type { RoomMember, RoomMemberManagementDetail } from '../types';

type PendingDialog =
  'ownership' | 'remove' | 'role' | 'suspend' | 'unsuspend' | null;

type RoomMemberManagementContentProps = {
  detail: RoomMemberManagementDetail | undefined;
  error: unknown;
  initialAction: 'manage' | 'remove';
  isLoading: boolean;
  member: RoomMember;
  onClose: () => void;
  onOwnershipTransferred?: () => void;
  onRetry: () => void;
  onViewAccess?: () => void;
  onViewManagementHistory?: () => void;
  roomId: string;
};

export function RoomMemberManagementContent({
  detail,
  error,
  initialAction,
  isLoading,
  member,
  onClose,
  onOwnershipTransferred,
  onRetry,
  onViewAccess,
  onViewManagementHistory,
  roomId,
}: RoomMemberManagementContentProps) {
  const { t } = useI18n();
  const [pendingRole, setPendingRole] = useState<RoomMember['role'] | null>(
    null,
  );
  const [pendingDialog, setPendingDialog] = useState<PendingDialog>(
    initialAction === 'remove' ? 'remove' : null,
  );
  const actions = useRoomMemberManagementActions({
    memberId: member.id,
    onMemberRemoved: onClose,
    onOwnershipTransferred,
    roomId,
  });

  if (isLoading) {
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

  if (error) {
    return (
      <ErrorState
        title={{ key: 'rooms.members.overlay.error.title' }}
        body={{ key: 'rooms.members.overlay.error.body' }}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="secondary" onClick={() => void onRetry()}>
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

  const displayName =
    detail.member.displayName ??
    detail.member.username ??
    t('shell.userFallback');
  const assignableRoles = detail.availableActions.assignableRoles;
  const canEditRole =
    detail.availableActions.canChangeRole && assignableRoles.length > 0;
  const showActionsSection =
    onViewAccess != null || detail.availableActions.canTransferOwnership;

  return (
    <>
      <div className="flex flex-col gap-6">
        {actions.error ? <Alert variant="error">{actions.error}</Alert> : null}

        <AppSubsection>
          <AppContentRow
            className="border-b border-rule"
            action={
              detail.member.username ? (
                <Link
                  aria-label={t(
                    'notifications.followRequests.profileLinkLabel',
                    {
                      values: { username: detail.member.username },
                    },
                  )}
                  className="group inline-flex items-center gap-1.5 rounded px-1 py-0.5 text-brick transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brick"
                  to={`/${detail.member.username}`}
                >
                  <span className="text-app-label font-medium">
                    {t('rooms.members.management.identity.viewProfile')}
                  </span>
                </Link>
              ) : null
            }
            leading={
              <UserAvatar
                avatar={detail.member.avatar}
                decorative
                displayName={displayName}
                size="lg"
              />
            }
            meta={
              detail.member.username ? `@${detail.member.username}` : undefined
            }
            mobileLayout="inline"
            title={displayName}
          />

          <RoomMemberParticipationSection
            canEditRole={canEditRole}
            detail={detail}
            onViewManagementHistory={onViewManagementHistory}
            openRoleChangeDialog={() => {
              actions.clearError();
              setPendingRole(detail.participation.role);
              setPendingDialog('role');
            }}
          />
        </AppSubsection>

        {showActionsSection ? (
          <AppSubsection title={t('rooms.members.management.actions.title')}>
            <div className="divide-y divide-rule">
              {onViewAccess ? (
                <AppActionRow
                  label={t('rooms.members.management.actions.manageAccess')}
                  onClick={onViewAccess}
                />
              ) : null}
              {detail.availableActions.canTransferOwnership ? (
                <AppActionRow
                  label={t(
                    'rooms.members.management.actions.transferOwnership',
                  )}
                  onClick={() => {
                    actions.clearError();
                    setPendingDialog('ownership');
                  }}
                />
              ) : null}
            </div>
          </AppSubsection>
        ) : null}

        <RoomMemberDangerZone
          detail={detail}
          isRemovePending={actions.removeMemberMutation.isPending}
          isSuspendPending={actions.suspendMemberMutation.isPending}
          isUnsuspendPending={actions.unsuspendMemberMutation.isPending}
          openRemoveDialog={() => {
            actions.clearError();
            setPendingDialog('remove');
          }}
          openSuspendDialog={() => {
            actions.clearError();
            setPendingDialog('suspend');
          }}
          openUnsuspendDialog={() => {
            actions.clearError();
            setPendingDialog('unsuspend');
          }}
        />
      </div>

      {pendingDialog === 'role' && canEditRole ? (
        <Dialog
          onClose={() => {
            if (!actions.updateRoleMutation.isPending) {
              setPendingDialog(null);
              setPendingRole(null);
            }
          }}
          title={t('rooms.members.management.role.dialog.title')}
          size="sm"
        >
          <DialogBody className="gap-4">
            <p className="supporting-copy text-ink-3">
              {t('rooms.members.management.role.dialog.body', {
                values: { name: displayName },
              })}
            </p>
            {actions.error ? (
              <p role="alert" className="meta text-brick">
                {actions.error}
              </p>
            ) : null}
            <FormSelectField
              id="room-member-role-update-role"
              label={t('rooms.members.management.role.target')}
              value={pendingRole ?? detail.participation.role}
              onChange={(event) =>
                setPendingRole(event.currentTarget.value as RoomMember['role'])
              }
            >
              {assignableRoles.map((role) => (
                <option key={role} value={role}>
                  {t(getRoomMemberRoleLabelKey(role))}
                </option>
              ))}
            </FormSelectField>
          </DialogBody>
          <DialogActions>
            <Button
              type="button"
              variant="tertiary"
              disabled={actions.updateRoleMutation.isPending}
              onClick={() => {
                setPendingDialog(null);
                setPendingRole(null);
              }}
            >
              {t('rooms.members.management.role.dialog.cancel')}
            </Button>
            <Button
              type="button"
              variant="primary"
              isLoading={actions.updateRoleMutation.isPending}
              loadingLabel={t('rooms.members.management.role.dialog.updating')}
              disabled={
                actions.updateRoleMutation.isPending ||
                !pendingRole ||
                pendingRole === detail.participation.role
              }
              onClick={() => {
                if (!pendingRole) {
                  return;
                }

                actions.clearError();
                actions.updateRoleMutation.mutate(
                  { role: pendingRole },
                  {
                    onSuccess: () => {
                      setPendingDialog(null);
                      setPendingRole(null);
                    },
                  },
                );
              }}
            >
              {t('rooms.members.management.role.dialog.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}

      {pendingDialog === 'ownership' &&
      detail.availableActions.canTransferOwnership ? (
        <Dialog
          onClose={() => {
            if (!actions.transferOwnershipMutation.isPending) {
              setPendingDialog(null);
            }
          }}
          title={t('rooms.members.management.ownership.dialog.title')}
          size="sm"
        >
          <DialogBody className="gap-4">
            <p className="supporting-copy text-ink-3">
              {t('rooms.members.management.ownership.dialog.body', {
                values: { memberName: displayName },
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
              disabled={actions.transferOwnershipMutation.isPending}
              onClick={() => setPendingDialog(null)}
            >
              {t('rooms.members.management.ownership.dialog.cancel')}
            </Button>
            <Button
              type="button"
              variant="primary"
              isLoading={actions.transferOwnershipMutation.isPending}
              loadingLabel={t(
                'rooms.members.management.ownership.dialog.transferring',
              )}
              onClick={() => {
                actions.clearError();
                actions.transferOwnershipMutation.mutate(undefined, {
                  onSuccess: () => {
                    setPendingDialog(null);
                  },
                });
              }}
            >
              {t('rooms.members.management.ownership.dialog.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}

      {pendingDialog === 'suspend' && detail.availableActions.canSuspend ? (
        <Dialog
          onClose={() => {
            if (!actions.suspendMemberMutation.isPending) {
              setPendingDialog(null);
            }
          }}
          title={t('rooms.members.suspend.dialog.title')}
          size="sm"
        >
          <DialogBody className="gap-4">
            <p className="supporting-copy text-ink-3">
              {t('rooms.members.suspend.dialog.body', {
                values: { name: displayName },
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
              disabled={actions.suspendMemberMutation.isPending}
              onClick={() => setPendingDialog(null)}
            >
              {t('rooms.members.suspend.dialog.cancel')}
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={actions.suspendMemberMutation.isPending}
              loadingLabel={t('rooms.members.suspend.dialog.suspending')}
              onClick={() => {
                actions.clearError();
                actions.suspendMemberMutation.mutate();
              }}
            >
              {t('rooms.members.suspend.dialog.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}

      {pendingDialog === 'unsuspend' && detail.availableActions.canUnsuspend ? (
        <Dialog
          onClose={() => {
            if (!actions.unsuspendMemberMutation.isPending) {
              setPendingDialog(null);
            }
          }}
          title={t('rooms.members.unsuspend.dialog.title')}
          size="sm"
        >
          <DialogBody className="gap-4">
            <p className="supporting-copy text-ink-3">
              {t('rooms.members.unsuspend.dialog.body', {
                values: { name: displayName },
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
              disabled={actions.unsuspendMemberMutation.isPending}
              onClick={() => setPendingDialog(null)}
            >
              {t('rooms.members.unsuspend.dialog.cancel')}
            </Button>
            <Button
              type="button"
              variant="primary"
              isLoading={actions.unsuspendMemberMutation.isPending}
              loadingLabel={t('rooms.members.unsuspend.dialog.unsuspending')}
              onClick={() => {
                actions.clearError();
                actions.unsuspendMemberMutation.mutate();
              }}
            >
              {t('rooms.members.unsuspend.dialog.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}

      {pendingDialog === 'remove' && detail.availableActions.canRemove ? (
        <Dialog
          onClose={() => {
            if (!actions.removeMemberMutation.isPending) {
              setPendingDialog(null);
            }
          }}
          title={t('rooms.members.remove.dialog.title')}
          size="sm"
        >
          <DialogBody className="gap-4">
            <p className="supporting-copy text-ink-3">
              {t('rooms.members.remove.dialog.body', {
                values: { name: displayName },
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
              disabled={actions.removeMemberMutation.isPending}
              onClick={() => setPendingDialog(null)}
            >
              {t('rooms.members.remove.dialog.cancel')}
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={actions.removeMemberMutation.isPending}
              loadingLabel={t('rooms.members.remove.dialog.removing')}
              onClick={() => {
                actions.clearError();
                actions.removeMemberMutation.mutate();
              }}
            >
              {t('rooms.members.remove.dialog.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </>
  );
}
