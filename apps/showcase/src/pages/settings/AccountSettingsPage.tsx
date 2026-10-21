import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type MeResponse } from '@towelbooks/schemas';
import { useEffect, useRef, useState } from 'react';

import {
  SettingsDefinitionList,
  SettingsDefinitionRow,
} from './ui/SettingsDefinitionList';
import { SettingsDangerSection } from './ui/SettingsDangerSection';
import { SettingsSectionPageHeader } from './ui/SettingsSectionPageHeader';
import { SettingsSubsection } from './ui/SettingsSubsection';
import {
  Button,
  ButtonLink,
  InlineConfirm,
  Tag,
} from '../../components/primitives';
import { useToast } from '../../components/feedback';
import { SettingsRouteButton } from '../../features/settings/SettingsRouteButton';
import { useSettingsShell } from '../../features/settings/SettingsShellContext';
import { useAuth } from '../../features/auth/AuthContext';
import { meQueryKey } from '../../features/auth/meQuery';
import {
  ApiProblemPageState,
  createApiProblemToast,
} from '../../features/errors';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';

const statusVariant: Record<MeResponse['status'], 'default' | 'reading'> = {
  pending_verification: 'default',
  active: 'reading',
  suspended: 'default',
  deleted: 'default',
};

export function AccountSettingsPage() {
  usePageTitle({
    key: 'page.settings.account.title',
    fallback: 'Account',
  });

  const { t } = useI18n();
  const { goTo } = useSettingsShell();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const toastShown = useRef(false);

  useEffect(() => {
    if (toastShown.current) return;
    const params = new URLSearchParams(window.location.search);
    const oauth = params.get('oauth');

    if (oauth === 'linked') {
      toastShown.current = true;
      pushToast({
        title: t('settings.account.google.connected'),
        variant: 'success',
      });
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.hash}`,
      );
    } else if (oauth === 'account_exists') {
      toastShown.current = true;
      pushToast({
        title: t('settings.account.google.error.accountExists'),
        variant: 'error',
      });
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.hash}`,
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const statusLabel: Record<MeResponse['status'], string> = {
    pending_verification: t('settings.profile.status.pending_verification'),
    active: t('settings.profile.status.active'),
    suspended: t('settings.profile.status.suspended'),
    deleted: t('settings.profile.status.deleted'),
  };

  const {
    data: me,
    isLoading,
    error,
    refetch,
  } = useQuery({
    enabled: user !== null,
    queryKey: meQueryKey(user?.id ?? ''),
    queryFn: () => sdk.users.me.get(),
  });

  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isDisconnectingGoogle, setIsDisconnectingGoogle] = useState(false);

  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);

    try {
      const { redirectUrl } = await sdk.auth.googleLinkStart();
      window.location.assign(redirectUrl);
    } catch (connectError) {
      setIsConnectingGoogle(false);
      pushToast(
        createApiProblemToast(connectError, {
          fallbackKey: 'settings.account.google.error.connect',
          messageKeys: {
            INTERNAL_ERROR: 'settings.account.google.error.connect',
          },
          t,
        }),
      );
    }
  };

  const handleDisconnectGoogle = async () => {
    setIsDisconnectingGoogle(true);

    try {
      await sdk.auth.googleUnlink();
      await queryClient.invalidateQueries({
        queryKey: meQueryKey(user?.id ?? ''),
      });
      pushToast({
        title: t('settings.account.google.disconnected'),
        variant: 'success',
      });
    } catch (disconnectError) {
      pushToast(
        createApiProblemToast(disconnectError, {
          fallbackKey: 'settings.account.google.error.disconnect',
          messageKeys: {
            FORBIDDEN: 'settings.account.google.error.disconnectLastMethod',
          },
          t,
        }),
      );
    } finally {
      setIsDisconnectingGoogle(false);
    }
  };

  const authMethods = me?.authMethods;
  const passwordExists = authMethods?.password ?? true;
  const googleConnected = authMethods?.google ?? false;

  if (error) {
    return (
      <div className="py-2">
        <Button
          aria-label={t('settings.backToSettings')}
          icon="chevron-left"
          variant="ghost"
          size="sm"
          className="mb-5 shrink-0 lg:hidden"
          onClick={() => goTo('index')}
        />
        <ApiProblemPageState
          error={error}
          fallbackAction={
            <Button variant="secondary" onClick={() => void refetch()}>
              {t('errors.action.retry')}
            </Button>
          }
          action={
            <ButtonLink to="/" variant="secondary">
              {t('errors.page.backToLibrary')}
            </ButtonLink>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-8">
      <SettingsSectionPageHeader title={t('settings.account.title')} />

      <div className="flex flex-1 flex-col justify-between gap-10">
        <SettingsSubsection
          className="flex-1"
          title={t('settings.account.summary.title')}
          description={t('settings.account.description')}
          titleAs="h3"
        >
          <SettingsDefinitionList>
            <SettingsDefinitionRow
              label={t('settings.account.email')}
              mobileLayout="inline"
              value={
                <span className="font-mono text-xs">
                  {isLoading
                    ? t('settings.account.loading')
                    : (me?.email ?? '—')}
                </span>
              }
            />
            <SettingsDefinitionRow
              label={t('settings.account.google.rowLabel')}
              mobileLayout="inline"
              value={
                isLoading ? (
                  <span className="text-xs text-ink-3">
                    {t('settings.account.loading')}
                  </span>
                ) : googleConnected ? (
                  <InlineConfirm
                    trigger={
                      <Button size="sm" variant="secondary">
                        {t('settings.account.google.disconnectAction')}
                      </Button>
                    }
                    confirmLabel={t(
                      'settings.account.google.disconnectConfirm',
                    )}
                    cancelLabel={t('settings.profile.edit.cancel')}
                    confirmVariant="danger"
                    isLoading={isDisconnectingGoogle}
                    onConfirm={handleDisconnectGoogle}
                  />
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    isLoading={isConnectingGoogle}
                    loadingLabel={t('settings.account.google.connecting')}
                    onClick={() => {
                      handleConnectGoogle().catch(() => {});
                    }}
                  >
                    {t('settings.account.google.connectAction')}
                  </Button>
                )
              }
            />
            <SettingsDefinitionRow
              label={t('settings.account.password.rowLabel')}
              mobileLayout="inline"
              value={
                passwordExists ? (
                  <SettingsRouteButton
                    route="change-password"
                    variant="secondary"
                    size="sm"
                  >
                    {t('settings.account.password.title')}
                  </SettingsRouteButton>
                ) : (
                  <SettingsRouteButton
                    route="set-password"
                    variant="secondary"
                    size="sm"
                  >
                    {t('settings.account.setPassword.title')}
                  </SettingsRouteButton>
                )
              }
            />
            <SettingsDefinitionRow
              label={t('settings.account.status')}
              mobileLayout="inline"
              value={
                isLoading ? (
                  t('settings.account.loading')
                ) : me ? (
                  <Tag variant={statusVariant[me.status]}>
                    {statusLabel[me.status]}
                  </Tag>
                ) : (
                  '—'
                )
              }
            />
          </SettingsDefinitionList>
        </SettingsSubsection>

        <SettingsDangerSection
          title={t('settings.account.danger.title')}
          titleAs="h3"
          description={t('settings.account.danger.body')}
        >
          <div className="mt-4 flex flex-col lg:items-end">
            <SettingsRouteButton
              route="delete-account"
              variant="danger"
              className="w-full lg:w-auto"
            >
              {t('settings.account.danger.action')}
            </SettingsRouteButton>
          </div>
        </SettingsDangerSection>
      </div>
    </div>
  );
}
