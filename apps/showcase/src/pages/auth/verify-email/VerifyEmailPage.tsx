import { useEffect, useRef, useState } from 'react';

import { StatusPanel } from '../../../components/feedback';
import { ButtonLink } from '../../../components/primitives';
import { getLocalizedAuthErrorMessage } from '../../../features/auth/authCopy';
import { AuthStatusPage } from '../../../features/auth/ui/AuthStatusPage';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useI18n } from '../../../i18n';
import { GUEST_LOGIN_PATH } from '../../../lib/origins';
import { sdk } from '../../../lib/sdk';
import { useOneTimeTokenSearchParam } from '../../../lib/useOneTimeTokenSearchParam';

type VerifyEmailStatus = 'loading' | 'success' | 'error';

export function VerifyEmailPage() {
  usePageTitle({
    key: 'page.auth.verifyEmail.title',
    fallback: 'Verify email',
  });

  const token = useOneTimeTokenSearchParam();
  const submittedTokenRef = useRef<string | null>(null);
  const { t } = useI18n();
  const [status, setStatus] = useState<VerifyEmailStatus>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage(t('auth.errors.invalidVerificationToken'));
        return;
      }

      if (submittedTokenRef.current === token) {
        return;
      }

      submittedTokenRef.current = token;

      try {
        await sdk.auth.verifyEmail({ token });
        setStatus('success');
      } catch (error: unknown) {
        setStatus('error');
        setMessage(
          getLocalizedAuthErrorMessage(
            error,
            t,
            'auth.errors.verifyEmailFallback',
          ),
        );
      }
    };

    void verify();
  }, [t, token]);

  if (status === 'loading') {
    return (
      <AuthStatusPage>
        <StatusPanel
          icon="mail"
          iconPulse
          tone="brick"
          title={t('auth.verifyEmail.loadingHeading')}
          body={t('auth.verifyEmail.loadingBody')}
        />
      </AuthStatusPage>
    );
  }

  if (status === 'success') {
    return (
      <AuthStatusPage>
        <StatusPanel
          icon="check"
          tone="forest"
          title={t('auth.verifyEmail.successHeading')}
          body={t('auth.verifyEmail.successBody')}
          actions={
            <ButtonLink to={GUEST_LOGIN_PATH} className="w-full justify-center">
              {t('auth.verifyEmail.backToSignIn')}
            </ButtonLink>
          }
        />
      </AuthStatusPage>
    );
  }

  return (
    <AuthStatusPage>
      <StatusPanel
        icon="x"
        tone="brick"
        title={t('auth.verifyEmail.errorHeading')}
        body={message}
        actions={
          <ButtonLink
            to={GUEST_LOGIN_PATH}
            variant="secondary"
            className="w-full justify-center"
          >
            {t('auth.verifyEmail.backToSignIn')}
          </ButtonLink>
        }
      />
    </AuthStatusPage>
  );
}
