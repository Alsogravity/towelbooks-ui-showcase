import { zodResolver } from '@hookform/resolvers/zod';
import { EMAIL_MAX_LENGTH } from '@towelbooks/schemas';
import { useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';

import { StatusPanel } from '../../../components/feedback';
import {
  Alert,
  Button,
  FormField,
  Input,
} from '../../../components/primitives';
import { applyApiValidationErrors } from '../../../features/errors';
import {
  createForgotPasswordSchema,
  getLocalizedAuthErrorMessage,
  type ForgotPasswordForm,
} from '../../../features/auth/authCopy';
import { AuthFormPage } from '../../../features/auth/ui/AuthFormPage';
import { AuthStatusPage } from '../../../features/auth/ui/AuthStatusPage';
import { AuthSignInLink } from '../../../features/auth/ui/AuthTextLink';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';

export function ForgotPasswordPage() {
  usePageTitle({
    key: 'page.auth.forgotPassword.title',
    fallback: 'Forgot password',
  });

  const { locale, t } = useI18n();
  const forgotPasswordSchema = createForgotPasswordSchema(t);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get('email');

  useEffect(() => {
    if (emailFromQuery) {
      setValue('email', emailFromQuery);
    }
  }, [emailFromQuery, setValue]);

  const onSubmit = async (data: ForgotPasswordForm) => {
    setServerError(null);

    try {
      await sdk.auth.forgotPassword({
        ...data,
        locale,
      });
      setIsSuccess(true);
    } catch (error: unknown) {
      if (applyApiValidationErrors(error, setError) > 0) {
        return;
      }

      setServerError(
        getLocalizedAuthErrorMessage(
          error,
          t,
          'auth.errors.forgotPasswordFallback',
        ),
      );
    }
  };

  const handleSendAnother = () => {
    setIsSuccess(false);
    setServerError(null);
  };

  if (isSuccess) {
    const submittedEmail = getValues('email');
    const successBody = t('auth.forgotPassword.successBody');
    const commaIndex = successBody.indexOf(',');

    let formattedBody: ReactNode = successBody;
    if (commaIndex !== -1) {
      const part1 = successBody.slice(0, commaIndex + 1);
      const part2 = successBody.slice(commaIndex + 1).trim();
      formattedBody = (
        <>
          <span className="whitespace-nowrap">{part1}</span>
          <br />
          <span className="whitespace-nowrap">{part2}</span>
        </>
      );
    }

    return (
      <AuthStatusPage>
        <StatusPanel
          icon="check"
          tone="forest"
          eyebrow={t('auth.forgotPassword.sentEyebrow')}
          title={
            <span className="whitespace-nowrap">
              {t('auth.forgotPassword.successHeading')}
            </span>
          }
          body={formattedBody}
        />

        {submittedEmail && (
          <Alert variant="success">
            {t('auth.forgotPassword.sentTo', {
              values: { email: submittedEmail },
            })}
          </Alert>
        )}

        <Button
          type="button"
          variant="secondary"
          className="w-full justify-center"
          onClick={handleSendAnother}
        >
          {t('auth.forgotPassword.sendAnother')}
        </Button>

        <div className="text-center">
          <AuthSignInLink>
            {t('auth.forgotPassword.backToSignIn')}
          </AuthSignInLink>
        </div>
      </AuthStatusPage>
    );
  }

  return (
    <AuthFormPage
      key="form"
      title={t('auth.forgotPassword.title')}
      description={t('auth.forgotPassword.description')}
    >
      {serverError && (
        <Alert variant="error" className="mb-4">
          {serverError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label={t('auth.labels.email')}
          htmlFor="forgot-password-email"
          hideLabel
          error={errors.email?.message}
        >
          <Input
            {...register('email')}
            floatingLabel
            id="forgot-password-email"
            maxLength={EMAIL_MAX_LENGTH}
            type="email"
            placeholder={t('auth.labels.email')}
          />
        </FormField>

        <Button
          type="submit"
          isLoading={isSubmitting}
          loadingLabel={t('auth.forgotPassword.submitting')}
          className="w-full justify-center"
        >
          {t('auth.forgotPassword.submit')}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <AuthSignInLink>{t('auth.forgotPassword.backToSignIn')}</AuthSignInLink>
      </div>
    </AuthFormPage>
  );
}
