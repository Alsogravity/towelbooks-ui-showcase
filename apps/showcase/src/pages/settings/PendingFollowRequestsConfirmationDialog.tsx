import { useId } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
} from '../../components/primitives';
import { useI18n } from '../../i18n';

export function PendingFollowRequestsConfirmationDialog({
  count,
  isConfirming,
  isOpen,
  onCancel,
  onConfirm,
}: {
  count: number;
  isConfirming: boolean;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = useI18n();
  const descriptionId = useId();

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog
      aria-describedby={descriptionId}
      closeButtonDisabled={isConfirming}
      closeButtonLabel={t('common.close')}
      onClose={() => {
        if (!isConfirming) {
          onCancel();
        }
      }}
      showCloseButton
      size="sm"
      title={t('settings.privacy.profileVisibility.pendingRequests.title')}
    >
      <DialogBody>
        <div className="space-y-3" id={descriptionId}>
          <p className="app-text-body text-ink">
            {t(
              count === 1
                ? 'settings.privacy.profileVisibility.pendingRequests.count.one'
                : 'settings.privacy.profileVisibility.pendingRequests.count.other',
              { values: { count } },
            )}
          </p>
          <p className="app-text-body text-ink-2">
            {t('settings.privacy.profileVisibility.pendingRequests.body')}
          </p>
        </div>
      </DialogBody>
      <DialogActions stackOnMobile>
        <Button
          type="button"
          variant="tertiary"
          disabled={isConfirming}
          onClick={onCancel}
        >
          {t('settings.privacy.profileVisibility.pendingRequests.cancel')}
        </Button>
        <Button
          type="button"
          isLoading={isConfirming}
          loadingLabel={t(
            'settings.privacy.profileVisibility.pendingRequests.confirming',
          )}
          onClick={onConfirm}
        >
          {t('settings.privacy.profileVisibility.pendingRequests.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
