import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { LegalUpdatesAcceptancesSection } from './LegalUpdatesAcceptancesSection';
import { useLegalUpdatesPageState } from './useLegalUpdatesPageState';
import { LoadingState } from '../../components/feedback';
import { PageContainer, PageShell } from '../../components/layout';
import { useAuth } from '../../features/auth/AuthContext';
import { ApiProblemPageState } from '../../features/errors';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useI18n } from '../../i18n';

export function LegalUpdatesPage() {
  usePageTitle({
    key: 'page.settings.legalUpdates.title',
    fallback: 'Legal updates',
  });

  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t, formatDate } = useI18n();
  const {
    acceptMutation,
    allSelected,
    error,
    isLoading,
    me,
    pendingAcceptances,
    refetch,
    selectedTypes,
    setAcceptanceSelected,
    submitAcceptances,
  } = useLegalUpdatesPageState();

  useEffect(() => {
    if (!isLoading && me && pendingAcceptances.length === 0) {
      navigate('/', { replace: true });
    }
  }, [isLoading, me, navigate, pendingAcceptances.length]);

  if (error) {
    return (
      <PageShell background="paper" minHeight className="flex flex-1 flex-col">
        <PageContainer
          size="narrow"
          className="flex flex-1 flex-col items-center justify-center"
        >
          <ApiProblemPageState
            error={error}
            fallbackAction={
              <button
                type="button"
                className="text-brick underline underline-offset-4 transition hover:decoration-current/40"
                onClick={() => void refetch()}
              >
                {t('errors.action.retry')}
              </button>
            }
          />
        </PageContainer>
      </PageShell>
    );
  }

  if (isLoading || !me) {
    return (
      <PageShell background="paper" minHeight className="flex flex-1 flex-col">
        <PageContainer
          size="narrow"
          className="flex flex-1 flex-col items-center justify-center"
        >
          <LoadingState />
        </PageContainer>
      </PageShell>
    );
  }

  if (pendingAcceptances.length === 0) {
    return null;
  }

  return (
    <PageShell background="paper" minHeight className="flex flex-1 flex-col">
      <PageContainer
        size="narrow"
        className="flex flex-1 flex-col items-center justify-center gap-8"
      >
        <div className="flex w-full flex-col items-center gap-1">
          <h1 className="app-text-section-title text-ink">
            {t('settings.legalUpdates.title')}
          </h1>
          <p className="app-text-body-sm text-ink-3">
            {t('settings.legalUpdates.lastUpdated', {
              values: {
                date: formatDate(
                  pendingAcceptances
                    .filter((a) => a.legalDocument)
                    .reduce(
                      (latest, a) =>
                        new Date(a.legalDocument!.effectiveAt) > latest
                          ? new Date(a.legalDocument!.effectiveAt)
                          : latest,
                      new Date(0),
                    )
                    .toISOString(),
                ),
              },
            })}
          </p>
        </div>

        <div className="flex w-full flex-col gap-10">
          <LegalUpdatesAcceptancesSection
            allSelected={allSelected}
            isSubmitting={acceptMutation.isPending}
            onAcceptanceChange={setAcceptanceSelected}
            onCancel={() => void logout()}
            onSubmit={submitAcceptances}
            pendingAcceptances={pendingAcceptances}
            selectedTypes={selectedTypes}
          />{' '}
        </div>
      </PageContainer>
    </PageShell>
  );
}
