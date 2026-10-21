import { useEffect, useRef } from 'react';

import { ApiRequestError } from '@towelbooks/sdk';
import { useParams } from 'react-router';

import { LoadingState } from '../../../components/feedback';
import { PageStateShell } from '../../../components/layout';
import { Button, ButtonLink } from '../../../components/primitives';
import { useAuth } from '../../../features/auth/AuthContext';
import { useSystemAdminStatus } from '../../../features/admin/useSystemAdminStatus';
import { trackCatalogWorkOpened } from '../../../features/analytics';
import { ApiProblemPageState } from '../../../features/errors';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useI18n } from '../../../i18n';
import { NotFoundPage } from '../../NotFoundPage';
import { useCatalogWorkDetailPageState } from './useCatalogWorkDetailPageState';
import { CatalogWorkDetailContent } from './ui/CatalogWorkDetailContent';

export function CatalogWorkDetailPage() {
  const { catalogWorkId } = useParams<{ catalogWorkId: string }>();
  const { isAuthenticated } = useAuth();
  const { isSystemAdmin } = useSystemAdminStatus();
  const { t } = useI18n();
  const {
    isAddToLibraryPending,
    isInLibrary,
    isLibraryLookupError,
    isLibraryLookupLoading,
    isLikeDisabled,
    isLikePending,
    isLiked,
    item,
    itemError,
    libraryActionErrorMessage,
    libraryId,
    likeErrorMessage,
    onAddToLibrary,
    onLikeToggle,
    refetchItem,
  } = useCatalogWorkDetailPageState(catalogWorkId);
  usePageTitle(t('catalog.workDetail.pageTitle'));

  const lastTrackedCatalogWorkRef = useRef<string | null>(null);

  useEffect(() => {
    if (!item || !catalogWorkId) {
      return;
    }

    if (catalogWorkId === lastTrackedCatalogWorkRef.current) {
      return;
    }

    lastTrackedCatalogWorkRef.current = catalogWorkId;
    trackCatalogWorkOpened('direct_navigation');
  }, [item, catalogWorkId]);

  if (!catalogWorkId) {
    return <NotFoundPage />;
  }

  if (itemError) {
    if (itemError instanceof ApiRequestError && itemError.status === 404) {
      return <NotFoundPage />;
    }

    return (
      <PageStateShell containerSize="narrow">
        <ApiProblemPageState
          error={itemError}
          title={{ key: 'catalog.workDetail.error.loadTitle' }}
          body={{ key: 'catalog.workDetail.error.loadBody' }}
          fallbackAction={
            <Button variant="secondary" onClick={() => void refetchItem()}>
              {t('errors.action.retry')}
            </Button>
          }
          action={
            <ButtonLink to="/catalog" variant="secondary">
              {t('catalog.works.backToCatalog')}
            </ButtonLink>
          }
        />
      </PageStateShell>
    );
  }

  if (!item) {
    return (
      <PageStateShell containerSize="narrow">
        <LoadingState
          label={{
            key: 'catalog.workDetail.loading',
            fallback: 'Loading catalog work...',
          }}
        />
      </PageStateShell>
    );
  }

  return (
    <CatalogWorkDetailContent
      item={item}
      isAuthenticated={isAuthenticated}
      isInLibrary={isInLibrary}
      isAddToLibraryPending={isAddToLibraryPending}
      isLibraryLookupError={isLibraryLookupError}
      isLibraryLookupLoading={isLibraryLookupLoading}
      catalogWorkId={catalogWorkId}
      libraryId={libraryId}
      libraryActionErrorMessage={libraryActionErrorMessage}
      isLikeDisabled={isLikeDisabled}
      isLikePending={isLikePending}
      isSystemAdmin={isSystemAdmin}
      isLiked={isLiked}
      likeErrorMessage={likeErrorMessage}
      onLikeToggle={onLikeToggle}
      onAddToLibrary={onAddToLibrary}
    />
  );
}
