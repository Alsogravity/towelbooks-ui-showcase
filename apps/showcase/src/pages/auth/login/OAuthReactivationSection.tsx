import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

import { Alert } from '../../../components/primitives/Alert';
import { Button } from '../../../components/primitives/Button';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { AuthFormPage } from '../../../features/auth/ui/AuthFormPage';
import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';
import { useAuth } from '../../../features/auth/AuthContext';
import { trackLogin } from '../../../features/analytics';
import { resolvePostLoginRedirect } from '../../../features/auth/redirects';

import { useLocation, useNavigate } from 'react-router';

interface ContinuationState {
  phase: 'loading' | 'ready' | 'success' | 'error';
  restorableUntil?: string | null;
  recentAuthenticationSatisfied?: boolean;
  message?: string;
}

function clearReactivationTokenFromHash(): boolean {
  if (typeof window === 'undefined') return false;
  const match = window.location.hash.match(/reactivation_token=([^&]+)/);
  if (!match) return false;
  // Clear the hash immediately — never keep the token in the URL
  window.history.replaceState(
    null,
    '',
    window.location.pathname + window.location.search,
  );
  return true;
}

export function OAuthReactivationSection() {
  const { formatDateTime, t } = useI18n();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(false);
  const [state, setState] = useState<ContinuationState>({ phase: 'loading' });
  const isReauthSuccess = searchParams.get('oauth') === 'reauth_success';

  // Clear the one-time fragment token and load context from the HttpOnly cookie.
  useEffect(() => {
    const hasReactivationToken = clearReactivationTokenFromHash();
    if (!hasReactivationToken && !isReauthSuccess) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ phase: 'error', message: '' });
      return;
    }

    sdk.auth
      .getReactivationContext()
      .then((ctx) => {
        if (!ctx.active) {
          setState({
            phase: 'error',
            message: t('auth.reactivation.continuationExpired'),
          });
          return;
        }
        setState({
          phase: 'ready',
          restorableUntil: ctx.restorableUntil,
          recentAuthenticationSatisfied: ctx.recentAuthenticationSatisfied,
        });
      })
      .catch(() => {
        setState({
          phase: 'error',
          message: t('auth.reactivation.continuationExpired'),
        });
      });
  }, [isReauthSuccess, t]);

  const onStartReauth = useCallback(() => {
    window.location.assign('/auth/google/reauth-start');
  }, []);

  const onConfirm = useCallback(async () => {
    if (state.phase !== 'ready' || !state.recentAuthenticationSatisfied) return;

    setIsConfirming(true);

    try {
      const result = await sdk.auth.confirmReactivationViaOauth();
      await login(
        result.accessToken,
        result.user,
        result.hasPendingLegalAcceptances,
        result.expiresInSeconds,
      );
      trackLogin();
      setIsConfirming(false);
      setState({ phase: 'success' });
      navigate(
        resolvePostLoginRedirect({
          search: location.search,
          state: location.state,
        }),
        { replace: true },
      );
    } catch (error: unknown) {
      setIsConfirming(false);
      const message =
        error instanceof Error
          ? t('auth.reactivation.confirmError')
          : t('auth.reactivation.confirmError');
      setState({ phase: 'error', message });
    }
  }, [state, login, navigate, location, t]);

  const onAbandon = useCallback(async () => {
    try {
      await sdk.auth.abandonReactivation();
    } catch {
      // Best-effort — the token may already be consumed
    }
    setState({ phase: 'error', message: '' });
  }, []);

  if (state.phase === 'loading') {
    return (
      <AuthFormPage
        title={
          <span className="text-app-entity-title font-normal">
            {t('auth.reactivation.title')}
          </span>
        }
      >
        <LoadingState />
      </AuthFormPage>
    );
  }

  if (state.phase === 'error' && !state.message) {
    return null;
  }

  if (state.phase === 'error' && state.message) {
    return (
      <AuthFormPage
        title={
          <span className="text-app-entity-title font-normal">
            {t('auth.reactivation.title')}
          </span>
        }
      >
        <Alert variant="error">{state.message}</Alert>
        <div className="mt-4">
          <Button variant="secondary" onClick={onAbandon}>
            {t('auth.reactivation.dismiss')}
          </Button>
        </div>
      </AuthFormPage>
    );
  }

  const restorableUntilLabel = state.restorableUntil
    ? formatDateTime(state.restorableUntil)
    : null;

  if (state.phase === 'ready' && !state.recentAuthenticationSatisfied) {
    return (
      <AuthFormPage
        title={
          <span className="text-app-entity-title font-normal">
            {t('auth.reactivation.title')}
          </span>
        }
      >
        <p className="text-app-entity-copy mb-4">
          {t('auth.reactivation.reauthRequired')}
        </p>
        {restorableUntilLabel ? (
          <p className="text-app-entity-copy mb-4">
            {t('auth.reactivation.restorableUntil', {
              values: { restorableUntil: restorableUntilLabel },
            })}
          </p>
        ) : null}
        <Button variant="primary" onClick={onStartReauth}>
          {t('auth.reactivation.continueWithGoogle')}
        </Button>
        <div className="mt-3">
          <Button variant="secondary" onClick={onAbandon}>
            {t('auth.reactivation.dismiss')}
          </Button>
        </div>
      </AuthFormPage>
    );
  }

  if (state.phase === 'ready' && state.recentAuthenticationSatisfied) {
    return (
      <AuthFormPage
        title={
          <span className="text-app-entity-title font-normal">
            {t('auth.reactivation.title')}
          </span>
        }
      >
        <p className="text-app-entity-copy mb-4">
          {t('auth.reactivation.confirmBody')}
        </p>
        {restorableUntilLabel ? (
          <p className="text-app-entity-copy mb-4">
            {t('auth.reactivation.restorableUntil', {
              values: { restorableUntil: restorableUntilLabel },
            })}
          </p>
        ) : null}
        <Button variant="primary" onClick={onConfirm} disabled={isConfirming}>
          {isConfirming
            ? t('auth.reactivation.confirming')
            : t('auth.reactivation.confirm')}
        </Button>
        <div className="mt-3">
          <Button
            variant="secondary"
            onClick={onAbandon}
            disabled={isConfirming}
          >
            {t('auth.reactivation.dismiss')}
          </Button>
        </div>
      </AuthFormPage>
    );
  }

  if (isConfirming) {
    return (
      <AuthFormPage
        title={
          <span className="text-app-entity-title font-normal">
            {t('auth.reactivation.title')}
          </span>
        }
      >
        <LoadingState label={t('auth.reactivation.confirming')} />
      </AuthFormPage>
    );
  }

  return null;
}
