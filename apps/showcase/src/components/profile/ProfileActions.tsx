import { useI18n } from '../../i18n';
import { Button, ButtonLink } from '../primitives';
import { type ProfileFollowActionState } from './profileFollowActionState';

export interface ProfileActionsProps {
  actionState: ProfileFollowActionState;
  className?: string;
  isPending?: boolean;
  libraryTo?: string;
  onEdit?: () => void;
  onFollowToggle?: () => void;
}

function getFollowActionLabelKey(
  actionState: ProfileFollowActionState,
): string {
  switch (actionState) {
    case 'follow_back':
      return 'profile.action.followBack';
    case 'request_follow':
      return 'profile.action.requestFollow';
    case 'requested':
      return 'profile.action.requested';
    case 'following':
      return 'profile.action.following';
    case 'follow':
    default:
      return 'profile.action.follow';
  }
}

function getFollowLoadingKey(actionState: ProfileFollowActionState): string {
  if (actionState === 'following') {
    return 'profile.action.unfollow.loading';
  }

  if (actionState === 'requested') {
    return 'profile.action.cancelRequest.loading';
  }

  return 'profile.action.follow.loading';
}

function isSecondaryFollowAction(
  actionState: ProfileFollowActionState,
): boolean {
  return actionState === 'following' || actionState === 'requested';
}

export function ProfileActions({
  actionState,
  className,
  isPending = false,
  libraryTo,
  onEdit,
  onFollowToggle,
}: ProfileActionsProps) {
  const { t } = useI18n();
  const isFullWidth = Boolean(className?.includes('w-full'));
  const buttonClassName = isFullWidth ? 'w-full' : '';
  const pillButtonClassName = ['profile-actions__pill-button', buttonClassName]
    .filter(Boolean)
    .join(' ');
  const rootClassName = ['flex w-full items-center gap-4 lg:gap-2', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClassName}>
      {libraryTo ? (
        <ButtonLink
          variant="secondary"
          size="sm"
          to={libraryTo}
          className={pillButtonClassName}
        >
          {t('profile.stats.libraryBooks')}
        </ButtonLink>
      ) : null}
      {actionState === 'edit' ? (
        <Button
          variant="secondary"
          size="sm"
          className={['profile-actions__edit-button', pillButtonClassName]
            .filter(Boolean)
            .join(' ')}
          onClick={onEdit}
        >
          {t('profile.action.edit')}
        </Button>
      ) : (
        <Button
          variant={
            isSecondaryFollowAction(actionState) ? 'secondary' : 'primary'
          }
          size="sm"
          className={pillButtonClassName}
          isLoading={isPending}
          loadingLabel={t(getFollowLoadingKey(actionState))}
          onClick={onFollowToggle}
        >
          {t(getFollowActionLabelKey(actionState))}
        </Button>
      )}
    </div>
  );
}
