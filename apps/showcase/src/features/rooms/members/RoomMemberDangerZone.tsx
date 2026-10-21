import { AppActionGroup, AppSubsection } from '../../../components/application';
import { Button } from '../../../components/primitives';
import { useI18n } from '../../../i18n';

import type { RoomMemberManagementDetail } from '../types';

type RoomMemberDangerZoneProps = {
  detail: RoomMemberManagementDetail;
  isRemovePending: boolean;
  isSuspendPending: boolean;
  isUnsuspendPending: boolean;
  openRemoveDialog: () => void;
  openSuspendDialog: () => void;
  openUnsuspendDialog: () => void;
};

export function RoomMemberDangerZone({
  detail,
  isRemovePending,
  isSuspendPending,
  isUnsuspendPending,
  openRemoveDialog,
  openSuspendDialog,
  openUnsuspendDialog,
}: RoomMemberDangerZoneProps) {
  const { t } = useI18n();
  const hasActions =
    detail.availableActions.canSuspend ||
    detail.availableActions.canUnsuspend ||
    detail.availableActions.canRemove;

  return (
    <AppSubsection
      description={t('rooms.members.management.danger.description')}
      title={t('rooms.members.management.danger.title')}
    >
      {hasActions ? (
        <AppActionGroup>
          {detail.availableActions.canSuspend ? (
            <Button
              type="button"
              variant="danger"
              disabled={isSuspendPending}
              onClick={openSuspendDialog}
            >
              {t('rooms.members.management.danger.suspend')}
            </Button>
          ) : null}

          {detail.availableActions.canUnsuspend ? (
            <Button
              type="button"
              variant="secondary"
              disabled={isUnsuspendPending}
              onClick={openUnsuspendDialog}
            >
              {t('rooms.members.management.danger.unsuspend')}
            </Button>
          ) : null}

          {detail.availableActions.canRemove ? (
            <Button
              type="button"
              variant="danger"
              disabled={isRemovePending}
              onClick={openRemoveDialog}
            >
              {t('rooms.members.remove.actions.remove')}
            </Button>
          ) : null}
        </AppActionGroup>
      ) : (
        <p className="meta text-ink-3">
          {detail.member.role === 'owner'
            ? t('rooms.members.management.danger.ownerNote')
            : t('rooms.members.management.danger.unavailable')}
        </p>
      )}
    </AppSubsection>
  );
}
