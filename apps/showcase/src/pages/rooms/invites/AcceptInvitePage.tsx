import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { useNavigate } from 'react-router';

import { StatusPanel } from '../../../components/feedback';
import { PageStateShell } from '../../../components/layout';
import { Button, ButtonLink, Tag } from '../../../components/primitives';
import { handleApiProblem } from '../../../features/errors';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';
import { useOneTimeTokenSearchParam } from '../../../lib/useOneTimeTokenSearchParam';

type InviteAcceptErrorCode =
  | 'AUTH_EMAIL_NOT_VERIFIED'
  | 'ROOM_MEMBER_LIMIT_REACHED'
  | 'INVITE_EXPIRED'
  | 'INVITE_FORBIDDEN'
  | 'INVITE_INVALID';

const inviteAcceptErrorMessageKeys: Record<InviteAcceptErrorCode, string> = {
  AUTH_EMAIL_NOT_VERIFIED: 'invites.accept.error.emailNotVerified',
  ROOM_MEMBER_LIMIT_REACHED: 'invites.accept.error.roomFull',
  INVITE_EXPIRED: 'invites.accept.error.expired',
  INVITE_FORBIDDEN: 'invites.accept.error.forbidden',
  INVITE_INVALID: 'invites.accept.error.invalid',
};

type AcceptStatus = 'idle' | 'accepting' | 'success' | 'error';

function InviteAcceptShell({
  children,
  maxWidth = 'max-w-xl',
}: PropsWithChildren<{ maxWidth?: string }>) {
  return (
    <PageStateShell containerSize="narrow" stateClassName={maxWidth}>
      {children}
    </PageStateShell>
  );
}

export function AcceptInvitePage() {
  usePageTitle({ key: 'page.invites.accept.title', fallback: 'Accept invite' });

  const token = useOneTimeTokenSearchParam();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [status, setStatus] = useState<AcceptStatus>('idle');
  const [acceptedRoomId, setAcceptedRoomId] = useState<string | null>(null);
  const [errorHeadingKey, setErrorHeadingKey] = useState<string>(
    'invites.accept.errorTitle',
  );
  const [errorMessage, setErrorMessage] = useState('');
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, []);

  const handleAcceptInvite = async () => {
    if (!token || status === 'accepting') {
      return;
    }

    setStatus('accepting');
    setErrorMessage('');
    setErrorHeadingKey('invites.accept.errorTitle');

    try {
      const result = await sdk.invites.accept({ token });
      setAcceptedRoomId(result.roomId);
      setStatus('success');

      redirectTimeoutRef.current = setTimeout(() => {
        navigate(`/rooms/${result.roomId}`);
      }, 2000);
    } catch (error: unknown) {
      const handled = handleApiProblem(error, {
        fallbackKey: 'invites.accept.error.fallback',
        messageKeys: inviteAcceptErrorMessageKeys,
        t,
      });

      setErrorHeadingKey('invites.accept.errorTitle');
      setErrorMessage(handled.message);
      setStatus('error');
    }
  };

  if (!token) {
    return (
      <InviteAcceptShell maxWidth="max-w-md">
        <StatusPanel
          className="page-content-enter"
          icon="x"
          tone="brick"
          title={t('invites.accept.errorTitle')}
          body={t('invites.accept.error.missingToken')}
          actions={
            <ButtonLink to="/my-library" className="w-full justify-center">
              {t('invites.accept.action.dashboard')}
            </ButtonLink>
          }
        />
      </InviteAcceptShell>
    );
  }

  if (status === 'success' && acceptedRoomId) {
    return (
      <InviteAcceptShell>
        <StatusPanel
          className="page-content-enter"
          icon="check"
          tone="forest"
          title={t('invites.accept.successTitle')}
          body={t('invites.accept.successBody')}
          actions={
            <ButtonLink
              to={`/rooms/${acceptedRoomId}`}
              className="w-full justify-center"
            >
              {t('invites.accept.action.room')}
            </ButtonLink>
          }
        />
      </InviteAcceptShell>
    );
  }

  if (status === 'error') {
    return (
      <InviteAcceptShell>
        <StatusPanel
          className="page-content-enter"
          icon="x"
          tone="brick"
          title={t(errorHeadingKey)}
          body={errorMessage}
          actions={
            <ButtonLink to="/my-library" className="w-full justify-center">
              {t('invites.accept.action.dashboard')}
            </ButtonLink>
          }
        />
      </InviteAcceptShell>
    );
  }

  return (
    <InviteAcceptShell>
      <div className="page-content-enter space-y-6 text-center">
        <div className="space-y-3">
          <p className="eyebrow">{t('invites.accept.joinEyebrow')}</p>
          <h2 className="app-text-page-title text-ink">
            {t('invites.accept.joinTitle')}
          </h2>
          <p className="hero-body mx-auto max-w-2xl text-ink-3">
            {t('invites.accept.joinBody')}
          </p>
        </div>

        <div className="rounded-md border border-rule bg-vellum p-5 text-left shadow-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="app-text-entity-subtitle font-display italic text-ink">
                {t('invites.accept.detailTitle')}
              </p>
              <p className="surface-note text-ink-3">
                {t('invites.accept.detailBody')}
              </p>
            </div>
            <Tag variant="private">{t('invites.accept.tag.private')}</Tag>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ButtonLink
            to="/my-library"
            variant="secondary"
            className="w-full justify-center"
          >
            {t('invites.accept.action.decline')}
          </ButtonLink>
          <Button
            type="button"
            className="w-full justify-center"
            isLoading={status === 'accepting'}
            loadingLabel={t('invites.accept.loadingTitle')}
            onClick={handleAcceptInvite}
          >
            {t('invites.accept.action.accept')}
          </Button>
        </div>
      </div>
    </InviteAcceptShell>
  );
}
