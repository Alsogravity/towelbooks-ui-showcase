import { useState } from 'react';

import { GoogleLinkChallengeSection } from './GoogleLinkChallengeSection';
import { LoginFormSection } from './LoginFormSection';
import { LoginReactivationPanel } from './LoginReactivationPanel';
import { LoginVerificationPanel } from './LoginVerificationPanel';
import { OAuthReactivationSection } from './OAuthReactivationSection';
import { useLoginPageState } from './useLoginPageState';
import { demoAuthDescription } from '../../../demo/auth';
import { AuthFormPage } from '../../../features/auth/ui/AuthFormPage';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useI18n, type LocalizedText } from '../../../i18n';
import { useSearchParams } from 'react-router';

function hasChallengeToken(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.location.hash.includes('challenge_token=');
}

function hasReactivationToken(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.location.hash.includes('reactivation_token=');
}

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const [hasReactivationTokenAtEntry] = useState(hasReactivationToken);
  const oauth = searchParams.get('oauth');
  const oauthErrorReason = searchParams.get('reason') ?? undefined;
  const isReauthSuccess = oauth === 'reauth_success';
  const titleKey: LocalizedText =
    oauth === 'account_exists'
      ? {
          key: 'page.auth.oauthAccountExists.title' as const,
          fallback: 'Account already exists',
        }
      : oauth === 'error'
        ? {
            key: 'page.auth.oauthError.title' as const,
            fallback: 'Sign-in error',
          }
        : { key: 'page.auth.login.title' as const, fallback: 'Sign in' };

  usePageTitle(titleKey);

  const { locale, t } = useI18n();
  const {
    deleteAfterLabel,
    forgotPasswordEmail,
    form: {
      formState: { errors, isSubmitting },
      register,
    },
    handleLoginSubmit,
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
  } = useLoginPageState();

  if (hasChallengeToken()) {
    return (
      <AuthFormPage
        title={
          <span className="text-app-entity-title font-normal">
            {t('auth.google.linkChallenge.heading')}
          </span>
        }
      >
        <GoogleLinkChallengeSection />
      </AuthFormPage>
    );
  }

  if (hasReactivationTokenAtEntry || isReauthSuccess) {
    return <OAuthReactivationSection />;
  }

  return (
    <AuthFormPage
      description={demoAuthDescription(locale)}
      title={
        <span className="text-app-entity-title font-normal">
          {t('auth.login.heading')}
        </span>
      }
    >
      {verificationIdentifier ? (
        <LoginVerificationPanel
          isResendCoolingDown={isResendCoolingDown}
          isResending={isResending}
          onResendVerificationEmail={onResendVerificationEmail}
          resendCooldownSecondsRemaining={resendCooldownSecondsRemaining}
          resendError={resendError}
          resendMessage={resendMessage}
        />
      ) : null}

      {pendingReactivation ? (
        <LoginReactivationPanel
          deleteAfterLabel={deleteAfterLabel}
          isReactivating={isReactivating}
          onDismiss={onDismissReactivation}
          onReactivate={onReactivateAccount}
          reactivateError={reactivateError}
        />
      ) : null}

      <LoginFormSection
        errors={errors}
        forgotPasswordEmail={forgotPasswordEmail}
        isSubmitting={isSubmitting || isReactivating}
        onSubmit={handleLoginSubmit}
        register={register}
        serverError={serverError}
        showRecoveryLink={showRecoveryLink}
        oauthState={
          oauth === 'account_exists' || oauth === 'error' ? oauth : undefined
        }
        oauthErrorReason={oauth === 'error' ? oauthErrorReason : undefined}
        isFinalizing={oauthErrorReason === 'deletion_finalizing'}
        isLinkRequired={oauthErrorReason === 'link_required'}
        isSuspended={oauthErrorReason === 'access_suspended'}
      />
    </AuthFormPage>
  );
}
