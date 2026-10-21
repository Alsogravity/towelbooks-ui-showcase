import { useQueryClient } from '@tanstack/react-query';
import type {
  ContributionResolutionResponse,
  ContributionResponse,
} from '@towelbooks/schemas';
import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { PageContainer, PageShell } from '../../../components/layout';
import { ButtonLink } from '../../../components/primitives';
import {
  AddCatalogWorkFlow,
  catalogContributionIdentifierFromResponse,
} from '../../../features/catalog';
import {
  catalogContributionLocationStateFromLocationState,
  normalizeCatalogContributionIdentifier,
  type CatalogContributionLocationState,
} from '../../../features/catalog/catalogContributionNavigation';
import { buildRoomCreateReadingPath } from '../../../features/readings/create-reading/readingCreationNavigation';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useI18n } from '../../../i18n';

export function CatalogContributionPage() {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const { identifier: routeIdentifier } = useParams();
  const queryClient = useQueryClient();
  const locationState = useMemo(
    () => catalogContributionLocationStateFromLocationState(location.state),
    [location.state],
  );
  const { origin } = locationState;
  const isMetadataRoute = routeIdentifier !== undefined;
  const metadataRouteIdentifier = routeIdentifier
    ? normalizeCatalogContributionIdentifier(routeIdentifier)
    : null;
  const [resolvedMetadataRouteIdentifier, setResolvedMetadataRouteIdentifier] =
    useState<string | null>(null);
  const [metadataResolution, setMetadataResolution] = useState<
    ContributionResolutionResponse['resolution'] | null
  >(null);
  const isMetadataLoading =
    isMetadataRoute &&
    resolvedMetadataRouteIdentifier !== metadataRouteIdentifier;
  const isExistingEdition =
    isMetadataRoute && metadataResolution === 'existing_edition';

  const handleResolutionChange = useCallback(
    (resolution: ContributionResolutionResponse | null) => {
      setMetadataResolution(resolution?.resolution ?? null);
    },
    [],
  );

  usePageTitle({
    key: isExistingEdition
      ? 'catalog.contribution.title'
      : isMetadataRoute
        ? 'catalog.contribution.form.title'
        : 'catalog.contribution.title',
  });

  const handleSuccess = useCallback(
    (result: ContributionResponse) => {
      void queryClient.invalidateQueries({ queryKey: ['catalog', 'works'] });

      if (origin.kind === 'reading') {
        const query =
          catalogContributionIdentifierFromResponse(result) ?? origin.query;

        void navigate(buildRoomCreateReadingPath(origin.roomId, query), {
          replace: true,
        });
        return;
      }

      void navigate(`/catalog/${encodeURIComponent(result.catalogWorkId)}`, {
        replace: true,
      });
    },
    [navigate, origin, queryClient],
  );

  const handleIdentifierSubmit = useCallback(
    (identifier: string) => {
      const normalizedIdentifier =
        normalizeCatalogContributionIdentifier(identifier);

      if (normalizedIdentifier.length === 0) {
        return;
      }

      void navigate(
        `/catalog/new/${encodeURIComponent(normalizedIdentifier)}`,
        {
          state: { origin },
        },
      );
    },
    [navigate, origin],
  );

  const handleIdentifierParamChange = useCallback(
    (identifier: string | null) => {
      const normalizedIdentifier = identifier
        ? normalizeCatalogContributionIdentifier(identifier)
        : '';

      if (normalizedIdentifier.length > 0) {
        void navigate(
          `/catalog/new/${encodeURIComponent(normalizedIdentifier)}`,
          {
            replace: true,
            state: { origin },
          },
        );
        return;
      }

      const prefilledIdentifier = routeIdentifier
        ? normalizeCatalogContributionIdentifier(routeIdentifier)
        : undefined;
      const nextState: CatalogContributionLocationState = {
        origin,
        ...(prefilledIdentifier ? { identifier: prefilledIdentifier } : {}),
      };

      void navigate('/catalog/new', {
        replace: true,
        state: nextState,
      });
    },
    [navigate, origin, routeIdentifier],
  );

  const handleLoadingChange = useCallback(
    (isLoading: boolean) => {
      if (!isLoading) {
        setResolvedMetadataRouteIdentifier(metadataRouteIdentifier);
      }
    },
    [metadataRouteIdentifier],
  );

  const backPath =
    origin.kind === 'reading'
      ? buildRoomCreateReadingPath(origin.roomId, origin.query)
      : origin.kind === 'library'
        ? `/libraries/${encodeURIComponent(origin.libraryId)}`
        : '/catalog';
  const flowKey = `${isMetadataRoute ? 'metadata' : 'identifier'}:${
    isMetadataRoute ? routeIdentifier : (locationState.identifier ?? '')
  }`;

  return (
    <PageShell
      background="paper"
      minHeight
      className="relative z-10 flex flex-col"
    >
      <PageContainer
        size="narrow"
        padding="none"
        className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 lg:py-10"
      >
        <div className="w-full">
          {!isMetadataLoading && !isExistingEdition ? (
            <div className="mb-6 flex flex-col items-center text-center">
              <h1 className="app-text-page-title text-ink">
                {t(
                  isMetadataRoute
                    ? 'catalog.contribution.form.title'
                    : 'catalog.contribution.title',
                )}
              </h1>
              {!isMetadataRoute ? (
                <p className="app-text-page-description m-0 mt-2 max-w-md text-ink-3">
                  {t('catalog.contribution.description')}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mx-auto w-full max-w-md">
            <AddCatalogWorkFlow
              backAction={
                isMetadataRoute ? (
                  <ButtonLink
                    className="w-full justify-center sm:w-auto"
                    size="md"
                    to={backPath}
                    variant="secondary"
                  >
                    {t('common.back')}
                  </ButtonLink>
                ) : undefined
              }
              key={flowKey}
              initialIdentifier={
                isMetadataRoute ? routeIdentifier : locationState.identifier
              }
              onIdentifierParamChange={
                isMetadataRoute ? handleIdentifierParamChange : undefined
              }
              onIdentifierSubmit={
                isMetadataRoute ? undefined : handleIdentifierSubmit
              }
              onLoadingChange={
                isMetadataRoute ? handleLoadingChange : undefined
              }
              onResolutionChange={
                isMetadataRoute ? handleResolutionChange : undefined
              }
              existingBookPath={
                isMetadataRoute
                  ? (catalogWorkId) =>
                      `/catalog/${encodeURIComponent(catalogWorkId)}`
                  : undefined
              }
              onSuccess={handleSuccess}
            />
            {!isMetadataLoading && !isMetadataRoute ? (
              <ButtonLink
                className="mt-4 w-full justify-center"
                to={backPath}
                variant="ghost"
              >
                {t('common.back')}
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </PageContainer>
    </PageShell>
  );
}
