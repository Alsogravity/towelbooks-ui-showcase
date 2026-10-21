import { zodResolver } from '@hookform/resolvers/zod';
import {
  ApiRequestError,
  getApiErrorCode,
  getApiProblemDetails,
} from '@towelbooks/sdk';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';

import { useAuth } from '../../../features/auth/AuthContext';
import { applyApiValidationErrors } from '../../../features/errors';
import {
  createLoginSchema,
  getLocalizedAuthErrorMessage,
  type LoginForm,
} from '../../../features/auth/authCopy';
import { resolvePostLoginRedirect } from '../../../features/auth/redirects';
import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';
import { trackLogin } from '../../../features/analytics';
import { useAuthActionCooldown } from '../useAuthActionCooldown';

type PendingReactivation = {
  deleteAfter: string | null;
  identifier: string;
  password: string;
};

function readDeleteAfter(error: unknown): string | null {
  if (error instanceof ApiRequestError) {
    const details = getApiProblemDetails<{ deleteAfter?: unknown }>(error);
    return typeof details?.deleteAfter === 'string'
      ? details.deleteAfter
      : null;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'details' in error &&
    typeof error.details === 'object' &&
    error.details !== null &&
    'deleteAfter' in error.details &&
    typeof error.details.deleteAfter === 'string'
  ) {
    return error.details.deleteAfter;
  }

  return null;
}

export function useLoginPageState() {
  const { login } = useAuth();
  const { formatDateTime, locale, t } = useI18n();
  const loginSchema = createLoginSchema(t);
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showRecoveryLink, setShowRecoveryLink] = useState(false);
  const [verificationIdentifier, setVerificationIdentifier] = useState<
    string | null
  >(null);
  const [pendingReactivation, setPendingReactivation] =
    useState<PendingReactivation | null>(null);
  const [reactivateError, setReactivateError] = useState<string | null>(null);
  const [isReactivating, setIsReactivating] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const {
    isCoolingDown: isResendCoolingDown,
    remainingSeconds: resendCooldownSecondsRemaining,
    startCooldown: startResendCooldown,
  } = useAuthActionCooldown();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const identifierValue = useWatch({
    control: form.control,
    name: 'identifier',
  });

  const completeSignIn = async (result: {
    accessToken: string;
    expiresInSeconds: number;
    hasPendingLegalAcceptances: boolean;
    user: Parameters<typeof login>[1];
  }) => {
    await login(
      result.accessToken,
      result.user,
      result.hasPendingLegalAcceptances,
      result.expiresInSeconds,
    );
    trackLogin();
    navigate(
      resolvePostLoginRedirect({
        search: location.search,
        state: location.state,
      }),
      { replace: true },
    );
  };

  const onSubmit = async (data: LoginForm) => {
    // Intentionally do not clear `serverError` here: a previous failure stays
    // visible while a retry is in flight, and is only replaced once this
    // attempt resolves.
    setVerificationIdentifier(null);
    setPendingReactivation(null);
    setReactivateError(null);
    setResendError(null);
    setResendMessage(null);

    try {
      const result = await sdk.auth.login({
        ...data,
        locale,
      });
      await completeSignIn(result);
    } catch (error: unknown) {
      if (applyApiValidationErrors(error, form.setError) > 0) {
        setServerError(null);
        setShowRecoveryLink(false);
        return;
      }

      const errorCode = getApiErrorCode(error);

      if (errorCode === 'AUTH_EMAIL_NOT_VERIFIED') {
        setServerError(null);
        setShowRecoveryLink(false);
        setVerificationIdentifier(data.identifier);
        return;
      }

      if (errorCode === 'AUTH_ACCOUNT_PENDING_DELETION') {
        setServerError(null);
        setShowRecoveryLink(false);
        setPendingReactivation({
          deleteAfter: readDeleteAfter(error),
          identifier: data.identifier,
          password: data.password,
        });
        return;
      }

      setShowRecoveryLink(errorCode === 'AUTH_INVALID_CREDENTIALS');
      setServerError(
        getLocalizedAuthErrorMessage(error, t, 'auth.errors.signInFallback'),
      );
    }
  };

  const onResendVerificationEmail = async () => {
    if (!verificationIdentifier || isResendCoolingDown) {
      return;
    }

    setIsResending(true);
    setResendError(null);
    setResendMessage(null);

    try {
      await sdk.auth.resendVerificationEmail({
        identifier: verificationIdentifier,
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

  const onReactivateAccount = async () => {
    if (!pendingReactivation) {
      return;
    }

    setIsReactivating(true);
    setReactivateError(null);

    try {
      const result = await sdk.auth.reactivateAccount({
        identifier: pendingReactivation.identifier,
        locale,
        password: pendingReactivation.password,
      });
      setPendingReactivation(null);
      await completeSignIn(result);
    } catch (error: unknown) {
      setReactivateError(
        getLocalizedAuthErrorMessage(error, t, 'auth.errors.signInFallback'),
      );
    } finally {
      setIsReactivating(false);
    }
  };

  const onDismissReactivation = () => {
    setPendingReactivation(null);
    setReactivateError(null);
  };

  const deleteAfterLabel =
    pendingReactivation?.deleteAfter != null
      ? formatDateTime(pendingReactivation.deleteAfter)
      : null;

  return {
    deleteAfterLabel,
    forgotPasswordEmail:
      identifierValue != null && identifierValue.includes('@')
        ? identifierValue
        : null,
    form,
    handleLoginSubmit: form.handleSubmit(onSubmit),
    isReactivating,
    isResendCoolingDown,
    isResending,
    onDismissReactivation,
    onReactivateAccount,
    onResendVerificationEmail,
    pendingReactivation,
    reactivateError,
    resendCooldownSecondsRemaining,
    resendError,
    resendMessage,
    serverError,
    showRecoveryLink,
    verificationIdentifier,
  };
}
