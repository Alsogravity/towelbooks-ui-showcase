import {
  PageContainer,
  PageHeader,
  PageSection,
  PageShell,
} from '../../../components/layout';
import { Button, ButtonLink } from '../../../components/primitives';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useI18n } from '../../../i18n';
import { RoomDiscoverEmptyStateLayout } from './RoomDiscoverEmptyStateLayout';
import { RoomDiscoverIdleEmptyState } from './RoomDiscoverIdleEmptyState';
import { RoomDiscoverPanel } from './RoomDiscoverPanel';
import { RoomDiscoverSearchSection } from './RoomDiscoverSearchSection';
import { RoomListPageResults } from './RoomListPageResults';
import { useRoomListPageState } from './useRoomListPageState';

export function RoomListPage() {
  usePageTitle({ key: 'page.rooms.list.title', fallback: 'Your Rooms' });
  const { t } = useI18n();
  const {
    activeQuery,
    closeDiscoverPanel,
    currentPage,
    discoverPanelButtonRef,
    getDiscoverPanelReturnFocusElement,
    isDiscovering,
    isDiscoverPanelOpen,
    isPanelRecommendationsError,
    isPanelRecommendationsLoading,
    isPanelSearchError,
    isPanelSearching,
    isSearchIdle,
    openDiscoverPanel,
    panelMode,
    panelRecommendationResults,
    panelSearchDraft,
    panelSearchResults,
    retryPanelRecommendations,
    rooms,
    setPanelSearchDraft,
    total,
    totalPages,
    updatePage,
  } = useRoomListPageState();

  return (
    <PageShell background="paper" minHeight className="flex flex-col">
      <PageContainer
        size="comfortable"
        className="flex w-full min-w-0 flex-1 flex-col gap-8"
      >
        <PageHeader
          title={t('rooms.list.header.title')}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                ref={discoverPanelButtonRef}
                onClick={openDiscoverPanel}
                prependIcon="search"
                variant="secondary"
              >
                {t('rooms.list.search.triggerLabel')}
              </Button>
              <ButtonLink to="/rooms/create" prependIcon="plus">
                {t('rooms.list.action.start')}
              </ButtonLink>
            </div>
          }
        />

        <PageSection className="flex w-full min-w-0 flex-1 flex-col gap-6">
          {isSearchIdle ? (
            <RoomDiscoverEmptyStateLayout>
              <RoomDiscoverIdleEmptyState className="-translate-y-16" />
            </RoomDiscoverEmptyStateLayout>
          ) : (
            <RoomListPageResults
              rooms={rooms}
              currentPage={currentPage}
              error={activeQuery.error}
              isDiscovering={isDiscovering}
              isLoading={activeQuery.isLoading}
              onPageChange={updatePage}
              onRetry={() => void activeQuery.refetch()}
              total={total}
              totalPages={totalPages}
            />
          )}
        </PageSection>
      </PageContainer>

      {isDiscoverPanelOpen ? (
        <RoomDiscoverPanel
          title={t('rooms.list.discover.panelTitle')}
          onClose={closeDiscoverPanel}
          getReturnFocusElement={getDiscoverPanelReturnFocusElement}
        >
          <RoomDiscoverSearchSection
            isRecommendationsError={isPanelRecommendationsError}
            isRecommendationsLoading={isPanelRecommendationsLoading}
            isSearchError={isPanelSearchError}
            isSearching={isPanelSearching}
            onRetryRecommendations={retryPanelRecommendations}
            onSearchDraftChange={setPanelSearchDraft}
            panelMode={panelMode}
            recommendationResults={panelRecommendationResults}
            searchDraft={panelSearchDraft}
            searchResults={panelSearchResults}
          />
        </RoomDiscoverPanel>
      ) : null}
    </PageShell>
  );
}
