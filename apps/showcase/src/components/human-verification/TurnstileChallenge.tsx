import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { isValidHumanVerificationAction } from '@towelbooks/schemas';

import { useI18n } from '../../i18n';
import {
  loadTurnstileScript,
  type TurnstileApi,
  type TurnstileWidgetOptions,
} from './turnstile';

export type TurnstileChallengeHandle = Readonly<{
  reset: () => void;
}>;

export type TurnstileChallengeProps = Readonly<{
  action: string;
  className?: string;
  onError?: () => void;
  onTokenChange: (token: string | null) => void;
  showErrorMessage?: boolean;
}>;

type ChallengeStatus = 'loading' | 'success' | 'error' | 'expired' | 'timeout';
type WidgetHandle = Readonly<{
  api: TurnstileApi;
  id: string;
}>;

const EMPTY_CLASS_NAME = '';

function statusMessage(
  status: ChallengeStatus,
  t: ReturnType<typeof useI18n>['t'],
): string {
  switch (status) {
    case 'loading':
      return t('humanVerification.loading');
    case 'success':
      return t('humanVerification.success');
    case 'error':
      return t('humanVerification.error');
    case 'expired':
      return t('humanVerification.expired');
    case 'timeout':
      return t('humanVerification.timeout');
  }
}

export const TurnstileChallenge = forwardRef<
  TurnstileChallengeHandle,
  TurnstileChallengeProps
>(function TurnstileChallenge(
  { action, className, onError, onTokenChange, showErrorMessage = true },
  ref,
) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<WidgetHandle | null>(null);
  const onErrorRef = useRef(onError);
  const onTokenChangeRef = useRef(onTokenChange);
  const [status, setStatus] = useState<ChallengeStatus>('loading');
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();

  onErrorRef.current = onError;
  onTokenChangeRef.current = onTokenChange;

  const setChallengeStatus = useCallback((nextStatus: ChallengeStatus) => {
    if (nextStatus === 'error') {
      onErrorRef.current?.();
    }

    setStatus(nextStatus);
  }, []);

  const clearTokenAndReset = useCallback(
    (nextStatus: ChallengeStatus) => {
      onTokenChangeRef.current(null);
      setChallengeStatus(nextStatus);

      const widget = widgetRef.current;
      if (widget) {
        widget.api.reset(widget.id);
      }
    },
    [setChallengeStatus],
  );

  useImperativeHandle(
    ref,
    () => ({
      reset: () => clearTokenAndReset('loading'),
    }),
    [clearTokenAndReset],
  );

  useEffect(() => {
    let cancelled = false;

    onTokenChangeRef.current(null);
    setChallengeStatus('loading');

    const removeWidget = () => {
      const widget = widgetRef.current;
      widgetRef.current = null;
      if (widget) {
        widget.api.remove(widget.id);
      }
    };

    if (!siteKey || !isValidHumanVerificationAction(action)) {
      setChallengeStatus('error');
      return () => {
        onTokenChangeRef.current(null);
      };
    }

    void loadTurnstileScript()
      .then((api) => {
        if (cancelled || !containerRef.current) {
          return;
        }

        const renderWidget = () => {
          if (cancelled || !containerRef.current) {
            return;
          }

          const options: TurnstileWidgetOptions = {
            action,
            callback: (token) => {
              if (!token) {
                clearTokenAndReset('error');
                return;
              }

              onTokenChangeRef.current(token);
              setStatus('success');
            },
            'error-callback': () => clearTokenAndReset('error'),
            'expired-callback': () => clearTokenAndReset('expired'),
            sitekey: siteKey,
            'timeout-callback': () => clearTokenAndReset('timeout'),
          };

          try {
            widgetRef.current = {
              api,
              id: api.render(containerRef.current, options),
            };
          } catch {
            clearTokenAndReset('error');
          }
        };

        renderWidget();
      })
      .catch(() => {
        if (!cancelled) {
          onTokenChangeRef.current(null);
          setChallengeStatus('error');
        }
      });

    return () => {
      cancelled = true;
      removeWidget();
      onTokenChangeRef.current(null);
    };
  }, [action, clearTokenAndReset, setChallengeStatus, siteKey]);

  const resolvedClassName = className ?? EMPTY_CLASS_NAME;
  const message = statusMessage(status, t);
  const isError = status !== 'loading' && status !== 'success';

  return (
    <div className={resolvedClassName}>
      <div
        aria-label={t('humanVerification.label')}
        data-testid="turnstile-challenge"
        ref={containerRef}
      />
      {showErrorMessage || !isError ? (
        <p
          aria-live="polite"
          className="app-text-supporting-copy text-ink-3"
          role={isError ? 'alert' : 'status'}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
});
