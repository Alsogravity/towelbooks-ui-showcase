import { useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
} from '../../../../components/primitives';
import { useI18n } from '../../../../i18n';

interface LibraryItemDetailFooterProps {
  isRemoving: boolean;
  onRemove: () => void;
}

export function LibraryItemDetailFooter({
  isRemoving,
  onRemove,
}: LibraryItemDetailFooterProps) {
  const { t } = useI18n();
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const closeRemoveDialog = () => {
    if (!isRemoving) {
      setIsRemoveDialogOpen(false);
    }
  };

  return (
    <div className="mt-16 flex items-center justify-end border-t border-rule/20 pt-8">
      <Button
        type="button"
        variant="danger"
        onClick={() => setIsRemoveDialogOpen(true)}
      >
        {t('myLibrary.items.remove')}
      </Button>

      {isRemoveDialogOpen ? (
        <Dialog
          size="sm"
          title={t('myLibrary.items.remove.confirm')}
          onClose={closeRemoveDialog}
        >
          {({ close }) => (
            <>
              <DialogBody>
                <p className="app-text-body-sm text-ink-2">
                  {t('myLibrary.items.remove.description')}
                </p>
              </DialogBody>
              <DialogActions>
                <Button
                  type="button"
                  variant="tertiary"
                  disabled={isRemoving}
                  onClick={() => close()}
                >
                  {t('myLibrary.items.remove.cancel')}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  isLoading={isRemoving}
                  loadingLabel={t('myLibrary.items.remove.loading')}
                  onClick={onRemove}
                >
                  {t('catalog.workDetail.libraryDialog.removeConfirm')}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      ) : null}
    </div>
  );
}
