import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
} from '../../components/primitives';
import { useI18n } from '../../i18n';

type CollectionRemoveDialogProps = {
  collectionName: string;
  errorMessage?: string | null;
  getReturnFocusElement?: () => HTMLElement | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function CollectionRemoveDialog({
  collectionName,
  errorMessage,
  getReturnFocusElement,
  isPending,
  onClose,
  onConfirm,
}: CollectionRemoveDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog
      closeButtonDisabled={isPending}
      closeOnBackdrop={!isPending}
      closeOnEscape={!isPending}
      getReturnFocusElement={getReturnFocusElement}
      onClose={onClose}
      showCloseButton
      size="sm"
      title={t('collections.detail.deleteTitle')}
      closeButtonLabel={t('common.close')}
    >
      {({ close }) => (
        <>
          <DialogBody>
            {errorMessage ? (
              <p className="app-text-supporting-copy text-brick" role="alert">
                {errorMessage}
              </p>
            ) : null}
            <p className="app-text-body m-0 text-ink-2">
              {t('collections.detail.deleteBody')}
            </p>
            <p className="app-text-row-title m-0 text-ink">{collectionName}</p>
          </DialogBody>
          <DialogActions stackOnMobile>
            <Button
              disabled={isPending}
              onClick={() => close()}
              type="button"
              variant="ghost"
            >
              {t('common.cancel')}
            </Button>
            <Button
              disabled={isPending}
              isLoading={isPending}
              loadingLabel={t('collections.detail.deleteSaving')}
              onClick={onConfirm}
              type="button"
              variant="danger"
            >
              {t('collections.detail.deleteConfirm')}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
