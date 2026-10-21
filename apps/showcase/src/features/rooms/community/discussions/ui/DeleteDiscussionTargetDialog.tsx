import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
} from '../../../../../components/primitives';
import { useI18n } from '../../../../../i18n';

type DeleteDiscussionTargetDialogProps = {
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteDiscussionTargetDialog({
  isPending,
  onClose,
  onConfirm,
}: DeleteDiscussionTargetDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog
      title={t('rooms.detail.discussions.deleteDialog.title')}
      onClose={onClose}
      size="sm"
    >
      {({ close }) => (
        <>
          <DialogBody>
            <p className="text-sm leading-6 text-ink-3">
              {t('rooms.detail.discussions.deleteDialog.discussionBody')}
            </p>
          </DialogBody>
          <DialogActions>
            <Button variant="ghost" onClick={() => close()}>
              {t('common.cancel')}
            </Button>
            <Button
              isLoading={isPending}
              loadingLabel={t('rooms.detail.discussions.deleting')}
              onClick={onConfirm}
            >
              {t('rooms.detail.discussions.deleteDialog.confirm')}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
