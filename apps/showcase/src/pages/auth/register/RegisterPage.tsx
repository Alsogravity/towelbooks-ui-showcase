import { zodResolver } from '@hookform/resolvers/zod';
import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  USERNAME_MAX_LENGTH,
} from '@towelbooks/schemas';
import { PUBLIC_LEGAL_DOCUMENT_METADATA } from '@towelbooks/schemas/legal-documents';
import { getApiErrorCode } from '@towelbooks/sdk';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router';

import {
  Alert,
  Button,
  Checkbox,
  FormField,
  FormFieldError,
  Input,
} from '../../../components/primitives';
import { applyApiValidationErrors } from '../../../features/errors';
import {
  createRegisterSchema,
  getLocalizedAuthErrorMessage,
  type RegisterForm,
} from '../../../features/auth/authCopy';
import { AuthFormPage } from '../../../features/auth/ui/AuthFormPage';
import { AuthSignInLink } from '../../../features/auth/ui/AuthTextLink';
import { GoogleOAuthButton } from '../../../features/auth/ui/GoogleOAuthButton';
import { PasswordInput } from '../../../features/auth/ui/PasswordInput';
import { VerificationEmailCard } from '../../../features/auth/ui/VerificationEmailCard';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useI18n } from '../../../i18n';
import { isGoogleOAuthEnabled } from '../../../lib/googleOAuth';
import { legalDocumentVersionPath } from '../../../lib/origins';
import { sdk } from '../../../lib/sdk';
import { trackSignupCompleted } from '../../../features/analytics';
import { useAuthActionCooldown } from '../useAuthActionCooldown';

type RegistrationSuccessState = {
  bodyKey: string;
  canResendVerificationEmail: boolean;
  email: string;
};

const legalLinkClassName =
  'supporting-copy text-ink-3 underline underline-offset-2 hover:text-ink';

export function RegisterPage() {
  usePageTitle({ key: 'page.auth.register.title', fallback: 'Create account' });

  const [serverError, setServerError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] =
    useState<RegistrationSuccessState | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const {
    isCoolingDown: isResendCoolingDown,
    remainingSeconds: resendCooldownSecondsRemaining,
    startCooldown: startResendCooldown,
  } = useAuthActionCooldown();
  const { locale, t } = useI18n();
  const registerSchema = createRegisterSchema(t);

  const {
    control,
    register,
    clearErrors,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    defaultValues: {
      adultConfirmed: false,
      privacyPolicyAcknowledged: false,
      termsAccepted: false,
    },
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setServerError(null);
    setResendError(null);
    setResendMessage(null);
    clearErrors('handle');

    try {
      const { handle, ...registration } = data;

      await sdk.auth.register({
        ...registration,
        adultConfirmed: true,
        locale,
        privacyPolicyAcknowledged: true,
        privacyPolicyVersion: PUBLIC_LEGAL_DOCUMENT_METADATA.privacy.version,
        termsAccepted: true,
        termsVersion: PUBLIC_LEGAL_DOCUMENT_METADATA.terms.version,
        username: handle,
      });
      trackSignupCompleted();
      setRegistrationSuccess({
        bodyKey: 'auth.register.pendingBody',
        canResendVerificationEmail: true,
        email: data.email,
      });
    } catch (error: unknown) {
      if (
        applyApiValidationErrors(error, setError, {
          username: 'handle',
        }) > 0
      ) {
        return;
      }

      if (getApiErrorCode(error) === 'AUTH_USERNAME_ALREADY_TAKEN') {
        setError('handle', {
          message: t('auth.errors.usernameAlreadyTaken'),
          type: 'server',
        });
        return;
      }

      setServerError(
        getLocalizedAuthErrorMessage(error, t, 'auth.errors.registerFallback'),
      );
    }
  };

  const onResendVerificationEmail = async () => {
    if (!registrationSuccess || isResendCoolingDown) {
      return;
    }

    setIsResending(true);
    setResendError(null);
    setResendMessage(null);

    try {
      await sdk.auth.resendVerificationEmail({
        identifier: registrationSuccess.email,
        locale,
      });
      setResendMessage(t('auth.verificationResend.successBody'));
      startResendCooldown();
    } catch (error: unknown) {
      setResendError(
        getLocalizedAuthErrorMessage(
          error,
          t,
          'auth.errors.resendVerificationFallback',
        ),
      );
    } finally {
      setIsResending(false);
    }
  };

  if (registrationSuccess) {
    return (
      <VerificationEmailCard
        bodyKey={registrationSuccess.bodyKey}
        canResendVerificationEmail={
          registrationSuccess.canResendVerificationEmail
        }
        footerAction={
          <AuthSignInLink>{t('auth.register.backToSignIn')}</AuthSignInLink>
        }
        isResending={isResending}
        onResendVerificationEmail={onResendVerificationEmail}
        resendCooldownSecondsRemaining={resendCooldownSecondsRemaining}
        resendError={resendError}
        resendMessage={resendMessage}
      />
    );
  }

  return (
    <AuthFormPage
      key="form"
      title={
        <span className="text-app-entity-title font-normal">
          {t('auth.register.heading')}
        </span>
      }
    >
      <GoogleOAuthButton intent="register" />

      {isGoogleOAuthEnabled(import.meta.env) ? (
        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-rule" aria-hidden="true" />
          <span className="text-xs font-medium text-ink-3">
            {t('auth.google.orSeparator')}
          </span>
          <span className="h-px flex-1 bg-rule" aria-hidden="true" />
        </div>
      ) : null}

      {serverError && (
        <Alert variant="error" className="mb-4">
          {serverError}
        </Alert>
      )}

      <form
        autoComplete="on"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          label={t('auth.labels.email')}
          htmlFor="register-email"
          hideLabel
          error={errors.email?.message}
        >
          <Input
            {...register('email')}
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            floatingLabel
            id="register-email"
            inputMode="email"
            maxLength={EMAIL_MAX_LENGTH}
            type="email"
            placeholder={t('auth.labels.email')}
            spellCheck={false}
          />
        </FormField>

        <FormField
          label={t('auth.labels.username')}
          htmlFor="register-handle"
          hideLabel
          error={errors.handle?.message}
        >
          <Input
            {...register('handle')}
            autoCapitalize="none"
            autoComplete="nickname"
            autoCorrect="off"
            data-1p-ignore
            data-lpignore="true"
            floatingLabel
            id="register-handle"
            maxLength={USERNAME_MAX_LENGTH}
            placeholder={t('auth.labels.username')}
            spellCheck={false}
            type="text"
          />
        </FormField>

        <FormField
          label={t('auth.labels.password')}
          htmlFor="register-password"
          hideLabel
          error={errors.password?.message}
        >
          <PasswordInput
            {...register('password')}
            autoComplete="new-password"
            floatingLabel
            hidePasswordLabel={t('auth.login.hidePassword')}
            id="register-password"
            maxLength={PASSWORD_MAX_LENGTH}
            placeholder={t('auth.labels.password')}
            showPasswordLabel={t('auth.login.showPassword')}
          />
        </FormField>

        <div className="space-y-3 rounded-xl border border-rule bg-paper p-4">
          <label className="supporting-copy flex items-start gap-3 text-ink-2">
            <Controller
              control={control}
              name="adultConfirmed"
              render={({ field }) => (
                <Checkbox
                  aria-label={t('auth.register.adultConfirmed')}
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <span>{t('auth.register.adultConfirmed')}</span>
          </label>
          {errors.adultConfirmed && (
            <FormFieldError>{errors.adultConfirmed.message}</FormFieldError>
          )}

          <label className="supporting-copy flex items-start gap-3 text-ink-2">
            <Controller
              control={control}
              name="termsAccepted"
              render={({ field }) => (
                <Checkbox
                  aria-label={t('auth.register.acceptTerms.before')}
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <span>
              {t('auth.register.acceptTerms.before')}
              <Link
                className={legalLinkClassName}
                to={legalDocumentVersionPath(
                  'terms',
                  PUBLIC_LEGAL_DOCUMENT_METADATA.terms.version,
                )}
              >
                {t('auth.register.acceptTerms.link')}
              </Link>
              {t('auth.register.acceptTerms.after')}
            </span>
          </label>
          {errors.termsAccepted && (
            <FormFieldError>{errors.termsAccepted.message}</FormFieldError>
          )}

          <label className="supporting-copy flex items-start gap-3 text-ink-2">
            <Controller
              control={control}
              name="privacyPolicyAcknowledged"
              render={({ field }) => (
                <Checkbox
                  aria-label={t('auth.register.acknowledgePrivacy.before')}
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <span>
              {t('auth.register.acknowledgePrivacy.before')}
              <Link
                className={legalLinkClassName}
                to={legalDocumentVersionPath(
                  'privacy',
                  PUBLIC_LEGAL_DOCUMENT_METADATA.privacy.version,
                )}
              >
                {t('auth.register.acknowledgePrivacy.link')}
              </Link>
              {t('auth.register.acknowledgePrivacy.after')}
            </span>
          </label>
          {errors.privacyPolicyAcknowledged && (
            <FormFieldError>
              {errors.privacyPolicyAcknowledged.message}
            </FormFieldError>
          )}
        </div>

        <Button
          type="submit"
          isLoading={isSubmitting}
          loadingLabel={t('auth.register.submitting')}
          className="w-full justify-center"
        >
          {t('auth.register.submit')}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="supporting-copy text-ink-2">
          {t('auth.register.alreadyHaveAccount')}{' '}
          <AuthSignInLink>{t('auth.register.signIn')}</AuthSignInLink>
        </p>
      </div>
    </AuthFormPage>
  );
}
