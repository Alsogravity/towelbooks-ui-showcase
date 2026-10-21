import { EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH } from '@towelbooks/schemas';

import {
  Alert,
  Button,
  ButtonLink,
  Divider,
  FormField,
  Input,
} from '../../../components/primitives';
import {
  AuthSignInLink,
  AuthTextLink,
} from '../../../features/auth/ui/AuthTextLink';
import { GoogleOAuthButton } from '../../../features/auth/ui/GoogleOAuthButton';
import { PasswordInput } from '../../../features/auth/ui/PasswordInput';
import { useI18n } from '../../../i18n';
import { isGoogleOAuthEnabled } from '../../../lib/googleOAuth';

import type { LoginForm } from '../../../features/auth/authCopy';
import type { FormEventHandler } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';

function forgotPasswordLink(email: string | null): string {
  if (email) {
    return `/forgot-password?email=${encodeURIComponent(email)}`;
  }
  return '/forgot-password';
}

const oauthErrorMessages: Record<string, string> = {
  auth_too_weak: 'auth.oauthError.authTooWeak',
  auth_time_missing: 'auth.oauthError.authTimeMissing',
  auth_time_too_old: 'auth.oauthError.authTimeTooOld',
  deletion_finalizing: 'auth.oauthError.deletionFinalizing',
  link_required: 'auth.oauthError.linkRequired',
  access_suspended: 'auth.oauthError.accessSuspended',
  reauth_identity_mismatch: 'auth.oauthError.reauthIdentityMismatch',
  reauth_stale_auth: 'auth.oauthError.reauthStaleAuth',
  oauth_invalid: 'auth.oauthError.oauthInvalid',
};

function StrongAuthGuidance({
  reason,
  t,
}: {
  reason: string;
  t: (key: string) => string;
}) {
  const items =
    reason === 'auth_too_weak'
      ? ['auth.oauthError.mfaRequired']
      : reason === 'auth_time_too_old'
        ? ['auth.oauthError.googleSessionRefresh']
        : [
            'auth.oauthError.mfaRequired',
            'auth.oauthError.googleSessionRefresh',
          ];

  return (
    <>
      <p>{t('auth.oauthError.strongAuthIntro')}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5" role="list">
        {items.map((item) => (
          <li key={item}>{t(item)}</li>
        ))}
      </ul>
    </>
  );
}

const RETRYABLE_OAUTH_REASONS = new Set([
  'reauth_stale_auth',
  'reauth_identity_mismatch',
  'auth_too_weak',
  'auth_time_missing',
  'auth_time_too_old',
]);

export function LoginFormSection({
  errors,
  forgotPasswordEmail,
  isSubmitting,
  onSubmit,
  register,
  serverError,
  showRecoveryLink,
  oauthState,
  oauthErrorReason,
  isFinalizing = false,
  isLinkRequired = false,
  isSuspended = false,
}: {
  errors: FieldErrors<LoginForm>;
  forgotPasswordEmail: string | null;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  register: UseFormRegister<LoginForm>;
  serverError: string | null;
  showRecoveryLink: boolean;
  oauthState?: 'account_exists' | 'error';
  oauthErrorReason?: string;
  isFinalizing?: boolean;
  isLinkRequired?: boolean;
  isSuspended?: boolean;
}) {
  const { t } = useI18n();
  const googleEnabled = isGoogleOAuthEnabled(import.meta.env);

  const oauthErrorMessageKey =
    oauthState === 'error' && oauthErrorReason
      ? oauthErrorMessages[oauthErrorReason]
      : undefined;

  return (
    <>
      <GoogleOAuthButton intent="sign_in" />

      {oauthState === 'account_exists' ? (
        <div className="mt-4 space-y-3 rounded-xl border border-rule bg-paper p-4">
          <p className="text-sm text-ink-2">
            {t('auth.oauthAccountExists.body')}
          </p>
          <div className="text-center">
            <AuthSignInLink>
              {t('auth.oauthAccountExists.signInAction')}
            </AuthSignInLink>
          </div>
        </div>
      ) : null}

      {oauthState === 'error' ? (
        <Alert variant="error" className="mt-4">
          {oauthErrorReason && RETRYABLE_OAUTH_REASONS.has(oauthErrorReason) ? (
            <StrongAuthGuidance reason={oauthErrorReason} t={t} />
          ) : (
            t(oauthErrorMessageKey ?? 'auth.oauthError.body')
          )}
        </Alert>
      ) : null}

      {oauthState !== 'error' &&
      oauthErrorReason &&
      RETRYABLE_OAUTH_REASONS.has(oauthErrorReason) ? (
        <div className="mt-4 space-y-3 rounded-xl border border-rule bg-paper p-4">
          <div className="text-sm text-ink-2">
            <StrongAuthGuidance reason={oauthErrorReason} t={t} />
          </div>
          <div className="text-center">
            <GoogleOAuthButton intent="sign_in" />
          </div>
        </div>
      ) : null}

      {isFinalizing ? (
        <div className="mt-4 space-y-3 rounded-xl border border-rule bg-paper p-4">
          <p className="text-sm text-ink-2">
            {t('auth.oauthError.deletionFinalizing')}
          </p>
        </div>
      ) : null}

      {isLinkRequired ? (
        <div className="mt-4 space-y-3 rounded-xl border border-rule bg-paper p-4">
          <p className="text-sm text-ink-2">
            {t('auth.oauthError.linkRequired')}
          </p>
          <div className="text-center">
            <AuthSignInLink>
              {t('auth.oauthAccountExists.signInAction')}
            </AuthSignInLink>
          </div>
        </div>
      ) : null}

      {isSuspended ? (
        <div className="mt-4 space-y-3 rounded-xl border border-rule bg-paper p-4">
          <p className="text-sm text-ink-2">
            {t('auth.oauthError.accessSuspended')}
          </p>
        </div>
      ) : null}

      {googleEnabled ? (
        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-rule" aria-hidden="true" />
          <span className="text-xs font-medium text-ink-3">
            {t('auth.google.orSeparator')}
          </span>
          <span className="h-px flex-1 bg-rule" aria-hidden="true" />
        </div>
      ) : null}

      {serverError ? (
        <div className="mb-4 space-y-2">
          <Alert variant="error">{serverError}</Alert>
          {showRecoveryLink ? (
            <p className="supporting-copy text-center text-ink-2">
              <AuthTextLink to={forgotPasswordLink(forgotPasswordEmail)}>
                {t('auth.login.needHelp')}
              </AuthTextLink>
            </p>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormField
          label={t('auth.labels.emailOrUsername')}
          htmlFor="identifier"
          hideLabel
          error={errors.identifier?.message}
        >
          <Input
            {...register('identifier')}
            autoCapitalize="none"
            autoComplete="username"
            autoCorrect="off"
            floatingLabel
            id="identifier"
            maxLength={EMAIL_MAX_LENGTH}
            type="text"
            placeholder={t('auth.labels.emailOrUsername')}
            spellCheck={false}
          />
        </FormField>

        <FormField
          label={t('auth.labels.password')}
          htmlFor="password"
          hideLabel
          error={errors.password?.message}
        >
          <PasswordInput
            {...register('password')}
            autoComplete="current-password"
            floatingLabel
            hidePasswordLabel={t('auth.login.hidePassword')}
            id="password"
            maxLength={PASSWORD_MAX_LENGTH}
            placeholder={t('auth.labels.password')}
            showPasswordLabel={t('auth.login.showPassword')}
          />
        </FormField>

        <div className="mt-2 flex flex-col gap-4">
          <Button
            type="submit"
            isLoading={isSubmitting}
            loadingLabel={t('auth.login.submitting')}
            className="w-full justify-center"
          >
            {t('auth.login.submit')}
          </Button>

          <div className="text-center">
            <AuthTextLink to={forgotPasswordLink(forgotPasswordEmail)}>
              {t('auth.login.forgotPassword')}
            </AuthTextLink>
          </div>
        </div>
      </form>

      <div className="my-6">
        <Divider />
      </div>

      <ButtonLink
        to="/register"
        variant="secondary"
        className="w-full justify-center"
      >
        {t('auth.login.createAccount')}
      </ButtonLink>
    </>
  );
}
