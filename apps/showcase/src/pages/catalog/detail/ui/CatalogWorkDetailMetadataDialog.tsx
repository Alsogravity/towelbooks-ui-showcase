import { CatalogWorkDetailScalarField } from './CatalogWorkDetailSection';
import {
  ButtonLink,
  Dialog,
  DialogActions,
  DialogBody,
} from '../../../../components/primitives';

import type { CatalogWorkDetailField } from './catalogWorkDetailHelpers';

export function CatalogWorkDetailMetadataDialog({
  isOpen,
  metadataItems,
  onClose,
  title,
  closeButtonLabel,
  editButtonLabel,
  editHref,
  showEditAction,
}: {
  closeButtonLabel: string;
  editButtonLabel: string;
  editHref: string;
  isOpen: boolean;
  metadataItems: CatalogWorkDetailField[];
  onClose: () => void;
  showEditAction: boolean;
  title: string;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog
      title={title}
      showCloseButton
      closeButtonLabel={closeButtonLabel}
      onClose={onClose}
    >
      <DialogBody>
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {metadataItems.map((entry) => (
            <CatalogWorkDetailScalarField
              key={entry.label}
              label={entry.label}
              value={entry.value}
            />
          ))}
        </dl>
      </DialogBody>
      {showEditAction ? (
        <DialogActions>
          <ButtonLink prependIcon="pencil-line" to={editHref}>
            {editButtonLabel}
          </ButtonLink>
        </DialogActions>
      ) : null}
    </Dialog>
  );
}
