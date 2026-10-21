import { type ExternalLink } from '@towelbooks/schemas';

import { Dialog, DialogBody, Icon } from '../../components/primitives';
import { useI18n } from '../../i18n';
import { getSafeExternalUrl } from '../../lib/safeExternalUrl';
import { getExternalLinkHostname } from './externalLinkDisplay';

type ExternalLinksSheetProps = {
  isOpen: boolean;
  links: ExternalLink[];
  onClose: () => void;
};

export function ExternalLinksSheet({
  isOpen,
  links,
  onClose,
}: ExternalLinksSheetProps) {
  const { t } = useI18n();

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog
      onClose={onClose}
      size="sm"
      title={t('externalLinks.sheet.title', { fallback: 'Links' })}
      closeButtonLabel={t('common.close', { fallback: 'Close' })}
      showCloseButton
    >
      <DialogBody disableDefaultSpacing className="rounded-b-xl px-0 py-0">
        <ul>
          {links.map((link) => {
            const safeUrl = getSafeExternalUrl(link.url);
            const hostname = getExternalLinkHostname(link.url);

            return (
              <li key={link.id}>
                {safeUrl ? (
                  <a
                    href={safeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-4 text-ink no-underline transition-colors hover:bg-paper-2"
                  >
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-ink/5">
                      <Icon name="link" size={18} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="app-text-row-title block truncate text-sky-600 underline">
                        {link.title}
                      </span>
                      <span className="app-text-metadata block truncate text-ink-3">
                        {hostname}
                      </span>
                    </span>
                  </a>
                ) : (
                  <div className="flex items-center gap-3 px-6 py-4 text-ink">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-ink/5">
                      <Icon name="link" size={18} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="app-text-row-title block truncate">
                        {link.title}
                      </span>
                      <span className="app-text-metadata block truncate text-ink-3">
                        {hostname}
                      </span>
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </DialogBody>
    </Dialog>
  );
}
