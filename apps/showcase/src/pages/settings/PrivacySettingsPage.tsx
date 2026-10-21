import { PRIVACY_CONTACT_EMAIL } from '@towelbooks/schemas/legal-documents';
import { useState } from 'react';

import {
  SettingsDefinitionList,
  SettingsDefinitionRow,
} from './ui/SettingsDefinitionList';
import { SettingsLinkRow } from './ui/SettingsLinkRow';
import { SettingsRowGroup } from './ui/SettingsRowGroup';
import { SettingsSectionPageHeader } from './ui/SettingsSectionPageHeader';
import { SettingsSubsection } from './ui/SettingsSubsection';
import { SettingsSwitch } from './ui/SettingsSwitch';
import { AppActionRow } from '../../components/application';
import { LoadingState } from '../../components/feedback';
import { Button, Icon, InfoTooltipButton } from '../../components/primitives';
import { useSettingsShell } from '../../features/settings/SettingsShellContext';
import { ApiProblemPageState } from '../../features/errors';
import { CookiePreferencesDialog } from '../../features/privacy/CookiePreferencesDialog';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useI18n } from '../../i18n';
import { legalDocumentPath } from '../../lib/origins';
import { usePrivacySettingsPageState } from './usePrivacySettingsPageState';
import { PendingFollowRequestsConfirmationDialog } from './PendingFollowRequestsConfirmationDialog';

export function PrivacySettingsPage() {
  usePageTitle({
    key: 'page.settings.privacy.title',
    fallback: 'Privacy & Data',
  });

  const { t } = useI18n();
  const { goTo } = useSettingsShell();
  const [isCookiePreferencesOpen, setIsCookiePreferencesOpen] = useState(false);
  const {
    error,
    exportPrivacyData,
    isExportPending,
    isLoading,
    isVisibilityConfirmationPending,
    pendingConsentId,
    pendingVisibilityConfirmationCount,
    preferences,
    refetch,
    cancelPendingVisibilityConfirmation,
    confirmPendingVisibilityChange,
    updateConsentPreference,
  } = usePrivacySettingsPageState();

  if (error) {
    return (
      <div className="py-2">
        <Button
          aria-label={t('settings.backToSettings')}
          icon="chevron-left"
          variant="ghost"
          size="sm"
          className="mb-5 shrink-0 lg:hidden"
          onClick={() => goTo('index')}
        />
        <ApiProblemPageState
          error={error}
          fallbackAction={
            <Button variant="secondary" onClick={() => void refetch()}>
              {t('errors.action.retry')}
            </Button>
          }
        />
      </div>
    );
  }

  if (isLoading || !preferences) {
    return (
      <div className="py-2">
        <LoadingState label={t('settings.privacy.loading')} />
      </div>
    );
  }

  const currentPreferences = preferences;

  return (
    <div className="space-y-8">
      <SettingsSectionPageHeader title={t('settings.privacy.header.title')} />

      <div className="flex flex-col gap-10">
        <SettingsSubsection title={t('settings.privacy.consent.title')}>
          <SettingsRowGroup>
            <SettingsSwitch
              checked={currentPreferences.marketingEmailsOptIn}
              disabled={
                pendingConsentId !== null &&
                pendingConsentId !== 'marketingEmailsOptIn'
              }
              id="marketingEmailsOptIn"
              label={t('settings.privacy.marketing.label')}
              labelAccessory={
                <InfoTooltipButton
                  ariaLabel={t('settings.privacy.marketing.infoAriaLabel')}
                  content={t('settings.privacy.marketing.description')}
                  placement="bottom-start"
                  tooltipId="privacy-marketing-info-tooltip"
                />
              }
              loadingLabel={t('settings.privacy.saving')}
              onChange={(checked) =>
                updateConsentPreference('marketingEmailsOptIn', {
                  marketingEmailsOptIn: checked,
                })
              }
            />
            <SettingsSwitch
              checked={currentPreferences.productAnalyticsOptIn}
              disabled={
                pendingConsentId !== null &&
                pendingConsentId !== 'productAnalyticsOptIn'
              }
              id="productAnalyticsOptIn"
              label={t('settings.privacy.analytics.label')}
              labelAccessory={
                <InfoTooltipButton
                  ariaLabel={t('settings.privacy.analytics.infoAriaLabel')}
                  content={t('settings.privacy.analytics.description')}
                  placement="bottom-start"
                  tooltipId="privacy-analytics-info-tooltip"
                />
              }
              loadingLabel={t('settings.privacy.saving')}
              onChange={(checked) =>
                updateConsentPreference('productAnalyticsOptIn', {
                  productAnalyticsOptIn: checked,
                })
              }
            />
            <SettingsSwitch
              checked={currentPreferences.profileVisibility === 'private'}
              disabled={
                pendingConsentId !== null &&
                pendingConsentId !== 'profileVisibility'
              }
              id="profileVisibility"
              label={t('settings.privacy.profileVisibility.label')}
              labelAccessory={
                <InfoTooltipButton
                  ariaLabel={t(
                    'settings.privacy.profileVisibility.infoAriaLabel',
                  )}
                  content={t('settings.privacy.profileVisibility.description')}
                  placement="bottom-start"
                  tooltipId="privacy-profile-visibility-info-tooltip"
                />
              }
              loadingLabel={t('settings.privacy.saving')}
              onChange={(checked) =>
                updateConsentPreference('profileVisibility', {
                  profileVisibility: checked ? 'private' : 'public',
                })
              }
            />
          </SettingsRowGroup>
        </SettingsSubsection>

        <SettingsSubsection
          description={t('settings.privacy.cookies.description')}
          title={t('settings.privacy.cookies.title')}
        >
          <SettingsRowGroup>
            <AppActionRow
              label={t('settings.privacy.cookies.manage')}
              onClick={() => setIsCookiePreferencesOpen(true)}
            />
          </SettingsRowGroup>
        </SettingsSubsection>

        <SettingsSubsection title={t('settings.privacy.current.title')}>
          <SettingsDefinitionList>
            <SettingsDefinitionRow
              label={t('settings.privacy.current.profileVisibility')}
              value={
                <span className="inline-flex items-center gap-2">
                  <Icon
                    name={
                      currentPreferences.profileVisibility === 'private'
                        ? 'lock'
                        : 'globe'
                    }
                    size={16}
                  />
                  {t(
                    currentPreferences.profileVisibility === 'private'
                      ? 'settings.privacy.value.private'
                      : 'settings.privacy.value.public',
                  )}
                </span>
              }
            />
          </SettingsDefinitionList>
        </SettingsSubsection>

        <SettingsSubsection
          title={t('settings.privacy.export.title')}
          titleAccessory={
            <InfoTooltipButton
              ariaLabel={t('settings.privacy.export.infoAriaLabel')}
              content={
                <span className="space-y-2">
                  <span className="block">
                    {t('settings.privacy.export.body')}
                  </span>
                  <span className="block">
                    {t('settings.privacy.export.note')}
                  </span>
                </span>
              }
              tooltipId="privacy-export-note-tooltip"
            />
          }
          actions={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              prependIcon="download"
              isLoading={isExportPending}
              loadingLabel={t('settings.privacy.export.downloading')}
              onClick={exportPrivacyData}
            >
              {t('settings.privacy.export.action')}
            </Button>
          }
        >
          {null}
        </SettingsSubsection>

        <SettingsSubsection
          title={t('settings.privacy.legal.title')}
          description={t('settings.privacy.legal.body')}
        >
          <SettingsRowGroup>
            <SettingsLinkRow href={legalDocumentPath('privacy')}>
              {t('settings.privacy.legal.privacyPolicy')}
            </SettingsLinkRow>
            <SettingsLinkRow href={legalDocumentPath('cookies')}>
              {t('settings.privacy.legal.cookieNotice')}
            </SettingsLinkRow>
            <SettingsLinkRow href={legalDocumentPath('terms')}>
              {t('settings.privacy.legal.terms')}
            </SettingsLinkRow>
            <SettingsLinkRow href="/legal/privacy/changelog">
              {t('settings.privacy.legal.changelog')}
            </SettingsLinkRow>
            <SettingsLinkRow href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>
              {t('settings.privacy.legal.contact')}
            </SettingsLinkRow>
          </SettingsRowGroup>
        </SettingsSubsection>
      </div>
      <CookiePreferencesDialog
        isOpen={isCookiePreferencesOpen}
        onClose={() => setIsCookiePreferencesOpen(false)}
      />
      <PendingFollowRequestsConfirmationDialog
        count={pendingVisibilityConfirmationCount ?? 0}
        isConfirming={isVisibilityConfirmationPending}
        isOpen={pendingVisibilityConfirmationCount !== null}
        onCancel={cancelPendingVisibilityConfirmation}
        onConfirm={() => void confirmPendingVisibilityChange()}
      />
    </div>
  );
}
