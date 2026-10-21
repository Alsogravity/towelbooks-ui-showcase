import { useQuery } from '@tanstack/react-query';
import { ApiRequestError } from '@towelbooks/sdk';
import { Navigate, useLocation, useParams } from 'react-router';

import { LoadingState } from '../../components/feedback';
import { PageStateShell } from '../../components/layout';
import { Button, ButtonLink } from '../../components/primitives';
import { CatalogReviewEditor } from '../../features/catalog-reviews/CatalogReviewEditor';
import {
  buildCatalogReviewLocationState,
  catalogReviewOriginFromLocationState,
} from '../../features/catalog-reviews/catalogReviewNavigation';
import { catalogWorkDetailQueryKey } from '../../features/catalog/queryKeys';
import { ApiProblemPageState } from '../../features/errors';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';
import { NotFoundPage } from '../NotFoundPage';

export function CatalogReviewEditorPage() {
  const { catalogReviewId, catalogWorkId } = useParams<{
    catalogReviewId?: string;
    catalogWorkId?: string;
  }>();
  const location = useLocation();
  const origin = catalogReviewOriginFromLocationState(location.state);

  if (catalogReviewId) {
    return (
      <EditCatalogReviewRoute
        catalogReviewId={catalogReviewId}
        origin={origin}
      />
    );
  }

  if (catalogWorkId) {
    return (
      <CreateCatalogReviewRoute catalogWorkId={catalogWorkId} origin={origin} />
    );
  }

  return <Navigate to="/catalog" replace />;
}

function CreateCatalogReviewRoute({
  catalogWorkId,
  origin,
}: {
  catalogWorkId: string;
  origin: ReturnType<typeof catalogReviewOriginFromLocationState>;
}) {
  const { locale, t } = useI18n();
  const catalogWorkQuery = useQuery({
    queryKey: catalogWorkDetailQueryKey(catalogWorkId, locale),
    queryFn: () => sdk.catalog.get(catalogWorkId),
  });

  if (catalogWorkQuery.isLoading) {
    return (
      <PageStateShell containerSize="narrow">
        <LoadingState label={t('catalog.catalogReviewEditor.loading.create')} />
      </PageStateShell>
    );
  }

  if (catalogWorkQuery.error) {
    if (
      catalogWorkQuery.error instanceof ApiRequestError &&
      catalogWorkQuery.error.status === 404
    ) {
      return <NotFoundPage />;
    }

    return (
      <PageStateShell containerSize="narrow">
        <ApiProblemPageState
          error={catalogWorkQuery.error}
          title={{ key: 'catalog.catalogReviewEditor.error.loadTitle' }}
          body={{ key: 'catalog.catalogReviewEditor.error.loadCreateBody' }}
          fallbackAction={
            <Button
              variant="secondary"
              onClick={() => void catalogWorkQuery.refetch()}
            >
              {t('errors.action.retry')}
            </Button>
          }
          action={
            <ButtonLink to="/catalog" variant="secondary">
              {t('errors.page.backToLibrary')}
            </ButtonLink>
          }
        />
      </PageStateShell>
    );
  }

  if (!catalogWorkQuery.data) {
    return <NotFoundPage />;
  }

  return (
    <CatalogReviewEditor
      mode="create"
      initialCatalogWork={{
        catalogWorkId,
        title: catalogWorkQuery.data.display.title,
      }}
      origin={origin}
    />
  );
}

function EditCatalogReviewRoute({
  catalogReviewId,
  origin,
}: {
  catalogReviewId: string;
  origin: ReturnType<typeof catalogReviewOriginFromLocationState>;
}) {
  const { t } = useI18n();
  const reflectionQuery = useQuery({
    queryKey: ['catalog-reviews', catalogReviewId, 'editable'],
    queryFn: () => sdk.catalogReviews.getEditable(catalogReviewId),
  });

  if (reflectionQuery.isLoading) {
    return (
      <PageStateShell containerSize="narrow">
        <LoadingState label={t('catalog.catalogReviewEditor.loading.edit')} />
      </PageStateShell>
    );
  }

  if (reflectionQuery.error) {
    if (
      reflectionQuery.error instanceof ApiRequestError &&
      reflectionQuery.error.status === 404
    ) {
      return <NotFoundPage />;
    }

    if (
      reflectionQuery.error instanceof ApiRequestError &&
      reflectionQuery.error.status === 403
    ) {
      return (
        <Navigate
          state={buildCatalogReviewLocationState(origin)}
          to={`/catalog-reviews/${encodeURIComponent(catalogReviewId)}`}
          replace
        />
      );
    }

    return (
      <PageStateShell containerSize="narrow">
        <ApiProblemPageState
          error={reflectionQuery.error}
          title={{ key: 'catalog.catalogReviewEditor.error.loadTitle' }}
          body={{ key: 'catalog.catalogReviewEditor.error.loadEditBody' }}
          fallbackAction={
            <Button
              variant="secondary"
              onClick={() => void reflectionQuery.refetch()}
            >
              {t('errors.action.retry')}
            </Button>
          }
          action={
            <ButtonLink to="/catalog" variant="secondary">
              {t('errors.page.backToLibrary')}
            </ButtonLink>
          }
        />
      </PageStateShell>
    );
  }

  if (!reflectionQuery.data) {
    return <NotFoundPage />;
  }

  return (
    <CatalogReviewEditor
      mode="edit"
      initialReflection={reflectionQuery.data}
      origin={origin}
    />
  );
}
