import { usePageTitle } from '../../hooks/usePageTitle';
import { useI18n } from '../../i18n';
import { ChangePasswordFormSection } from './ChangePasswordFormSection';
import { SettingsSubrouteTitleRow } from './ui/SettingsSubrouteTitleRow';
import { useChangePasswordPageState } from './useChangePasswordPageState';

export function ChangePasswordPage() {
  usePageTitle({
    key: 'page.settings.changePassword.title',
    fallback: 'Change password',
  });

  const { t } = useI18n();
  const {
    changePasswordServerError,
    form: {
      formState: {
        errors: changePasswordErrors,
        isSubmitting: isChangingPassword,
      },
      register: registerChangePassword,
    },
    handleChangePasswordSubmit,
  } = useChangePasswordPageState();

  return (
    <div className="space-y-8">
      <SettingsSubrouteTitleRow
        backLabel={t('settings.account.password.backToAccount')}
        route="account"
        title={t('settings.account.password.title')}
      />

      <p className="supporting-copy text-ink-2">
        {t('settings.account.password.description')}
      </p>

      <ChangePasswordFormSection
        errors={changePasswordErrors}
        isSubmitting={isChangingPassword}
        onSubmit={handleChangePasswordSubmit}
        register={registerChangePassword}
        serverError={changePasswordServerError}
      />
    </div>
  );
}
