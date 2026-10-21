import { PASSWORD_MAX_LENGTH } from '@towelbooks/schemas';
import { getApiErrorCode } from '@towelbooks/sdk';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { Alert, Button, FormField } from '../../../components/primitives';
import { useAuth } from '../../../features/auth/AuthContext';
import { getLocalizedAuthErrorMessage } from '../../../features/auth/authCopy';
import { AuthTextLink } from '../../../features/auth/ui/AuthTextLink';
import { PasswordInput } from '../../../features/auth/ui/PasswordInput';
import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';

interface ChallengeForm {
  password: string;
}

export function GoogleLinkChallengeSection() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { login } = useAuth();

  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  const challengeToken = hash
    .replace(/^#/, '')
    .split('&')
    .find((p) => p.startsWith('challenge_token='))
    ?.split('=')[1];

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState } = useForm<ChallengeForm>();

  const onSubmit = async (data: ChallengeForm) => {
    if (!challengeToken) {
      return;
    }

    setServerError(null);
    setIsSubmitting(true);

    try {
      const result = await sdk.auth.googleLinkChallenge({
        challengeToken: decodeURIComponent(challengeToken),
        password: data.password,
      });

      // Clear the hash from the URL without triggering a page reload
      window.history.replaceState(null, '', window.location.pathname);

      await login(
        result.accessToken,
        result.user,
        result.hasPendingLegalAcceptances,
        result.expiresInSeconds,
      );
      navigate('/', { replace: true });
    } catch (error: unknown) {
      const errorCode = getApiErrorCode(error);

      const fallbackKey =
        errorCode === 'AUTH_INVALID_CREDENTIALS'
          ? 'auth.errors.invalidCredentials'
          : 'auth.errors.oauthFallback';

      setServerError(getLocalizedAuthErrorMessage(error, t, fallbackKey));
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <p className="mb-4 text-sm text-ink-2">
        {t('auth.google.linkChallenge.body')}
      </p>

      {serverError && (
        <Alert variant="error" className="mb-4">
          {serverError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          label={t('auth.labels.password')}
          htmlFor="challenge-password"
          hideLabel
          error={formState.errors.password?.message}
        >
          <PasswordInput
            {...register('password', {
              required: 'Password is required',
              minLength: {
                message: t('auth.validation.passwordMinLength'),
                value: 12,
              },
              maxLength: PASSWORD_MAX_LENGTH,
            })}
            autoComplete="current-password"
            floatingLabel
            hidePasswordLabel={t('auth.login.hidePassword')}
            id="challenge-password"
            maxLength={PASSWORD_MAX_LENGTH}
            placeholder={t('auth.labels.password')}
            showPasswordLabel={t('auth.login.showPassword')}
          />
        </FormField>

        <Button
          type="submit"
          isLoading={isSubmitting}
          loadingLabel={t('auth.google.linkChallenge.submitting')}
          className="w-full justify-center"
        >
          {t('auth.google.linkChallenge.submit')}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <AuthTextLink to="/login">
          {t('auth.google.linkChallenge.cancelFallback')}
        </AuthTextLink>
      </div>
    </>
  );
}
