import type { CollectionItem, PublicCollectionItem } from '@towelbooks/schemas';

import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
} from '../../components/primitives';
import { useI18n } from '../../i18n';

type CollectionItemRemoveDialogProps = {
  errorMessage?: string | null;
  getReturnFocusElement?: () => HTMLElement | null;
  isPending: boolean;
  item: CollectionItem | PublicCollectionItem;
  onClose: () => void;
  onConfirm: () => void;
};

export function CollectionItemRemoveDialog({
  errorMessage,
  getReturnFocusElement,
  isPending,
  item,
  onClose,
  onConfirm,
}: CollectionItemRemoveDialogProps) {
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
      title={t('collections.detail.removeTitle')}
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
              {t('collections.detail.removeBody')}
            </p>
            <p className="app-text-row-title m-0 text-ink">
              {item.work.display.title}
            </p>
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
              loadingLabel={t('collections.form.saving')}
              onClick={onConfirm}
              type="button"
              variant="primary"
            >
              {t('collections.detail.removeConfirm')}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
