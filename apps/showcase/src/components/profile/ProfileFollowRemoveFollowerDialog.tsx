import { type ProfileFollowListItem } from '@towelbooks/schemas';

import { Button, Dialog, DialogActions, DialogBody } from '../primitives';
import { useI18n } from '../../i18n';

export function ProfileFollowRemoveFollowerDialog({
  follower,
  isPending,
  onClose,
  onConfirm,
}: {
  follower: ProfileFollowListItem;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useI18n();
  const displayName = follower.displayName?.trim() || follower.username;

  return (
    <Dialog
      onClose={() => {
        if (!isPending) {
          onClose();
        }
      }}
      size="sm"
      title={t('profile.followDialog.removeFollower.confirm.title')}
    >
      <DialogBody>
        <p className="supporting-copy text-ink-3">
          {t('profile.followDialog.removeFollower.confirm.body', {
            values: { name: displayName },
          })}
        </p>
      </DialogBody>
      <DialogActions>
        <Button
          type="button"
          variant="tertiary"
          disabled={isPending}
          onClick={onClose}
        >
          {t('profile.followDialog.removeFollower.confirm.cancel')}
        </Button>
        <Button
          type="button"
          variant="danger"
          isLoading={isPending}
          loadingLabel={t('profile.followDialog.removeFollower.loading')}
          onClick={onConfirm}
        >
          {t('profile.followDialog.removeFollower.confirm.action')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
