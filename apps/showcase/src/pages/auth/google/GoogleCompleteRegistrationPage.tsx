import { zodResolver } from '@hookform/resolvers/zod';
import {
  buildAvatar,
  type AvatarUploadContentType,
  type MeResponse,
  USERNAME_MAX_LENGTH,
} from '@towelbooks/schemas';
import { PUBLIC_LEGAL_DOCUMENT_METADATA } from '@towelbooks/schemas/legal-documents';
import { getApiErrorCode } from '@towelbooks/sdk';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import {
  Alert,
  Button,
  Checkbox,
  FormField,
  FormFieldError,
  Input,
} from '../../../components/primitives';
import { EditableAvatarPreview } from '../../../components/appearance/EditableAvatarPreview';
import { useToast } from '../../../components/feedback';
import { applyApiValidationErrors } from '../../../features/errors';
import {
  createGoogleCompleteRegistrationSchema,
  getLocalizedAuthErrorMessage,
  type GoogleCompleteRegistrationForm,
} from '../../../features/auth/authCopy';
import { useAuth } from '../../../features/auth/AuthContext';
import { meQueryKey } from '../../../features/auth/meQuery';
import { AuthFormPage } from '../../../features/auth/ui/AuthFormPage';
import { AuthSignInLink } from '../../../features/auth/ui/AuthTextLink';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useI18n } from '../../../i18n';
import { legalDocumentVersionPath } from '../../../lib/origins';
import { sdk } from '../../../lib/sdk';

const legalLinkClassName =
  'supporting-copy text-ink-3 underline underline-offset-2 hover:text-ink';

let capturedOnboardingToken: string | null | undefined;
let captureResetScheduled = false;

function captureOnboardingToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (capturedOnboardingToken !== undefined) {
    return capturedOnboardingToken;
  }

  const token = new URLSearchParams(window.location.hash.slice(1)).get(
    'onboarding_token',
  );

  if (!token) {
    return null;
  }

  capturedOnboardingToken = token;
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${window.location.search}`,
  );

  if (!captureResetScheduled) {
    captureResetScheduled = true;
    queueMicrotask(() => {
      capturedOnboardingToken = undefined;
      captureResetScheduled = false;
    });
  }

  return token;
}

type GoogleOnboardingAvatarSelection =
  | { kind: 'google'; previewUrl: string }
  | { kind: 'initial' }
  | { kind: 'custom'; file: File; previewUrl: string };

export function GoogleCompleteRegistrationPage() {
  usePageTitle({
    key: 'page.auth.googleCompleteRegistration.title',
    fallback: 'Complete registration',
  });

  const [onboardingToken] = useState(captureOnboardingToken);
  const [avatarSelection, setAvatarSelection] =
    useState<GoogleOnboardingAvatarSelection | null>(null);
  const [avatarPreviewUnavailable, setAvatarPreviewUnavailable] =
    useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(
    Boolean(onboardingToken),
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [onboardingExpired, setOnboardingExpired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { stageToken, commitAuth } = useAuth();
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const { locale, t } = useI18n();
  const schema = createGoogleCompleteRegistrationSchema(t);

  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<GoogleCompleteRegistrationForm>({
    defaultValues: {
      adultConfirmed: false,
      displayName: '',
      privacyPolicyAcknowledged: false,
      termsAccepted: false,
    },
    resolver: zodResolver(schema),
  });

  const watchedDisplayName = useWatch({ control, name: 'displayName' }) ?? '';
  const watchedHandle = useWatch({ control, name: 'handle' }) ?? '';

  const previewDisplayName = watchedDisplayName.trim() || watchedHandle || '';

  const previewAvatar = buildAvatar({
    avatarImageUrl:
      avatarSelection?.kind === 'google' || avatarSelection?.kind === 'custom'
        ? avatarSelection.previewUrl
        : null,
    displayName: previewDisplayName,
    username: watchedHandle,
  });

  const avatarCleanupRef = useRef<() => void>(() => {});

  const selectAvatar = useCallback((next: GoogleOnboardingAvatarSelection) => {
    avatarCleanupRef.current();
    if (next.kind === 'google' || next.kind === 'custom') {
      avatarCleanupRef.current = () => URL.revokeObjectURL(next.previewUrl);
    } else {
      avatarCleanupRef.current = () => {};
    }
    setAvatarSelection(next);
  }, []);

  useEffect(() => {
    if (!onboardingToken) {
      return;
    }

    let cancelled = false;

    void sdk.auth
      .googleGetOnboarding(onboardingToken)
      .then(
        async ({
          avatarAvailable,
          suggestedDisplayName,
          suggestedUsername,
        }) => {
          if (cancelled) {
            return;
          }
          setValue('displayName', suggestedDisplayName ?? '', {
            shouldValidate: true,
          });
          setValue('handle', suggestedUsername, { shouldValidate: true });

          if (!avatarAvailable) {
            selectAvatar({ kind: 'initial' });
            return;
          }

          try {
            const preview =
              await sdk.auth.googleGetOnboardingAvatar(onboardingToken);
            if (cancelled) {
              return;
            }
            selectAvatar({
              kind: 'google',
              previewUrl: URL.createObjectURL(preview),
            });
          } catch {
            if (!cancelled) {
              selectAvatar({ kind: 'initial' });
              setAvatarPreviewUnavailable(true);
            }
          }
        },
      )
      .catch((error: unknown) => {
        if (!cancelled) {
          if (getApiErrorCode(error) === 'UNAUTHENTICATED') {
            setOnboardingExpired(true);
          } else {
            setServerError(t('auth.errors.oauthFallback'));
          }
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingSuggestions(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [onboardingToken, selectAvatar, setValue, t]);

  useEffect(() => {
    return () => avatarCleanupRef.current();
  }, []);

  const onSubmit = async (data: GoogleCompleteRegistrationForm) => {
    if (!onboardingToken) {
      setServerError(t('auth.googleCompleteRegistration.expired'));
      return;
    }

    setServerError(null);
    setOnboardingExpired(false);
    setIsSubmitting(true);

    try {
      const { handle, ...registration } = data;
      const avatarChoice: 'google' | 'initial' =
        avatarSelection?.kind === 'google' ? 'google' : 'initial';

      const { displayName: rawDisplayName, ...booleans } = registration;
      const trimmedDisplayName = rawDisplayName?.trim();

      const result = await sdk.auth.googleCompleteRegistration(
        {
          ...(trimmedDisplayName ? { displayName: trimmedDisplayName } : {}),
          ...booleans,
          adultConfirmed: true,
          avatarChoice,
          locale,
          privacyPolicyAcknowledged: true,
          privacyPolicyVersion: PUBLIC_LEGAL_DOCUMENT_METADATA.privacy.version,
          termsAccepted: true,
          termsVersion: PUBLIC_LEGAL_DOCUMENT_METADATA.terms.version,
          username: handle,
        },
        onboardingToken,
      );

      await stageToken(result.accessToken, result.expiresInSeconds);

      if (result.avatarImportWarning) {
        pushToast({
          message: t('auth.googleCompleteRegistration.avatarImportWarningBody'),
          title: t('auth.googleCompleteRegistration.avatarImportWarningTitle'),
          variant: 'warning',
        });
      }

      if (avatarSelection?.kind === 'custom') {
        try {
          const uploadResult = await sdk.users.me.avatar.upload(
            avatarSelection.file,
            {
              contentType: avatarSelection.file.type as AvatarUploadContentType,
              sizeBytes: avatarSelection.file.size,
            },
          );

          const updatedUser = {
            ...result.user,
            avatar: uploadResult.avatar,
          };

          queryClient.setQueryData<MeResponse>(
            meQueryKey(result.user.id),
            (current) => {
              if (!current) return current;
              return { ...current, avatar: uploadResult.avatar };
            },
          );

          await commitAuth(updatedUser, result.hasPendingLegalAcceptances);
        } catch {
          pushToast({
            message: t(
              'auth.googleCompleteRegistration.avatarCustomUploadWarningBody',
            ),
            title: t(
              'auth.googleCompleteRegistration.avatarCustomUploadWarningTitle',
            ),
            variant: 'warning',
          });

          await commitAuth(result.user, result.hasPendingLegalAcceptances);
        }
      } else {
        await commitAuth(result.user, result.hasPendingLegalAcceptances);
      }

      navigate('/', { replace: true });
    } catch (error: unknown) {
      if (
        applyApiValidationErrors(error, setError, {
          username: 'handle',
        }) > 0
      ) {
        setIsSubmitting(false);
        return;
      }

      if (getApiErrorCode(error) === 'AUTH_USERNAME_ALREADY_TAKEN') {
        setError('handle', {
          message: t('auth.errors.usernameAlreadyTaken'),
          type: 'server',
        });
        setIsSubmitting(false);
        return;
      }

      setServerError(
        getLocalizedAuthErrorMessage(error, t, 'auth.errors.oauthFallback'),
      );
      setIsSubmitting(false);
    }
  };

  if (!onboardingToken) {
    return (
      <AuthFormPage title={t('auth.oauthError.heading')}>
        <Alert variant="error" className="mb-4">
          {t('auth.googleCompleteRegistration.expired')}
        </Alert>
        <AuthSignInLink>
          {t('auth.googleCompleteRegistration.backToSignIn')}
        </AuthSignInLink>
      </AuthFormPage>
    );
  }

  return (
    <AuthFormPage
      title={t('auth.googleCompleteRegistration.heading')}
      description={t('auth.googleCompleteRegistration.description')}
    >
      {serverError || onboardingExpired ? (
        <Alert variant="error" className="mb-4">
          {onboardingExpired
            ? t('auth.googleCompleteRegistration.expired')
            : serverError}
        </Alert>
      ) : null}

      <form
        autoComplete="on"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {isLoadingSuggestions ? (
          <p className="supporting-copy text-ink-3" aria-live="polite">
            {t('auth.googleCompleteRegistration.loading')}
          </p>
        ) : null}

        {avatarSelection !== null ? (
          <div className="flex justify-center py-2">
            <EditableAvatarPreview
              avatar={previewAvatar}
              name={previewDisplayName}
              disabled={isSubmitting}
              editAriaLabel={t('auth.googleCompleteRegistration.editAvatar')}
              onSelectFile={(file: File, previewUrl: string) => {
                selectAvatar({
                  kind: 'custom',
                  file,
                  previewUrl,
                });
              }}
              onRemove={() => {
                selectAvatar({ kind: 'initial' });
              }}
            />
          </div>
        ) : null}

        {avatarPreviewUnavailable ? (
          <Alert variant="warning">
            {t('auth.googleCompleteRegistration.avatarUnavailable')}
          </Alert>
        ) : null}

        <FormField
          label={t('auth.googleCompleteRegistration.displayName')}
          htmlFor="register-display-name"
          error={errors.displayName?.message}
        >
          <Input
            {...register('displayName')}
            autoComplete="name"
            id="register-display-name"
            maxLength={60}
            type="text"
          />
        </FormField>

        <FormField
          label={t('auth.labels.username')}
          htmlFor="register-handle"
          error={errors.handle?.message}
        >
          <Input
            {...register('handle')}
            autoCapitalize="none"
            autoComplete="nickname"
            autoCorrect="off"
            data-1p-ignore
            data-lpignore="true"
            id="register-handle"
            maxLength={USERNAME_MAX_LENGTH}
            spellCheck={false}
            type="text"
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
          {errors.adultConfirmed ? (
            <FormFieldError>{errors.adultConfirmed.message}</FormFieldError>
          ) : null}

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
          {errors.termsAccepted ? (
            <FormFieldError>{errors.termsAccepted.message}</FormFieldError>
          ) : null}

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
          {errors.privacyPolicyAcknowledged ? (
            <FormFieldError>
              {errors.privacyPolicyAcknowledged.message}
            </FormFieldError>
          ) : null}
        </div>

        <Button
          type="submit"
          isLoading={isSubmitting}
          loadingLabel={t('auth.googleCompleteRegistration.submitting')}
          className="w-full justify-center"
        >
          {t('auth.googleCompleteRegistration.submit')}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <AuthSignInLink>
          {t('auth.googleCompleteRegistration.backToSignIn')}
        </AuthSignInLink>
      </div>
    </AuthFormPage>
  );
}
