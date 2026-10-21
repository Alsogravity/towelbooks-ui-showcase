import { type RoomJoinPolicy, type RoomOverview } from '@towelbooks/schemas';

import { useToast } from '../../../../components/feedback';
import { Alert, Button } from '../../../../components/primitives';
import { useAuthenticatedAction } from '../../../auth/useAuthenticatedAction';
import { useI18n } from '../../../../i18n';
import { useRoomJoinActions } from '../../join/useRoomJoinActions';

type RoomJoinActionsProps = {
  joinPolicy: RoomJoinPolicy;
  roomId: string;
  viewer: RoomOverview['viewer'];
};

export function RoomJoinActions({
  joinPolicy,
  roomId,
  viewer,
}: RoomJoinActionsProps) {
  const { t } = useI18n();
  const { pushToast } = useToast();
  const runAuthenticatedAction = useAuthenticatedAction();
  const {
    cancelRequestMutation,
    getErrorMessage,
    joinMutation,
    requestJoinMutation,
  } = useRoomJoinActions(roomId);

  const { entry } = viewer;
  const isPending =
    joinMutation.isPending ||
    requestJoinMutation.isPending ||
    cancelRequestMutation.isPending;

  const showErrorToast = (error: unknown) => {
    pushToast({
      title: getErrorMessage(error),
      variant: 'error',
    });
  };

  const toastPolicyRecovery = (result: { kind: string }) => {
    if (result.kind === 'needs_request') {
      pushToast({
        title: t('rooms.join.policyChanged.requestToJoin'),
        variant: 'info',
      });
      return;
    }

    if (result.kind === 'entry_closed') {
      pushToast({
        title: t('rooms.join.policyChanged.inviteOnly'),
        variant: 'info',
      });
    }
  };

  const handleJoin = () => {
    runAuthenticatedAction(() => {
      joinMutation.mutate(undefined, {
        onSuccess: toastPolicyRecovery,
        onError: showErrorToast,
      });
    });
  };

  const handleRequestJoin = () => {
    runAuthenticatedAction(() => {
      requestJoinMutation.mutate(undefined, {
        onSuccess: toastPolicyRecovery,
        onError: showErrorToast,
      });
    });
  };

  const handleCancelRequest = () => {
    runAuthenticatedAction(() => {
      cancelRequestMutation.mutate(undefined, {
        onError: showErrorToast,
      });
    });
  };

  if (entry.blockedReason === 'suspended') {
    return (
      <Alert variant="info">
        <p>{t('rooms.join.suspendedNotice')}</p>
      </Alert>
    );
  }

  if (entry.blockedReason === 'removed') {
    return (
      <Alert variant="info">
        <p>{t('rooms.join.blockedNotice')}</p>
      </Alert>
    );
  }

  if (viewer.membershipStatus === 'active') {
    return null;
  }

  if (entry.canJoinDirectly) {
    return (
      <Button
        disabled={isPending}
        isLoading={joinMutation.isPending}
        loadingLabel={t('rooms.join.action.joining')}
        onClick={handleJoin}
        size="sm"
        type="button"
      >
        {t('rooms.join.action.join')}
      </Button>
    );
  }

  if (entry.canRequestJoin) {
    return (
      <Button
        disabled={isPending}
        isLoading={requestJoinMutation.isPending}
        loadingLabel={t('rooms.join.action.requesting')}
        onClick={handleRequestJoin}
        size="sm"
        type="button"
      >
        {t('rooms.join.action.request')}
      </Button>
    );
  }

  if (entry.hasPendingJoinRequest) {
    return (
      <Button
        disabled={isPending}
        isLoading={cancelRequestMutation.isPending}
        loadingLabel={t('rooms.join.action.cancelling')}
        onClick={handleCancelRequest}
        size="sm"
        type="button"
        variant="secondary"
      >
        {t('rooms.join.action.cancelRequest')}
      </Button>
    );
  }

  if (joinPolicy === 'invite_only') {
    return (
      <Alert variant="info">
        <p>{t('rooms.join.inviteOnlyNotice')}</p>
      </Alert>
    );
  }

  return null;
}
