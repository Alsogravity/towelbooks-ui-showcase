import type { LibraryItemOwnership } from '@towelbooks/schemas';

import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
} from '../../../components/primitives';
import { useI18n } from '../../../i18n';

import { getOwnershipSummaryLabel } from './OwnershipDialog';

export function OwnershipDeleteDialog({
  getReturnFocusElement,
  isDeleting,
  onClose,
  onConfirm,
  ownership,
}: {
  getReturnFocusElement?: () => HTMLElement | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  ownership: LibraryItemOwnership;
}) {
  const { t } = useI18n();

  return (
    <Dialog
      getReturnFocusElement={getReturnFocusElement}
      onClose={() => {
        if (!isDeleting) {
          onClose();
        }
      }}
      size="sm"
      title={t('myLibrary.items.ownership.deleteAria', {
        values: { format: getOwnershipSummaryLabel(t, ownership) },
      })}
    >
      {({ close }) => (
        <>
          <DialogBody>
            <p className="text-sm leading-6 text-ink-2">
              {t('myLibrary.items.ownership.deletePrompt')}
            </p>
          </DialogBody>
          <DialogActions>
            <Button
              disabled={isDeleting}
              size="sm"
              variant="secondary"
              onClick={() => close()}
            >
              {t('myLibrary.items.ownership.deleteCancel')}
            </Button>
            <Button
              isLoading={isDeleting}
              loadingLabel={t('myLibrary.items.ownership.deleting')}
              size="sm"
              variant="danger"
              onClick={onConfirm}
            >
              {t('myLibrary.items.ownership.deleteConfirm')}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
