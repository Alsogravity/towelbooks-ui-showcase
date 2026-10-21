import { PASSWORD_MAX_LENGTH } from '@towelbooks/schemas';

import { Alert, Button, FormField } from '../../components/primitives';
import { SettingsRouteButton } from '../../features/settings/SettingsRouteButton';
import { PasswordInput } from '../../features/auth/ui/PasswordInput';
import { useI18n } from '../../i18n';

import type { SetPasswordForm } from '../../features/auth/authCopy';
import type { FormEventHandler } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';

export function SetPasswordFormSection({
  errors,
  isSubmitting,
  onSubmit,
  register,
  serverError,
}: {
  errors: FieldErrors<SetPasswordForm>;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  register: UseFormRegister<SetPasswordForm>;
  serverError: string | null;
}) {
  const { t } = useI18n();

  return (
    <form onSubmit={onSubmit} className="w-full space-y-4">
      <FormField
        label={t('settings.account.password.newPasswordLabel')}
        htmlFor="account-new-password"
        error={errors.newPassword?.message}
      >
        <PasswordInput
          {...register('newPassword')}
          autoComplete="new-password"
          hidePasswordLabel={t('auth.login.hidePassword')}
          id="account-new-password"
          maxLength={PASSWORD_MAX_LENGTH}
          showPasswordLabel={t('auth.login.showPassword')}
        />
      </FormField>

      <FormField
        label={t('settings.account.password.confirmPasswordLabel')}
        htmlFor="account-confirm-password"
        error={errors.confirmPassword?.message}
      >
        <PasswordInput
          {...register('confirmPassword')}
          autoComplete="new-password"
          hidePasswordLabel={t('auth.login.hidePassword')}
          id="account-confirm-password"
          maxLength={PASSWORD_MAX_LENGTH}
          showPasswordLabel={t('auth.login.showPassword')}
        />
      </FormField>

      <p className="text-xs leading-5 text-ink-3">
        {t('settings.account.password.requirements')}
      </p>

      {serverError ? <Alert variant="error">{serverError}</Alert> : null}

      <div className="flex justify-end gap-3">
        <SettingsRouteButton route="account" variant="secondary">
          {t('settings.profile.edit.cancel')}
        </SettingsRouteButton>
        <Button
          type="submit"
          isLoading={isSubmitting}
          loadingLabel={t('settings.account.setPassword.submitting')}
        >
          {t('settings.account.setPassword.submit')}
        </Button>
      </div>
    </form>
  );
}
