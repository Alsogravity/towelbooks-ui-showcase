import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';

import { ApiRequestError } from '@towelbooks/sdk';
import { Alert, Button, ButtonLink } from '../../../components/primitives';
import { LoadingState } from '../../../components/feedback';
import {
  PageContainer,
  PageShell,
  PageStateShell,
} from '../../../components/layout';
import { EditCatalogWorkSurface } from '../../../features/catalog';
import { useSystemAdminStatus } from '../../../features/admin/useSystemAdminStatus';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useI18n } from '../../../i18n';
import { formatPublicationCalendarDate } from '../../../lib/datetime';
import { sdk } from '../../../lib/sdk';

export function CatalogEditPage() {
  const { locale, t } = useI18n();
  const {
    error: adminError,
    isLoading: isAdminLoading,
    isSystemAdmin,
    refetch: refetchAdmin,
  } = useSystemAdminStatus();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  usePageTitle('catalog.edit.title');

  const lookupIdentifier = id ?? '';

  const targetQuery = useQuery({
    enabled: lookupIdentifier.length > 0 && isSystemAdmin,
    queryKey: ['catalog', 'admin-edit', lookupIdentifier],
    queryFn: () => sdk.adminCatalogEdit.getEditTarget(lookupIdentifier),
  });

  if (!id) {
    return <NotAllowedState message={t('catalog.edit.notFound')} />;
  }

  if (isAdminLoading) {
    return (
      <PageStateShell containerSize="narrow">
        <LoadingState label={{ key: 'catalog.edit.loading' }} />
      </PageStateShell>
    );
  }

  if (adminError || !isSystemAdmin) {
    if (adminError instanceof ApiRequestError && adminError.status === 403) {
      return <NotAllowedState message={t('catalog.edit.forbidden')} />;
    }

    return (
      <NotAllowedState
        action={
          adminError ? (
            <Button
              onClick={() => void refetchAdmin()}
              type="button"
              variant="secondary"
            >
              {t('errors.action.retry')}
            </Button>
          ) : undefined
        }
        message={
          adminError ? t('catalog.edit.loadError') : t('catalog.edit.forbidden')
        }
      />
    );
  }

  if (targetQuery.isLoading) {
    return (
      <PageStateShell containerSize="narrow">
        <LoadingState label={{ key: 'catalog.edit.loading' }} />
      </PageStateShell>
    );
  }

  if (targetQuery.error) {
    if (
      targetQuery.error instanceof ApiRequestError &&
      targetQuery.error.status === 403
    ) {
      return <NotAllowedState message={t('catalog.edit.forbidden')} />;
    }
    if (
      targetQuery.error instanceof ApiRequestError &&
      targetQuery.error.status === 404
    ) {
      return <NotAllowedState message={t('catalog.edit.notFound')} />;
    }
    return (
      <NotAllowedState
        action={
          <Button
            onClick={() => void targetQuery.refetch()}
            type="button"
            variant="secondary"
          >
            {t('errors.action.retry')}
          </Button>
        }
        message={t('catalog.edit.loadError')}
      />
    );
  }

  const target = targetQuery.data;
  if (!target) {
    return <NotAllowedState message={t('catalog.edit.notFound')} />;
  }

  if (target.selectedEditionId === null && target.editions.length > 1) {
    return (
      <PageShell background="paper" minHeight>
        <PageContainer size="narrow" className="py-8 sm:py-10">
          <div className="space-y-6">
            <div>
              <p className="app-text-eyebrow m-0 text-ink-3">
                {t('catalog.edit.eyebrow')}
              </p>
              <h1 className="app-text-page-title m-0 text-ink">
                {t('catalog.edit.title')}
              </h1>
              <p className="app-text-supporting-copy m-0 mt-2 text-ink-3">
                {t('catalog.edit.chooseEdition')}
              </p>
            </div>
            <div className="divide-y divide-rule/60 overflow-hidden rounded-md border border-rule/60 bg-paper">
              {target.editions.map((edition) => (
                <button
                  className="flex w-full items-start justify-between gap-4 p-4 text-left transition hover:bg-paper-2"
                  key={edition.id}
                  onClick={() =>
                    void navigate(
                      `/catalog/edit/${encodeURIComponent(edition.id)}`,
                      {
                        replace: true,
                      },
                    )
                  }
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block app-text-entity-title text-ink">
                      {edition.title}
                    </span>
                    <span className="block app-text-metadata text-ink-3">
                      {[
                        edition.publisher,
                        formatPublicationCalendarDate(
                          edition.publishedDate,
                          locale,
                        ),
                        edition.isbn13 ?? edition.isbn10 ?? edition.asin,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                  <span className="shrink-0 app-text-label text-ink-2">
                    {t('catalog.edit.selectEdition')}
                  </span>
                </button>
              ))}
            </div>
            <ButtonLink
              to={`/catalog/${encodeURIComponent(target.work.id)}`}
              variant="ghost"
            >
              {t('common.cancel')}
            </ButtonLink>
          </div>
        </PageContainer>
      </PageShell>
    );
  }

  return (
    <PageShell background="paper" minHeight>
      <PageContainer size="narrow" className="py-8 sm:py-10">
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="app-text-eyebrow m-0 text-ink-3">
                {t('catalog.edit.eyebrow')}
              </p>
              <h1 className="app-text-page-title m-0 text-ink">
                {t('catalog.edit.title')}
              </h1>
            </div>
            <ButtonLink
              to={`/catalog/${encodeURIComponent(target.work.id)}`}
              variant="ghost"
            >
              {t('common.cancel')}
            </ButtonLink>
          </div>
          <EditCatalogWorkSurface
            identifier={lookupIdentifier}
            key={target.selectedEditionId ?? lookupIdentifier}
            onCancel={() =>
              void navigate(`/catalog/${encodeURIComponent(target.work.id)}`)
            }
            onSuccess={(updatedTarget) => {
              void queryClient.invalidateQueries({
                queryKey: ['catalog', 'works'],
              });
              void queryClient.invalidateQueries({
                queryKey: ['catalog', 'work', updatedTarget.work.id],
              });
            }}
            target={target}
          />
        </div>
      </PageContainer>
    </PageShell>
  );
}

function NotAllowedState({
  action,
  message,
}: {
  action?: ReactNode;
  message: string;
}) {
  return (
    <PageStateShell containerSize="narrow">
      <Alert variant="error">
        <div className="space-y-3">
          <p className="m-0">{message}</p>
          {action}
        </div>
      </Alert>
    </PageStateShell>
  );
}
