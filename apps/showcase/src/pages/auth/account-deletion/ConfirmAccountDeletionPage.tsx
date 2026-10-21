import {
  ACCOUNT_DELETION_CONFIRM_PATH,
  ACCOUNT_DELETION_TOKEN_PARAM,
  ErrorCode,
} from '@towelbooks/schemas';
import { getApiErrorCode } from '@towelbooks/sdk';
import { useState } from 'react';

import { StatusPanel } from '../../../components/feedback';
import { PageStateShell } from '../../../components/layout';
import { Button, ButtonLink } from '../../../components/primitives';
import { buildLoginRedirectPath } from '../../../features/auth/redirects';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useI18n } from '../../../i18n';
import { invalidateSession } from '../../../lib/authSession';
import { GUEST_LOGIN_PATH } from '../../../lib/origins';
import { sdk } from '../../../lib/sdk';
import { useOneTimeTokenSearchParam } from '../../../lib/useOneTimeTokenSearchParam';

type ConfirmStatus = 'idle' | 'submitting' | 'success' | 'error';

function resolveErrorMessageKey(code: string | null): {
  messageKey: string;
  allowSignIn: boolean;
} {
  if (code === ErrorCode.UNAUTHENTICATED) {
    return {
      allowSignIn: true,
      messageKey: 'auth.accountDeletion.confirm.error.unauthenticated',
    };
  }

  if (code === ErrorCode.AUTH_INVALID_ACCOUNT_DELETION_TOKEN) {
    return {
      allowSignIn: false,
      messageKey: 'auth.accountDeletion.confirm.error.invalidToken',
    };
  }

  if (code === ErrorCode.ACCOUNT_DELETE_REQUIRES_ROOM_OWNERSHIP_TRANSFER) {
    return {
      allowSignIn: false,
      messageKey: 'auth.accountDeletion.confirm.error.ownershipTransfer',
    };
  }

  return {
    allowSignIn: false,
    messageKey: 'auth.accountDeletion.confirm.error.fallback',
  };
}

export function ConfirmAccountDeletionPage() {
  usePageTitle({
    key: 'page.auth.accountDeletionConfirm.title',
    fallback: 'Confirm account deletion',
  });

  const token = useOneTimeTokenSearchParam();
  const { t } = useI18n();
  const [status, setStatus] = useState<ConfirmStatus>('idle');
  const [errorMessageKey, setErrorMessageKey] = useState(
    'auth.accountDeletion.confirm.error.fallback',
  );
  const [allowSignIn, setAllowSignIn] = useState(false);

  // Re-authentication happens on a fresh sign-in, so carry the token through the
  // login redirect to bring the reader back to this confirmation on return.
  const signInPath = token
    ? buildLoginRedirectPath(
        `${ACCOUNT_DELETION_CONFIRM_PATH}?${ACCOUNT_DELETION_TOKEN_PARAM}=${encodeURIComponent(token)}`,
      )
    : GUEST_LOGIN_PATH;

  const handleConfirm = async () => {
    if (!token) {
      setAllowSignIn(false);
      setErrorMessageKey('auth.accountDeletion.confirm.error.invalidToken');
      setStatus('error');
      return;
    }

    setStatus('submitting');

    try {
      await sdk.auth.confirmAccountDeletion({ token });
      // The server has revoked every session; clear any stale authenticated UI.
      invalidateSession();
      setStatus('success');
    } catch (error: unknown) {
      const { allowSignIn: nextAllowSignIn, messageKey } =
        resolveErrorMessageKey(getApiErrorCode(error));
      setAllowSignIn(nextAllowSignIn);
      setErrorMessageKey(messageKey);
      setStatus('error');
    }
  };

  if (!token) {
    return (
      <PageStateShell containerSize="narrow">
        <StatusPanel
          ariaLive="assertive"
          body={t('auth.accountDeletion.confirm.error.invalidToken')}
          icon="x"
          role="alert"
          title={t('auth.accountDeletion.confirm.errorHeading')}
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

  if (status === 'success') {
    return (
      <PageStateShell containerSize="narrow">
        <StatusPanel
          ariaLive="polite"
          body={t('auth.accountDeletion.confirm.successBody')}
          icon="check"
          title={t('auth.accountDeletion.confirm.successHeading')}
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

  if (status === 'error') {
    return (
      <PageStateShell containerSize="narrow">
        <StatusPanel
          ariaLive="assertive"
          body={t(errorMessageKey)}
          icon="x"
          role="alert"
          title={t('auth.accountDeletion.confirm.errorHeading')}
          tone="brick"
          actions={
            allowSignIn ? (
              <ButtonLink to={signInPath} className="w-full justify-center">
                {t('auth.accountDeletion.confirm.signIn')}
              </ButtonLink>
            ) : (
              <ButtonLink
                to={GUEST_LOGIN_PATH}
                variant="secondary"
                className="w-full justify-center"
              >
                {t('auth.accountDeletion.backToSignIn')}
              </ButtonLink>
            )
          }
        />
      </PageStateShell>
    );
  }

  return (
    <PageStateShell containerSize="narrow">
      <StatusPanel
        body={t('auth.accountDeletion.confirm.body')}
        icon="triangle-alert"
        title={t('auth.accountDeletion.confirm.heading')}
        tone="brick"
        actions={
          <div className="flex w-full flex-col gap-3">
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirm}
              isLoading={status === 'submitting'}
              loadingLabel={t('auth.accountDeletion.confirm.submitting')}
              className="w-full justify-center"
            >
              {t('auth.accountDeletion.confirm.action')}
            </Button>
            <ButtonLink
              to={GUEST_LOGIN_PATH}
              variant="secondary"
              className="w-full justify-center"
            >
              {t('auth.accountDeletion.backToSignIn')}
            </ButtonLink>
          </div>
        }
      />
    </PageStateShell>
  );
}
