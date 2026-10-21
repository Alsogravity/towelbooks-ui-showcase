import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { getProfilePath } from '../../app/profileRoutes';
import { LoadingState } from '../../components/feedback';
import {
  PageContainer,
  PageHeader,
  PageShell,
  PageStateShell,
} from '../../components/layout';
import { Button } from '../../components/primitives';
import { ProfileEditForm } from '../../components/profile/ProfileEditForm';
import { useAuth } from '../../features/auth/AuthContext';
import { meQueryKey } from '../../features/auth/meQuery';
import { ApiProblemPageState } from '../../features/errors';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';

/**
 * Only safe internal paths are honored as a return target; anything external or
 * protocol-relative is rejected so a crafted `returnTo` cannot redirect off-site.
 */
export function resolveSafeReturnTo(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  if (!value.startsWith('/') || value.startsWith('//')) {
    return null;
  }

  return value;
}

export function ProfileSettingsPage() {
  usePageTitle({
    key: 'page.settings.profile.title',
    fallback: 'Profile',
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAuth();

  const returnTo = resolveSafeReturnTo(
    (location.state as { returnTo?: unknown } | null)?.returnTo,
  );

  const {
    data: me,
    error,
    isLoading,
    refetch,
  } = useQuery({
    enabled: user !== null,
    queryKey: meQueryKey(user?.id ?? ''),
    queryFn: () => sdk.users.me.get(),
  });

  const fallbackPath = returnTo ?? (me ? getProfilePath(me) : '/');

  const handleCancel = useCallback(() => {
    navigate(fallbackPath);
  }, [fallbackPath, navigate]);

  if (error) {
    return (
      <PageStateShell containerSize="narrow">
        <ApiProblemPageState
          error={error}
          title={{ key: 'settings.profile.error.loadTitle' }}
          body={{ key: 'settings.profile.error.loadBody' }}
          fallbackAction={
            <Button variant="secondary" onClick={() => void refetch()}>
              {t('errors.action.retry')}
            </Button>
          }
        />
      </PageStateShell>
    );
  }

  if (isLoading || !me) {
    return (
      <PageStateShell containerSize="narrow">
        <LoadingState />
      </PageStateShell>
    );
  }

  return (
    <PageShell background="paper" minHeight className="flex flex-col">
      <PageContainer
        size="narrow"
        padding="none"
        className="flex min-h-0 flex-1 flex-col pt-0 lg:pt-12 pb-6 sm:pb-12"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-6">
          <PageHeader
            backHref={fallbackPath}
            backLabel={t('settings.profile.page.backToProfile')}
            title={t('settings.profile.page.title')}
          />
          <ProfileEditForm me={me} onCancel={handleCancel} />
        </div>
      </PageContainer>
    </PageShell>
  );
}
