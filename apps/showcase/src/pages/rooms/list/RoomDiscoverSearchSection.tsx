import { type RoomDiscoveryItem } from '@towelbooks/schemas';

import { LoadingState } from '../../../components/feedback';
import { Alert, Input } from '../../../components/primitives';
import { useI18n } from '../../../i18n';
import { RoomDiscoverEmptyStateLayout } from './RoomDiscoverEmptyStateLayout';
import { RoomDiscoverNoResultsEmptyState } from './RoomDiscoverNoResultsEmptyState';
import { RoomDiscoverRecommendationsSection } from './RoomDiscoverRecommendationsSection';
import { RoomDiscoverRoomList } from './RoomDiscoverRoomList';

import type { RoomDiscoverPanelMode } from './useRoomListPageState';

type RoomDiscoverSearchSectionProps = {
  isRecommendationsError: boolean;
  isRecommendationsLoading: boolean;
  isSearchError: boolean;
  isSearching: boolean;
  onRetryRecommendations: () => void;
  onSearchDraftChange: (value: string) => void;
  panelMode: RoomDiscoverPanelMode;
  recommendationResults: RoomDiscoveryItem[] | null;
  searchDraft: string;
  searchResults: RoomDiscoveryItem[] | null;
};

export function RoomDiscoverSearchSection({
  isRecommendationsError,
  isRecommendationsLoading,
  isSearchError,
  isSearching,
  onRetryRecommendations,
  onSearchDraftChange,
  panelMode,
  recommendationResults,
  searchDraft,
  searchResults,
}: RoomDiscoverSearchSectionProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <Input
        id="rooms-discover-search-input"
        autoFocus
        aria-label={t('rooms.list.search.label')}
        aria-busy={isSearching}
        className="h-10 w-full border-rule/60 bg-vellum/50 text-sm focus:bg-vellum"
        clearable
        clearButtonLabel={t('rooms.list.search.clearLabel')}
        enterKeyHint="search"
        placeholder={t('rooms.list.search.placeholder')}
        prependIcon="search"
        type="search"
        value={searchDraft}
        onChange={(event) => onSearchDraftChange(event.target.value)}
      />

      {panelMode === 'recommendations' ? (
        <RoomDiscoverRecommendationsSection
          isError={isRecommendationsError}
          isLoading={isRecommendationsLoading}
          onRetry={onRetryRecommendations}
          results={recommendationResults}
        />
      ) : (
        <>
          {isSearchError ? (
            <Alert variant="error">{t('rooms.list.error.body')}</Alert>
          ) : null}

          {isSearching && searchResults === null ? (
            <LoadingState label={{ key: 'rooms.list.loading' }} />
          ) : null}

          {searchResults ? (
            searchResults.length > 0 ? (
              <RoomDiscoverRoomList
                ariaLabel={t('rooms.list.grid.discoverLabel')}
                rooms={searchResults}
              />
            ) : (
              <RoomDiscoverEmptyStateLayout>
                <RoomDiscoverNoResultsEmptyState className="-translate-y-16" />
              </RoomDiscoverEmptyStateLayout>
            )
          ) : null}
        </>
      )}
    </div>
  );
}
