import { Button, Dialog, DialogActions, DialogBody } from '../primitives';
import { useI18n } from '../../i18n';

export function ProfileUnfollowConfirmDialog({
  displayName,
  isPending,
  onClose,
  onConfirm,
}: {
  displayName: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useI18n();

  return (
    <Dialog
      onClose={() => {
        if (!isPending) {
          onClose();
        }
      }}
      size="sm"
      title={t('profile.action.unfollow.confirm.title')}
    >
      <DialogBody>
        <p className="supporting-copy text-ink-3">
          {t('profile.action.unfollow.confirm.body', {
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
          {t('profile.action.unfollow.confirm.cancel')}
        </Button>
        <Button
          type="button"
          variant="danger"
          isLoading={isPending}
          loadingLabel={t('profile.action.unfollow.loading')}
          onClick={onConfirm}
        >
          {t('profile.action.unfollow.confirm.action')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
