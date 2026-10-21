import { useCallback, useState } from 'react';

import { getGTMContainerId } from '../analytics';
import { useI18n } from '../../i18n';
import { legalDocumentPath } from '../../lib/origins';
import {
  CookiePreferencesDialog,
  defaultVisitorCookiePreferences,
} from './CookiePreferencesDialog';
import { useAnalyticsConsent } from './AnalyticsConsentContext';

export function VisitorConsentBanner() {
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState(false);
  const { state, visitorChoice, saveConsent } = useAnalyticsConsent();

  const containerId = getGTMContainerId();
  if (
    !containerId ||
    visitorChoice ||
    dismissed ||
    state.status === 'resolving'
  ) {
    return null;
  }

  return (
    <ConsentBannerInner
      onDismiss={() => setDismissed(true)}
      saveConsent={saveConsent}
      t={t}
    />
  );
}

function ConsentBannerInner({
  onDismiss,
  saveConsent,
  t,
}: {
  onDismiss: () => void;
  saveConsent: (value: 'granted' | 'denied') => Promise<boolean>;
  t: (key: string) => string;
}) {
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const saveAndDismiss = useCallback(
    (preferences: typeof defaultVisitorCookiePreferences) => {
      setIsSaving(true);
      setSaveError(false);
      void saveConsent(preferences.analytics)
        .then((saved) => {
          if (saved) {
            onDismiss();
            return;
          }
          setSaveError(true);
        })
        .catch(() => setSaveError(true))
        .finally(() => setIsSaving(false));
    },
    [onDismiss, saveConsent],
  );

  const handleAccept = useCallback(() => {
    saveAndDismiss({ analytics: 'granted' });
  }, [saveAndDismiss]);

  const handleDecline = useCallback(() => {
    saveAndDismiss(defaultVisitorCookiePreferences);
  }, [saveAndDismiss]);

  const handleManageCookies = useCallback(() => {
    setIsPreferencesOpen(true);
  }, []);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-ink/10 bg-paper px-6 py-4 shadow-[var(--shadow-3)] sm:px-12 lg:px-24">
        <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl space-y-1 text-left">
            <h2 className="text-base font-semibold text-ink">
              {t('consent.analytics.title')}
            </h2>
            <p className="text-sm leading-relaxed text-ink-2">
              {t('consent.analytics.text')}{' '}
              <button
                className="font-medium text-ink underline underline-offset-2 hover:text-ink/70"
                onClick={handleManageCookies}
                type="button"
              >
                {t('consent.analytics.manage')}
              </button>
              {t('consent.analytics.textAfterManage')}{' '}
              <a
                className="font-medium text-ink underline underline-offset-2"
                href={legalDocumentPath('cookies')}
              >
                {t('consent.analytics.cookiePolicy')}
              </a>
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:justify-end">
            <button
              className="w-full rounded-full border border-ink/20 px-4 py-2 text-sm font-medium text-ink-3 transition-colors hover:bg-ink/5 hover:text-ink sm:w-auto"
              disabled={isSaving}
              onClick={handleManageCookies}
              type="button"
            >
              {t('consent.analytics.manage')}
            </button>
            <button
              className="w-full rounded-full border border-ink/20 px-4 py-2 text-sm font-medium text-ink-3 transition-colors hover:bg-ink/5 hover:text-ink sm:w-auto"
              disabled={isSaving}
              onClick={handleDecline}
              type="button"
            >
              {t('consent.analytics.decline')}
            </button>
            <button
              className="w-full rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink/80 sm:w-auto"
              disabled={isSaving}
              onClick={handleAccept}
              type="button"
            >
              {t('consent.analytics.accept')}
            </button>
          </div>
        </div>
        {saveError ? (
          <p className="mt-3 text-sm text-brick" role="alert">
            {t('consent.analytics.preferences.error')}
          </p>
        ) : null}
      </div>
      <CookiePreferencesDialog
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        onSaved={onDismiss}
      />
    </>
  );
}
