import { PRIVACY_CONTACT_EMAIL } from '@towelbooks/schemas/legal-documents';

import { getProfilePath } from '../../app/profileRoutes';
import { PageSection } from '../../components/layout';
import { ButtonLink, Tag } from '../../components/primitives';
import { SettingsRouteButton } from '../../features/settings/SettingsRouteButton';
import { SettingsSubrouteBackButton } from '../../features/settings/SettingsSubrouteBackButton';
import { useAuth } from '../../features/auth/AuthContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useI18n } from '../../i18n';
import { useSearchParams } from 'react-router';
import { DeleteAccountConfirmationSection } from './DeleteAccountConfirmationSection';
import { useDeleteAccountPageState } from './useDeleteAccountPageState';

export function DeleteAccountPage() {
  usePageTitle({
    key: 'page.settings.deleteAccount.title',
    fallback: 'Delete account',
  });

  const { t } = useI18n();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const googleReauthSatisfied =
    searchParams.get('oauth') === 'account_deletion_reauth_success';
  const hasLocalPassword = user?.authMethods.password ?? true;
  const {
    canSubmit,
    confirmationPhrase,
    deleteMutation,
    ownershipBlock,
    password,
    reauthMutation,
    requiresOwnershipTransfer,
    setConfirmationPhrase,
    setPassword,
    successMessage,
    startGoogleReauthentication,
  } = useDeleteAccountPageState({
    googleReauthSatisfied,
    hasLocalPassword,
  });
  const profilePath = getProfilePath(user);

  const beforeItems = [
    t('settings.delete.before.item1'),
    t('settings.delete.before.item2'),
    t('settings.delete.before.item3'),
    t('settings.delete.before.item4'),
    t('settings.delete.before.item5'),
  ];

  return (
    <div className="space-y-8">
      <SettingsSubrouteBackButton route="account">
        {t('settings.delete.backToAccount')}
      </SettingsSubrouteBackButton>

      <h1 className="app-text-section-title hidden text-ink lg:block">
        {t('settings.delete.header.title')}
      </h1>
      <p className="supporting-copy max-w-2xl text-ink-2">
        {t(
          hasLocalPassword
            ? 'settings.delete.header.description'
            : 'settings.delete.header.googleOnlyDescription',
        )}
      </p>

      <PageSection
        className="rounded-xl border border-brick-soft px-5 py-5 sm:px-6"
        spacing="compact"
        header={
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-5">
            <div>
              <h2 className="section-title text-ink">
                {t('settings.delete.before.title')}
              </h2>
            </div>
            <Tag variant="private">{t('settings.delete.before.tag')}</Tag>
          </div>
        }
      >
        <ul className="divide-y divide-rule">
          {beforeItems.map((item) => (
            <li key={item} className="supporting-copy py-3 text-ink-2">
              {item}
            </li>
          ))}
        </ul>
      </PageSection>

      <DeleteAccountConfirmationSection
        canSubmit={canSubmit}
        confirmationPhrase={confirmationPhrase}
        deleteError={deleteMutation.error}
        googleReauthSatisfied={googleReauthSatisfied}
        hasLocalPassword={hasLocalPassword}
        isDeleting={deleteMutation.isPending}
        isReauthenticating={reauthMutation.isPending}
        reauthError={reauthMutation.error}
        onConfirmationPhraseChange={setConfirmationPhrase}
        onDelete={() => deleteMutation.mutate()}
        onPasswordChange={setPassword}
        onReauthenticate={startGoogleReauthentication}
        ownershipBlock={ownershipBlock}
        password={password}
        requiresOwnershipTransfer={requiresOwnershipTransfer}
        successMessage={successMessage}
      />

      <PageSection
        className="rounded-xl border border-rule px-5 py-6 sm:px-6"
        spacing="compact"
      >
        <p className="surface-title italic-display text-ink">
          {t('settings.delete.conservative.body')}
        </p>
        <p className="mt-4 text-sm leading-7 text-ink-3">
          {t('settings.delete.conservative.description')}
        </p>
      </PageSection>

      <PageSection
        className="rounded-xl border border-rule px-5 py-6 sm:px-6"
        spacing="compact"
      >
        <h2 className="surface-title italic-display text-ink">
          {t('settings.delete.privacyContact.title')}
        </h2>
        <p className="mt-4 text-sm leading-7 text-ink-3">
          {t('settings.delete.privacyContact.body')}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <SettingsRouteButton route="privacy" variant="secondary" size="sm">
            {t('settings.delete.privacySettings')}
          </SettingsRouteButton>
          <a
            className="text-sm text-brick underline underline-offset-4"
            href={`mailto:${PRIVACY_CONTACT_EMAIL}`}
          >
            {t('settings.delete.privacyContact.link')}
          </a>
        </div>
      </PageSection>

      <PageSection
        className="rounded-xl border border-rule px-5 py-6 sm:px-6"
        spacing="compact"
      >
        <p className="text-sm leading-7 text-ink-2">
          {t('settings.delete.saferChange.body')}
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <SettingsRouteButton route="privacy" variant="secondary" size="sm">
            {t('settings.delete.privacySettings')}
          </SettingsRouteButton>
          <ButtonLink to={profilePath} variant="tertiary" size="sm">
            {t('settings.delete.profile')}
          </ButtonLink>
        </div>
      </PageSection>
    </div>
  );
}
