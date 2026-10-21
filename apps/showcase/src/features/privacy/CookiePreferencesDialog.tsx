import { useCallback, useState } from 'react';

import { Switch } from '@towelbooks/ui';

import { Dialog, DialogActions, DialogBody } from '../../components/primitives';
import { useI18n } from '../../i18n';
import {
  readStoredVisitorCookiePreferences,
  type VisitorCookiePreferences,
} from '../../lib/browserStorage';
import { legalDocumentPath } from '../../lib/origins';
import { useAnalyticsConsent } from './AnalyticsConsentContext';

export const defaultVisitorCookiePreferences: VisitorCookiePreferences = {
  analytics: 'denied',
};

export function useVisitorCookiePreferenceSaving() {
  const { t } = useI18n();
  const { saveConsent } = useAnalyticsConsent();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const savePreferences = useCallback(
    async (nextPreferences: VisitorCookiePreferences, onSaved?: () => void) => {
      if (isSaving) {
        return false;
      }

      setIsSaving(true);
      setSaveError(null);

      try {
        if (!(await saveConsent(nextPreferences.analytics))) {
          setSaveError(t('consent.analytics.preferences.error'));
          return false;
        }

        onSaved?.();
        return true;
      } catch {
        setSaveError(t('consent.analytics.preferences.error'));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [isSaving, saveConsent, t],
  );

  return { isSaving, saveError, savePreferences };
}

type CookiePreferencesDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

export function CookiePreferencesDialog({
  isOpen,
  onClose,
  onSaved,
}: CookiePreferencesDialogProps) {
  if (!isOpen) {
    return null;
  }

  return <CookiePreferencesDialogContent onClose={onClose} onSaved={onSaved} />;
}

function CookiePreferencesDialogContent({
  onClose,
  onSaved,
}: Omit<CookiePreferencesDialogProps, 'isOpen'>) {
  const { t } = useI18n();
  const [preferences, setPreferences] = useState<VisitorCookiePreferences>(
    () =>
      readStoredVisitorCookiePreferences() ?? defaultVisitorCookiePreferences,
  );
  const { isSaving, saveError, savePreferences } =
    useVisitorCookiePreferenceSaving();

  const handleSave = useCallback(() => {
    void savePreferences(preferences, () => {
      onClose();
      onSaved?.();
    });
  }, [onClose, onSaved, preferences, savePreferences]);

  return (
    <Dialog
      closeButtonLabel={t('consent.analytics.close')}
      onClose={onClose}
      showCloseButton
      size="lg"
      title={t('consent.analytics.preferences.title')}
    >
      <DialogBody className="gap-5">
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-ink-2">
            {t('consent.analytics.preferences.intro')}
          </p>
          <a
            className="text-sm font-medium text-forest underline underline-offset-4 hover:text-forest/75"
            href={legalDocumentPath('cookies')}
          >
            {t('consent.analytics.preferences.learnMore')}
          </a>
        </div>
        <div className="divide-y divide-ink/10 border-y border-ink/10">
          <CookiePreferenceRow
            checked
            description={t(
              'consent.analytics.preferences.essential.description',
            )}
            disabled
            id="visitor-cookie-essential"
            label={t('consent.analytics.preferences.essential.label')}
          />
          <CookiePreferenceRow
            checked={preferences.analytics === 'granted'}
            description={t(
              'consent.analytics.preferences.analytics.description',
            )}
            disabled={isSaving}
            id="visitor-cookie-analytics"
            label={t('consent.analytics.preferences.analytics.label')}
            onCheckedChange={(checked) =>
              setPreferences((current) => ({
                ...current,
                analytics: checked ? 'granted' : 'denied',
              }))
            }
          />
        </div>
        {saveError ? (
          <p className="text-sm text-brick" role="alert">
            {saveError}
          </p>
        ) : null}
      </DialogBody>
      <DialogActions stackOnMobile>
        <button
          className="rounded-lg border border-ink/20 px-4 py-2 text-sm font-medium text-ink-3 transition-colors hover:bg-ink/5 hover:text-ink"
          disabled={isSaving}
          onClick={onClose}
          type="button"
        >
          {t('consent.analytics.preferences.cancel')}
        </button>
        <button
          className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink/80"
          disabled={isSaving}
          onClick={handleSave}
          type="button"
        >
          {t('consent.analytics.preferences.save')}
        </button>
      </DialogActions>
    </Dialog>
  );
}

function CookiePreferenceRow({
  checked,
  description,
  disabled = false,
  id,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  description: string;
  disabled?: boolean;
  id: string;
  label: string;
  onCheckedChange?: (checked: boolean) => void;
}) {
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  return (
    <div className="flex items-start justify-between gap-5 py-4">
      <div className="min-w-0 space-y-1">
        <h3 id={labelId} className="text-sm font-semibold text-ink">
          {label}
        </h3>
        <p id={descriptionId} className="text-sm leading-relaxed text-ink-2">
          {description}
        </p>
      </div>
      <Switch
        aria-describedby={descriptionId}
        aria-labelledby={labelId}
        checked={checked}
        disabled={disabled}
        id={id}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
