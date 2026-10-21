import { useRef, useState } from 'react';

import { AppActionRow, AppSubsection } from '../../../components/application';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  ToolbarIconButton,
} from '../../../components/primitives';
import { useI18n } from '../../../i18n';

type InviteLinkSectionProps = {
  isGenerating: boolean;
  onGenerateLink: () => Promise<string>;
};

export function InviteLinkSection({
  isGenerating,
  onGenerateLink,
}: InviteLinkSectionProps) {
  const { t } = useI18n();
  const generateActionRef = useRef<HTMLDivElement>(null);
  const [activeDialog, setActiveDialog] = useState<'confirm' | 'result' | null>(
    null,
  );
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const handleConfirmGenerate = async () => {
    try {
      const nextInviteUrl = await onGenerateLink();
      setInviteUrl(nextInviteUrl);
      setCopyStatus(null);
      setActiveDialog('result');
    } catch {
      // Error feedback is handled by the caller.
    }
  };

  const handleCopyInviteLink = async () => {
    if (!inviteUrl) {
      return;
    }

    if (!navigator.clipboard) {
      setCopyStatus(t('invites.reveal.manualCopy'));
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopyStatus(t('invites.reveal.copied'));
    } catch {
      setCopyStatus(t('invites.reveal.copyFailed'));
    }
  };

  return (
    <>
      <AppSubsection title={t('invites.details.link.title')}>
        <p className="supporting-copy text-ink-2">
          {t('invites.details.link.body')}
        </p>
        <div ref={generateActionRef}>
          <AppActionRow
            label={t('invites.details.link.generate')}
            onClick={() => setActiveDialog('confirm')}
          />
        </div>
      </AppSubsection>

      {activeDialog === 'confirm' ? (
        <Dialog
          closeButtonLabel={t('common.close')}
          getReturnFocusElement={() =>
            generateActionRef.current?.querySelector('button') ?? null
          }
          onClose={() => {
            if (!isGenerating) {
              setActiveDialog(null);
            }
          }}
          showCloseButton
          size="sm"
          title={t('invites.details.link.confirm.title')}
        >
          <DialogBody className="gap-4">
            <p className="supporting-copy text-ink-3">
              {t('invites.details.link.confirm.body')}
            </p>
          </DialogBody>
          <DialogActions>
            <Button
              type="button"
              variant="tertiary"
              disabled={isGenerating}
              onClick={() => setActiveDialog(null)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              isLoading={isGenerating}
              loadingLabel={t('invites.details.link.loading')}
              onClick={() => void handleConfirmGenerate()}
            >
              {t('invites.details.link.confirm.submit')}
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}

      {activeDialog === 'result' && inviteUrl ? (
        <Dialog
          closeButtonLabel={t('common.close')}
          getReturnFocusElement={() =>
            generateActionRef.current?.querySelector('button') ?? null
          }
          onClose={() => {
            setActiveDialog(null);
            setCopyStatus(null);
          }}
          showCloseButton
          size="sm"
          title={t('invites.details.link.result.title')}
        >
          <DialogBody className="gap-4">
            <p className="supporting-copy text-ink-2">
              {t('invites.reveal.securityNote')}
            </p>
            <div className="flex items-stretch gap-2">
              <input
                aria-label={t('invites.reveal.urlLabel')}
                readOnly
                value={inviteUrl}
                onFocus={(event) => event.currentTarget.select()}
                className="min-w-0 flex-1 rounded-sm border border-rule bg-vellum px-2 py-2 font-mono text-xs text-ink"
              />
              <ToolbarIconButton
                aria-label={t('invites.reveal.copy')}
                className="shrink-0 self-stretch"
                icon="copy"
                onClick={() => void handleCopyInviteLink()}
              />
            </div>
            <p
              className="meta min-h-[1.25rem] text-ink-2"
              aria-live="polite"
              role="status"
            >
              {copyStatus ?? ''}
            </p>
          </DialogBody>
          <DialogActions>
            <Button
              type="button"
              onClick={() => {
                setActiveDialog(null);
                setCopyStatus(null);
              }}
            >
              {t('common.close')}
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </>
  );
}
