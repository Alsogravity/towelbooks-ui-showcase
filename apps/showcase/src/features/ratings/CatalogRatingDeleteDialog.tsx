import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
} from '../../components/primitives';
import { useI18n } from '../../i18n';

export function CatalogRatingDeleteDialog({
  isDeletingRating,
  isOpen,
  onClose,
  onConfirm,
}: {
  isDeletingRating: boolean;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useI18n();

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog
      title={t('catalog.workDetail.ratings.deleteDialog.title')}
      onClose={onClose}
    >
      {({ close }) => (
        <>
          <DialogBody>
            <p className="text-sm leading-6 text-ink-2">
              {t('catalog.workDetail.ratings.deleteDialog.body')}
            </p>
          </DialogBody>
          <DialogActions>
            <Button size="sm" variant="secondary" onClick={() => close()}>
              {t('catalog.workDetail.ratings.deleteDialog.cancel')}
            </Button>
            <Button
              isLoading={isDeletingRating}
              loadingLabel={t('catalog.workDetail.ratings.form.deleting')}
              size="sm"
              variant="danger"
              onClick={onConfirm}
            >
              {t('catalog.workDetail.ratings.deleteDialog.confirm')}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
