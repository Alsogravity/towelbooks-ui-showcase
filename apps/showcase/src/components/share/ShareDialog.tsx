import { useState } from 'react';

import { useI18n } from '../../i18n';
import { Dialog, DialogBody, Icon } from '../primitives';

type ShareDialogProps = {
  helperText?: string;
  getMessage: (fullUrl: string) => string;
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  url: string;
};

export function ShareDialog({
  helperText,
  getMessage,
  isOpen,
  onClose,
  subject,
  url,
}: ShareDialogProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  if (!isOpen) {
    return null;
  }

  const fullUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
  const message = getMessage(fullUrl);

  const options = [
    {
      key: 'metaThreads',
      icon: 'at-sign' as const,
      label: t('share.channels.metaThreads'),
      href: `https://threads.net/intent/post?text=${encodeURIComponent(message)}`,
    },
    {
      key: 'facebook',
      icon: 'facebook' as const,
      label: t('share.channels.facebook'),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
    },
    {
      key: 'messenger',
      icon: 'message-circle' as const,
      label: t('share.channels.messenger'),
      href: `fb-messenger://share/?link=${encodeURIComponent(fullUrl)}`,
    },
    {
      key: 'twitter',
      icon: 'twitter' as const,
      label: t('share.channels.twitter'),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
    },
    {
      key: 'email',
      icon: 'mail' as const,
      label: t('share.channels.email'),
      href: `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`,
    },
    {
      key: 'copy-link',
      icon: 'link' as const,
      label: copied ? t('share.channels.copied') : t('share.channels.copyLink'),
      onClick: () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(fullUrl).catch(() => {});
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      },
    },
  ];

  return (
    <Dialog
      closeButtonLabel={t('common.close')}
      onClose={onClose}
      showCloseButton
      title={t('share.title')}
    >
      <DialogBody className="gap-4">
        {helperText ? <p className="meta text-ink-3">{helperText}</p> : null}
        <div className="grid grid-cols-3 gap-2">
          {options.map((option) =>
            option.href ? (
              <a
                key={option.key}
                className="flex flex-col items-center gap-2 rounded-2xl p-3 text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
                href={option.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon name={option.icon} size={24} />
                <span className="app-text-caption leading-tight">
                  {option.label}
                </span>
              </a>
            ) : (
              <button
                key={option.key}
                className="flex flex-col items-center gap-2 rounded-2xl p-3 text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
                type="button"
                onClick={option.onClick}
              >
                <Icon name={option.icon} size={24} />
                <span className="app-text-caption leading-tight">
                  {option.label}
                </span>
              </button>
            ),
          )}
        </div>
      </DialogBody>
    </Dialog>
  );
}
