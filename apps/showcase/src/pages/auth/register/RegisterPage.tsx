import { zodResolver } from '@hookform/resolvers/zod';
import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  USERNAME_MAX_LENGTH,
} from '@towelbooks/schemas';
import { PUBLIC_LEGAL_DOCUMENT_METADATA } from '@towelbooks/schemas/legal-documents';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router';

import {
  Button,
  Checkbox,
  FormField,
  FormFieldError,
  Input,
} from '../../../components/primitives';
import {
  createRegisterSchema,
  type RegisterForm,
} from '../../../features/auth/authCopy';
import { AuthFormPage } from '../../../features/auth/ui/AuthFormPage';
import { AuthSignInLink } from '../../../features/auth/ui/AuthTextLink';
import { GoogleOAuthButton } from '../../../features/auth/ui/GoogleOAuthButton';
import { PasswordInput } from '../../../features/auth/ui/PasswordInput';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useI18n } from '../../../i18n';
import { isGoogleOAuthEnabled } from '../../../lib/googleOAuth';
import { legalDocumentVersionPath } from '../../../lib/origins';

import {
  demoAuthDescription,
  demoRegisterDefaults,
  enterDemo,
} from '../../../demo/auth';

const legalLinkClassName =
  'supporting-copy text-ink-3 underline underline-offset-2 hover:text-ink';

export function RegisterPage() {
  usePageTitle({ key: 'page.auth.register.title', fallback: 'Create account' });

  const { locale, t } = useI18n();
  const registerSchema = createRegisterSchema(t);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    defaultValues: demoRegisterDefaults,
    resolver: zodResolver(registerSchema),
  });

  return (
    <AuthFormPage
      key="form"
      description={demoAuthDescription(locale)}
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

      <form
        autoComplete="on"
        onSubmit={handleSubmit(enterDemo)}
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
