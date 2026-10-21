import { usePageTitle } from '../../hooks/usePageTitle';
import { useI18n } from '../../i18n';
import { SetPasswordFormSection } from './SetPasswordFormSection';
import { SettingsSubrouteTitleRow } from './ui/SettingsSubrouteTitleRow';
import { useSetPasswordPageState } from './useSetPasswordPageState';

export function SetPasswordPage() {
  usePageTitle({
    key: 'page.settings.setPassword.title',
    fallback: 'Set password',
  });

  const { t } = useI18n();
  const {
    form: {
      formState: { errors: setPasswordErrors, isSubmitting: isSettingPassword },
      register: registerSetPassword,
    },
    handleSetPasswordSubmit,
    setPasswordServerError,
  } = useSetPasswordPageState();

  return (
    <div className="space-y-8">
      <SettingsSubrouteTitleRow
        backLabel={t('settings.account.setPassword.backToAccount')}
        route="account"
        title={t('settings.account.setPassword.title')}
      />

      <p className="supporting-copy text-ink-2">
        {t('settings.account.setPassword.description')}
      </p>

      <SetPasswordFormSection
        errors={setPasswordErrors}
        isSubmitting={isSettingPassword}
        onSubmit={handleSetPasswordSubmit}
        register={registerSetPassword}
        serverError={setPasswordServerError}
      />
    </div>
  );
}
