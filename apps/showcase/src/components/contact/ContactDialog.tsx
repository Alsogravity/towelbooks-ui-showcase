import { Dialog, DialogBody } from '../primitives';
import { useI18n } from '../../i18n';

const SUPPORT_CONTACT_EMAIL = 'support@towelbooks.com';

export function ContactDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog
      closeButtonLabel={t('common.close')}
      onClose={onClose}
      showCloseButton
      title={t('shell.support.title')}
    >
      <DialogBody className="gap-4">
        <p className="app-text-body text-ink-2">{t('shell.support.body')}</p>
        <a
          className="app-text-body font-medium text-brick underline underline-offset-4"
          href={`mailto:${SUPPORT_CONTACT_EMAIL}`}
        >
          {SUPPORT_CONTACT_EMAIL}
        </a>
        <p className="app-text-supporting-copy text-ink-3">
          {t('shell.support.comingSoon')}
        </p>
      </DialogBody>
    </Dialog>
  );
}
