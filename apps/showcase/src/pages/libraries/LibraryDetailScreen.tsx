import type { Library, LibraryDetail } from '@towelbooks/schemas';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { ErrorState, LoadingState } from '../../components/feedback';
import {
  PageContainer,
  PageSection,
  PageShell,
  PageStateShell,
} from '../../components/layout';
import { useRegisterPageMobileHeaderAction } from '../../components/layout/PageMobileHeaderActionContext';
import { Button } from '../../components/primitives';
import { useAuth } from '../../features/auth/AuthContext';
import { getLibraryDisplayName } from '../../features/libraries/libraryCopy';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useI18n } from '../../i18n';
import { useLibraryDetailScreenState } from './useLibraryDetailScreenState';
import { EditLibraryOverlay } from './ui/EditLibraryOverlay';
import { LibraryAddItemPanel } from './ui/LibraryAddItemPanel';
import { LibraryItemsSection } from './ui/LibraryItemsSection';
import {
  LibraryPageHeader,
  LibraryVisitorContext,
} from './ui/LibraryPageHeader';
import { LibrarySearchSection } from './ui/LibrarySearchSection';

type LibraryDetailScreenProps = {
  libraryId: string;
  initialLibrary?: Library | LibraryDetail | null;
  isOwnLibrary?: boolean;
};

export function LibraryDetailScreen({
  libraryId,
  initialLibrary = null,
  isOwnLibrary = false,
}: LibraryDetailScreenProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const registerMobileHeaderAction = useRegisterPageMobileHeaderAction();
  const {
    closeAddItemPanel,
    closeEditLibrary,
    currentPage,
    emptyStateAddItemButtonRef,
    facets,
    filterOverlayHostRef,
    filters,
    getAddItemReturnFocusElement,
    getEditLibraryReturnFocusElement,
    isAddItemOpen,
    isEditLibraryOpen,
    isItemsError,
    isItemsSectionLoading,
    isLibraryError,
    isLibraryLoading,
    itemsRetry,
    library,
    libraryQuery,
    libraryTotalCount,
    localSearchText,
    onFiltersChange,
    onLocalSearchChange,
    onOpenAddItem,
    onOpenEditLibrary,
    onPageChange,
    onSortChange,
    pageHeaderAddItemButtonRef,
    pageHeaderEditButtonRef,
    sortBy,
    totalPages,
    totalVisibleItems,
    visibleItems,
  } = useLibraryDetailScreenState({
    initialLibrary,
    libraryId,
  });

  const canManage =
    isOwnLibrary ||
    (library?.ownerUserId !== undefined &&
      library.ownerUserId !== null &&
      library.ownerUserId === user?.id);

  const openAddItemFromMobileHeader = useCallback(() => {
    const trigger =
      document.activeElement instanceof HTMLButtonElement
        ? document.activeElement
        : null;

    onOpenAddItem(trigger);
  }, [onOpenAddItem]);

  const openCollectionsFromMobileHeader = useCallback(() => {
    void navigate('/collections');
  }, [navigate]);

  useEffect(() => {
    if (library === null) {
      registerMobileHeaderAction(null);
      return;
    }

    registerMobileHeaderAction({
      leadingAction: {
        ariaLabel: t('shell.mobile.collections'),
        iconName: 'bookmark',
        onClick: openCollectionsFromMobileHeader,
        tone: 'default',
      },
      primaryAction: canManage
        ? {
            ariaLabel: t('myLibrary.header.addItem'),
            iconName: 'search',
            onClick: openAddItemFromMobileHeader,
          }
        : null,
    });

    return () => registerMobileHeaderAction(null);
  }, [
    canManage,
    library,
    openAddItemFromMobileHeader,
    openCollectionsFromMobileHeader,
    registerMobileHeaderAction,
    t,
  ]);

  usePageTitle(
    library
      ? getLibraryDisplayName(
          library,
          t,
          canManage ? 'page.myLibrary.title' : 'page.libraryDetail.title',
        )
      : { key: 'page.libraryDetail.title' },
  );

  const pageHeader = (
    <LibraryPageHeader
      canManage={canManage}
      editButtonRef={pageHeaderEditButtonRef}
      library={library}
      onEdit={canManage ? onOpenEditLibrary : undefined}
      action={
        canManage ? (
          <Button
            ref={pageHeaderAddItemButtonRef}
            onClick={(event) => onOpenAddItem(event.currentTarget)}
            variant="primary"
            prependIcon="search"
          >
            {t('myLibrary.header.addItem')}
          </Button>
        ) : undefined
      }
    />
  );

  if (isLibraryLoading) {
    return (
      <PageStateShell>
        <LoadingState
          label={{
            key:
              canManage || isOwnLibrary
                ? 'myLibrary.loading'
                : 'libraries.loading.other',
          }}
        />
      </PageStateShell>
    );
  }

  if (isLibraryError || !library) {
    return (
      <PageStateShell>
        <ErrorState
          title={{
            key: isOwnLibrary
              ? 'libraries.error.title'
              : 'libraries.error.other.title',
          }}
          body={{
            key: isOwnLibrary
              ? 'libraries.error.body'
              : 'libraries.error.other.body',
          }}
          action={
            <Button
              variant="secondary"
              onClick={() => void libraryQuery.refetch()}
            >
              {t('myLibrary.items.retry')}
            </Button>
          }
        />
      </PageStateShell>
    );
  }

  return (
    <>
      <div
        ref={filterOverlayHostRef}
        className="relative flex min-h-[var(--page-shell-min-height,100dvh)] w-full flex-1 flex-col"
      >
        <PageShell background="paper" minHeight className="flex flex-col">
          <PageContainer
            size="wide"
            className="flex w-full min-w-0 flex-1 flex-col gap-4 max-lg:pt-0"
          >
            {pageHeader}

            <LibraryVisitorContext canManage={canManage} library={library} />

            <PageSection className="flex w-full min-w-0 flex-1 flex-col">
              <LibraryItemsSection
                canManage={canManage}
                facets={facets}
                visibleItems={visibleItems}
                libraryTotalCount={libraryTotalCount}
                totalVisibleItems={totalVisibleItems}
                currentPage={currentPage}
                totalPages={totalPages}
                filters={filters}
                onFiltersChange={onFiltersChange}
                sortBy={sortBy}
                onSortChange={onSortChange}
                localSearchText={localSearchText}
                onLocalSearchChange={onLocalSearchChange}
                onPageChange={onPageChange}
                onRetry={itemsRetry}
                isError={isItemsError}
                isLoading={isItemsSectionLoading}
                emptyStateAddItemButtonRef={emptyStateAddItemButtonRef}
                onOpenAddItem={onOpenAddItem}
                pageOverlayHostRef={filterOverlayHostRef}
              />
            </PageSection>
          </PageContainer>
        </PageShell>
      </div>

      {canManage && isAddItemOpen ? (
        <LibraryAddItemPanel
          title={t('myLibrary.addItem.title')}
          onClose={closeAddItemPanel}
          getReturnFocusElement={getAddItemReturnFocusElement}
        >
          <LibrarySearchSection
            libraryId={library.id}
            onAddCatalogWork={() =>
              void navigate('/catalog/new', {
                state: {
                  origin: { kind: 'library', libraryId: library.id },
                },
              })
            }
          />
        </LibraryAddItemPanel>
      ) : null}

      {canManage && isEditLibraryOpen && library ? (
        <EditLibraryOverlay
          library={library}
          onClose={closeEditLibrary}
          getReturnFocusElement={getEditLibraryReturnFocusElement}
        />
      ) : null}
    </>
  );
}
