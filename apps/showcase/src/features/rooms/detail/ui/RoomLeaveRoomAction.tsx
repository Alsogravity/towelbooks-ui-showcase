import { ApiRequestError, getApiErrorCode } from '@towelbooks/sdk';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
} from '../../../../components/primitives';
import { useI18n } from '../../../../i18n';
import { sdk } from '../../../../lib/sdk';
import { reconcileRoomAccessAfterForbidden } from '../reconcileRoomAccess';

import type { RoomMember } from '../../types';

export const roomLeaveIconButtonClassName =
  'shrink-0 transition-colors !text-brick hover:!text-brick-2 active:!text-brick';

type RoomLeaveRoomActionProps = {
  getReturnFocusElement?: () => HTMLElement | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  roomId: string;
  roomName: string;
  roomVisibility: 'private' | 'public';
  showTrigger?: boolean;
  viewerRole: RoomMember['role'] | null | undefined;
};

export function RoomLeaveRoomAction({
  getReturnFocusElement,
  isOpen: controlledIsOpen,
  onOpenChange,
  roomId,
  roomName,
  roomVisibility,
  showTrigger = true,
  viewerRole,
}: RoomLeaveRoomActionProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const isControlled = controlledIsOpen !== undefined;
  const isLeaveDialogOpen = isControlled
    ? controlledIsOpen
    : uncontrolledIsOpen;

  const setLeaveDialogOpen = (open: boolean) => {
    if (isControlled) {
      onOpenChange?.(open);
      return;
    }

    setUncontrolledIsOpen(open);
  };

  const leaveMutation = useMutation({
    mutationFn: () => sdk.rooms.leave(roomId),
    meta: { roomId },
    onSuccess: async () => {
      setLeaveError(null);
      setLeaveDialogOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['rooms'] }),
        queryClient.invalidateQueries({ queryKey: ['rooms', roomId] }),
        queryClient.invalidateQueries({
          queryKey: ['rooms', roomId, 'overview'],
        }),
      ]);

      if (roomVisibility === 'private') {
        navigate('/rooms', { replace: true });
      }
    },
    onError: (error: unknown) => {
      if (getApiErrorCode(error) === 'ROOM_FORBIDDEN') {
        setLeaveError(null);
        setLeaveDialogOpen(false);
        void reconcileRoomAccessAfterForbidden(queryClient, roomId);
        if (roomVisibility === 'private') {
          navigate('/rooms', { replace: true });
        }
        return;
      }

      const message =
        error instanceof ApiRequestError &&
        error.problem.code === 'ROOM_NEEDS_OWNER'
          ? t('rooms.members.leave.error.lastOwner')
          : t('rooms.members.leave.error.generic');
      setLeaveError(message);
    },
  });

  if (!viewerRole) {
    return null;
  }

  const openLeaveDialog = () => {
    setLeaveError(null);
    setLeaveDialogOpen(true);
  };

  return (
    <>
      {showTrigger ? (
        <Button
          aria-label={t('rooms.members.leave.action')}
          className={roomLeaveIconButtonClassName}
          icon="log-out"
          size="sm"
          title={t('rooms.members.leave.action')}
          type="button"
          variant="icon"
          onClick={openLeaveDialog}
        />
      ) : null}

      {isLeaveDialogOpen ? (
        <Dialog
          getReturnFocusElement={getReturnFocusElement}
          onClose={() => {
            if (!leaveMutation.isPending) {
              setLeaveDialogOpen(false);
              setLeaveError(null);
            }
          }}
          title={t('rooms.members.leave.dialog.title')}
          size="sm"
        >
          <DialogBody>
            <p className="supporting-copy text-ink-3">
              {t('rooms.members.leave.dialog.body', {
                values: { roomName },
              })}
            </p>
            {viewerRole === 'owner' ? (
              <p className="meta text-ink-3">
                {t('rooms.members.leave.dialog.ownerNote')}
              </p>
            ) : null}
            {leaveError ? (
              <p role="alert" className="meta text-brick">
                {leaveError}
              </p>
            ) : null}
          </DialogBody>
          <DialogActions>
            <Button
              type="button"
              variant="tertiary"
              disabled={leaveMutation.isPending}
              onClick={() => {
                setLeaveDialogOpen(false);
                setLeaveError(null);
              }}
            >
              {t('rooms.members.leave.dialog.cancel')}
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={leaveMutation.isPending}
              loadingLabel={t('rooms.members.leave.dialog.leaving')}
              onClick={() => leaveMutation.mutate()}
            >
              {t('rooms.members.leave.dialog.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </>
  );
}
