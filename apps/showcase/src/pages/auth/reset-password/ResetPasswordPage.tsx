import { zodResolver } from '@hookform/resolvers/zod';
import { PASSWORD_MAX_LENGTH } from '@towelbooks/schemas';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { StatusPanel } from '../../../components/feedback';
import {
  Alert,
  Button,
  ButtonLink,
  FormField,
} from '../../../components/primitives';
import { applyApiValidationErrors } from '../../../features/errors';
import {
  createResetPasswordSchema,
  getLocalizedAuthErrorMessage,
  type ResetPasswordForm,
} from '../../../features/auth/authCopy';
import { AuthFormPage } from '../../../features/auth/ui/AuthFormPage';
import { AuthStatusPage } from '../../../features/auth/ui/AuthStatusPage';
import { AuthSignInLink } from '../../../features/auth/ui/AuthTextLink';
import { PasswordInput } from '../../../features/auth/ui/PasswordInput';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useI18n } from '../../../i18n';
import { GUEST_LOGIN_PATH } from '../../../lib/origins';
import { sdk } from '../../../lib/sdk';
import { useOneTimeTokenSearchParam } from '../../../lib/useOneTimeTokenSearchParam';

export function ResetPasswordPage() {
  usePageTitle({
    key: 'page.auth.resetPassword.title',
    fallback: 'Reset password',
  });

  const token = useOneTimeTokenSearchParam();
  const { t } = useI18n();
  const resetPasswordSchema = createResetPasswordSchema(t);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      setServerError(t('auth.resetPassword.missingToken'));
      return;
    }

    setServerError(null);
    try {
      await sdk.auth.resetPassword({ token, newPassword: data.password });
      setIsSuccess(true);
    } catch (error: unknown) {
      if (
        applyApiValidationErrors(error, setError, {
          newPassword: 'password',
        }) > 0
      ) {
        return;
      }

      setServerError(
        getLocalizedAuthErrorMessage(
          error,
          t,
          'auth.errors.resetPasswordFallback',
        ),
      );
    }
  };

  if (!token) {
    return (
      <AuthStatusPage>
        <StatusPanel
          eyebrow={t('auth.resetPassword.missingEyebrow')}
          title={t('auth.resetPassword.invalidLinkHeading')}
          body={t('auth.resetPassword.missingToken')}
          actions={
            <>
              <ButtonLink
                to="/forgot-password"
                className="w-full justify-center"
              >
                {t('auth.resetPassword.requestNew')}
              </ButtonLink>
              <ButtonLink
                to={GUEST_LOGIN_PATH}
                variant="secondary"
                className="w-full justify-center"
              >
                {t('auth.forgotPassword.backToSignIn')}
              </ButtonLink>
            </>
          }
        />
      </AuthStatusPage>
    );
  }

  if (isSuccess) {
    return (
      <AuthStatusPage>
        <StatusPanel
          icon="check"
          tone="forest"
          title={t('auth.resetPassword.successHeading')}
          body={t('auth.resetPassword.successBody')}
          actions={
            <ButtonLink to={GUEST_LOGIN_PATH} className="w-full justify-center">
              {t('auth.resetPassword.goToSignIn')}
            </ButtonLink>
          }
        />
      </AuthStatusPage>
    );
  }

  return (
    <AuthFormPage
      eyebrow={t('auth.resetPassword.eyebrow')}
      title={t('auth.resetPassword.heading')}
      description={t('auth.resetPassword.description')}
      titleAlign="left"
    >
      <div className="mb-4 text-center sm:text-left">
        <AuthSignInLink>{t('auth.forgotPassword.backToSignIn')}</AuthSignInLink>
      </div>

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label={t('auth.labels.newPassword')}
          htmlFor="reset-password"
          hideLabel
          error={errors.password?.message}
        >
          <PasswordInput
            {...register('password')}
            floatingLabel
            hidePasswordLabel={t('auth.login.hidePassword')}
            id="reset-password"
            maxLength={PASSWORD_MAX_LENGTH}
            placeholder={t('auth.labels.newPassword')}
            showPasswordLabel={t('auth.login.showPassword')}
          />
        </FormField>

        <FormField
          label={t('auth.labels.confirmNewPassword')}
          htmlFor="reset-password-confirmation"
          hideLabel
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            {...register('confirmPassword')}
            floatingLabel
            hidePasswordLabel={t('auth.login.hidePassword')}
            id="reset-password-confirmation"
            maxLength={PASSWORD_MAX_LENGTH}
            placeholder={t('auth.labels.confirmNewPassword')}
            showPasswordLabel={t('auth.login.showPassword')}
          />
        </FormField>

        <Button
          type="submit"
          isLoading={isSubmitting}
          loadingLabel={t('auth.resetPassword.submitting')}
          className="w-full justify-center"
        >
          {t('auth.resetPassword.submit')}
        </Button>
      </form>
    </AuthFormPage>
  );
}
