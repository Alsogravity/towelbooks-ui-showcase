import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
} from '../../components/primitives';
import type { MessageKey } from '../../i18n';
import { useI18n } from '../../i18n';

import {
  DEFAULT_DISCARD_CHANGES_COPY,
  type DiscardChangesCopyKeys,
} from './discardChangesCopy';

export type DiscardChangesDialogProps = {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  /**
   * Optional i18n key overrides. Defaults to the shared
   * `common.unsavedChanges.*` catalog entries.
   */
  copy?: Partial<DiscardChangesCopyKeys>;
};

/**
 * Confirm dialog for leaving a dirty form. Pair with
 * {@link useUnsavedChangesGuard} for route/back/tab-close protection.
 *
 * Confirm must not go through Dialog `close(afterClose)` with `onClose=onCancel`,
 * or dismiss (reset blocker) would run before confirm (proceed) and throw
 * `Invalid blocker state transition: unblocked -> proceeding`.
 */
export function DiscardChangesDialog({
  isOpen,
  onCancel,
  onConfirm,
  copy,
}: DiscardChangesDialogProps) {
  const { t } = useI18n();
  const keys: DiscardChangesCopyKeys = {
    ...DEFAULT_DISCARD_CHANGES_COPY,
    ...copy,
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog title={t(keys.title as MessageKey)} size="sm" onClose={onCancel}>
      {({ close }) => (
        <>
          <DialogBody>
            <p className="text-sm leading-6 text-ink-2">
              {t(keys.body as MessageKey)}
            </p>
          </DialogBody>
          <DialogActions>
            <Button type="button" variant="text" onClick={() => close()}>
              {t(keys.cancel as MessageKey)}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                // Call confirm directly — parent closes the dialog by flipping
                // isOpen / proceeding the router blocker. Do not use close(onConfirm).
                onConfirm();
              }}
            >
              {t(keys.confirm as MessageKey)}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
