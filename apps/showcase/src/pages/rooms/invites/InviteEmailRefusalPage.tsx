import { useEffect, useState } from 'react';

import { StatusPanel } from '../../../components/feedback';
import { PageStateShell } from '../../../components/layout';
import { ButtonLink } from '../../../components/primitives';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';
import { useOneTimeTokenSearchParam } from '../../../lib/useOneTimeTokenSearchParam';

type RefusalStatus = 'loading' | 'success' | 'error';

export function InviteEmailRefusalPage() {
  usePageTitle({
    key: 'page.invites.emailRefusal.title',
    fallback: 'Room invite email preference',
  });

  const token = useOneTimeTokenSearchParam();
  const { t } = useI18n();
  const [status, setStatus] = useState<RefusalStatus>('loading');
  const [errorKey, setErrorKey] = useState(
    'invites.emailRefusal.errorFallback',
  );

  useEffect(() => {
    const refuse = async () => {
      if (!token) {
        setErrorKey('invites.emailRefusal.errorMissingToken');
        setStatus('error');
        return;
      }

      try {
        await sdk.invites.refuseEmail({ token });
        setStatus('success');
      } catch {
        setErrorKey('invites.emailRefusal.errorFallback');
        setStatus('error');
      }
    };

    void refuse();
  }, [token]);

  if (status === 'loading') {
    return (
      <PageStateShell containerSize="narrow">
        <StatusPanel
          ariaLive="polite"
          body={t('invites.emailRefusal.loadingBody')}
          icon="mail"
          iconPulse
          title={t('invites.emailRefusal.loadingHeading')}
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
          body={t('invites.emailRefusal.successBody')}
          icon="check"
          title={t('invites.emailRefusal.successHeading')}
          tone="forest"
          actions={
            <ButtonLink to="/" className="w-full justify-center">
              {t('invites.emailRefusal.backHome')}
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
        body={t(errorKey)}
        icon="x"
        role="alert"
        title={t('invites.emailRefusal.errorHeading')}
        tone="brick"
        actions={
          <ButtonLink
            to="/"
            variant="secondary"
            className="w-full justify-center"
          >
            {t('invites.emailRefusal.backHome')}
          </ButtonLink>
        }
      />
    </PageStateShell>
  );
}
