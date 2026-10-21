import { ErrorCode } from '@towelbooks/schemas';
import { getApiErrorCode } from '@towelbooks/sdk';
import { useEffect, useState } from 'react';

import { StatusPanel } from '../../../components/feedback';
import { PageStateShell } from '../../../components/layout';
import { ButtonLink } from '../../../components/primitives';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useI18n } from '../../../i18n';
import { GUEST_LOGIN_PATH } from '../../../lib/origins';
import { sdk } from '../../../lib/sdk';
import { useOneTimeTokenSearchParam } from '../../../lib/useOneTimeTokenSearchParam';

type CancelStatus = 'loading' | 'success' | 'error';

export function CancelAccountDeletionPage() {
  usePageTitle({
    key: 'page.auth.accountDeletionCancel.title',
    fallback: 'Cancel account deletion',
  });

  const token = useOneTimeTokenSearchParam();
  const { t } = useI18n();
  const [status, setStatus] = useState<CancelStatus>('loading');
  const [errorMessageKey, setErrorMessageKey] = useState(
    'auth.accountDeletion.cancel.error.fallback',
  );

  useEffect(() => {
    const cancel = async () => {
      if (!token) {
        setErrorMessageKey('auth.accountDeletion.cancel.error.invalidToken');
        setStatus('error');
        return;
      }

      try {
        await sdk.auth.cancelAccountDeletion({ token });
        setStatus('success');
      } catch (error: unknown) {
        setErrorMessageKey(
          getApiErrorCode(error) ===
            ErrorCode.AUTH_INVALID_ACCOUNT_DELETION_TOKEN
            ? 'auth.accountDeletion.cancel.error.invalidToken'
            : 'auth.accountDeletion.cancel.error.fallback',
        );
        setStatus('error');
      }
    };

    void cancel();
  }, [token]);

  if (status === 'loading') {
    return (
      <PageStateShell containerSize="narrow">
        <StatusPanel
          ariaLive="polite"
          body={t('auth.accountDeletion.cancel.loadingBody')}
          icon="mail"
          iconPulse
          title={t('auth.accountDeletion.cancel.loadingHeading')}
          tone="neutral"
        />
      </PageStateShell>
    );
  }

  if (status === 'success') {
    return (
      <PageStateShell containerSize="narrow">
        <StatusPanel
          ariaLive="polite"
          body={t('auth.accountDeletion.cancel.successBody')}
          icon="check"
          title={t('auth.accountDeletion.cancel.successHeading')}
          tone="forest"
          actions={
            <ButtonLink to={GUEST_LOGIN_PATH} className="w-full justify-center">
              {t('auth.accountDeletion.backToSignIn')}
            </ButtonLink>
          }
        />
      </PageStateShell>
    );
  }

  return (
    <PageStateShell containerSize="narrow">
      <StatusPanel
        ariaLive="assertive"
        body={t(errorMessageKey)}
        icon="x"
        role="alert"
        title={t('auth.accountDeletion.cancel.errorHeading')}
        tone="brick"
        actions={
          <ButtonLink
            to={GUEST_LOGIN_PATH}
            variant="secondary"
            className="w-full justify-center"
          >
            {t('auth.accountDeletion.backToSignIn')}
          </ButtonLink>
        }
      />
    </PageStateShell>
  );
}
