import type {
  LibraryItem,
  LibraryItemFacetsResponse,
  LibraryItemSort,
} from '@towelbooks/schemas';
import { type RefObject, useMemo, useState } from 'react';
import { EmptyState, ErrorState } from '../../../components/feedback';
import { LIBRARY_ITEMS_LIST_PAGE_SIZE } from '../../../features/libraries/buildLibraryItemsListQuery';
import {
  FilterSurface,
  FilterTriggerButton,
} from '../../../components/filters';
import {
  ActionMenu,
  Button,
  Input,
  Pagination,
  ToolbarIconButton,
} from '../../../components/primitives';
import { buildLibraryFilterSections } from '../../../features/libraries/libraryFilterSections';
import {
  countActiveLibraryItemFilters,
  EMPTY_LIBRARY_ITEM_FILTERS,
  type LibraryItemFilters,
} from '../../../features/libraries/libraryItemFilters';
import { useI18n } from '../../../i18n';
import {
  EmptyChairIllustration,
  LibraryIllustration,
} from '../../dashboard/ui/illustrations';
import { LibraryFilterPanelContent } from './LibraryFilterPanelContent';
import { LibraryItemCard, LibraryItemCardSkeleton } from './LibraryItemCard';
import { DEFAULT_LIBRARY_ITEM_SORT, sortOptions } from './libraryPageShared';

export const LIBRARY_FILTER_SHEET_TITLE_ID = 'library-filter-sheet-title';

type LibraryItemsSectionProps = {
  canManage: boolean;
  facets: LibraryItemFacetsResponse | null;
  visibleItems: LibraryItem[];
  libraryTotalCount?: number;
  totalVisibleItems: number;
  currentPage: number;
  totalPages: number;
  filters: LibraryItemFilters;
  onFiltersChange: (filters: LibraryItemFilters) => void;
  sortBy: LibraryItemSort;
  onSortChange: (sortBy: LibraryItemSort) => void;
  localSearchText: string;
  onLocalSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  isError: boolean;
  isLoading: boolean;
  emptyStateAddItemButtonRef: RefObject<HTMLButtonElement | null>;
  onOpenAddItem: (trigger: HTMLButtonElement | null) => void;
  pageOverlayHostRef: RefObject<HTMLElement | null>;
};

export function LibraryItemsSection({
  canManage,
  facets,
  visibleItems,
  libraryTotalCount,
  totalVisibleItems,
  currentPage,
  totalPages,
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  localSearchText,
  onLocalSearchChange,
  onPageChange,
  onRetry,
  isError,
  isLoading,
  emptyStateAddItemButtonRef,
  onOpenAddItem,
  pageOverlayHostRef,
}: LibraryItemsSectionProps) {
  const { formatNumber, t } = useI18n();
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const filterSections = useMemo(
    () => buildLibraryFilterSections(facets, t),
    [facets, t],
  );

  if (isError) {
    return (
      <ErrorState
        title={{
          key: canManage
            ? 'myLibrary.items.error.title'
            : 'libraries.items.error.other.title',
        }}
        body={{
          key: canManage
            ? 'myLibrary.items.error.body'
            : 'libraries.items.error.other.body',
        }}
        action={
          <Button variant="secondary" onClick={onRetry}>
            {t('myLibrary.items.retry')}
          </Button>
        }
      />
    );
  }

  if (isLoading) {
    return (
      <div
        aria-busy="true"
        aria-label={t(
          canManage ? 'myLibrary.loading' : 'libraries.loading.other',
          {
            fallback: canManage
              ? 'Loading your library...'
              : 'Loading library...',
          },
        )}
        aria-live="polite"
        className="flex min-h-[320px] w-full min-w-0 flex-col"
        role="status"
      >
        <div
          aria-hidden="true"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2"
        >
          {Array.from({ length: LIBRARY_ITEMS_LIST_PAGE_SIZE }).map(
            (_, index) => (
              <LibraryItemCardSkeleton key={index} />
            ),
          )}
        </div>
      </div>
    );
  }

  const isLibraryEmpty = libraryTotalCount === 0;
  const activeFilterCount = countActiveLibraryItemFilters(filters);

  const closeFilterPanel = () => {
    setIsFilterPanelOpen(false);
  };

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
      {!isLibraryEmpty && (
        <ItemControls
          sortBy={sortBy}
          onSortChange={onSortChange}
          localSearchText={localSearchText}
          onLocalSearchChange={onLocalSearchChange}
          isFilterPanelOpen={isFilterPanelOpen}
          onFilterToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          activeFilterCount={activeFilterCount}
        />
      )}

      {totalVisibleItems > 0 ? (
        // TODO: Revisit whether this result count should return to the visible list UI.
        <p className="hidden">
          {t('myLibrary.pagination.resultsCount', {
            values: {
              start: formatNumber(
                (currentPage - 1) * LIBRARY_ITEMS_LIST_PAGE_SIZE + 1,
              ),
              end: formatNumber(
                Math.min(
                  currentPage * LIBRARY_ITEMS_LIST_PAGE_SIZE,
                  totalVisibleItems,
                ),
              ),
              total: formatNumber(totalVisibleItems),
            },
          })}
        </p>
      ) : null}

      {!isLibraryEmpty && isFilterPanelOpen ? (
        <FilterSurface
          appliedValue={filters}
          resetValue={EMPTY_LIBRARY_ITEM_FILTERS}
          onApply={onFiltersChange}
          onClose={closeFilterPanel}
          title={t('myLibrary.filter.groupLabel')}
          titleId={LIBRARY_FILTER_SHEET_TITLE_ID}
          closeLabel={t('myLibrary.filter.sheet.close')}
          resetLabel={t('myLibrary.filter.reset')}
          applyLabel={t('myLibrary.filter.apply')}
          hostRef={pageOverlayHostRef}
        >
          {(draft, setDraft) => (
            <LibraryFilterPanelContent
              draft={draft}
              onDraftChange={setDraft}
              sections={filterSections}
            />
          )}
        </FilterSurface>
      ) : null}

      <div className="flex flex-1 flex-col">
        <LibraryShelf
          canManage={canManage}
          items={visibleItems}
          libraryTotalCount={libraryTotalCount}
          emptyStateAddItemButtonRef={emptyStateAddItemButtonRef}
          onOpenAddItem={onOpenAddItem}
        />
        {totalVisibleItems > 0 ? (
          <div className="mt-auto flex flex-wrap items-center justify-end gap-x-4 gap-y-6 border-t border-rule pt-4 sm:gap-y-4">
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              currentPageLabel={(pageNumber) =>
                t('myLibrary.pagination.currentPage', {
                  values: { page: formatNumber(pageNumber) },
                })
              }
              navLabel={t('myLibrary.pagination.nav')}
              nextLabel={t('libraries.pagination.next')}
              onPageChange={onPageChange}
              pageLabel={(pageNumber) =>
                t('myLibrary.pagination.page', {
                  values: { page: formatNumber(pageNumber) },
                })
              }
              previousLabel={t('libraries.pagination.previous')}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ItemControls({
  sortBy,
  onSortChange,
  localSearchText,
  onLocalSearchChange,
  isFilterPanelOpen,
  onFilterToggle,
  activeFilterCount,
}: {
  sortBy: LibraryItemSort;
  onSortChange: (sortBy: LibraryItemSort) => void;
  localSearchText: string;
  onLocalSearchChange: (text: string) => void;
  isFilterPanelOpen: boolean;
  onFilterToggle: () => void;
  activeFilterCount: number;
}) {
  const { t } = useI18n();
  const hasActiveSort = sortBy !== DEFAULT_LIBRARY_ITEM_SORT;
  const sortMenuSections = [
    {
      id: 'sort-options',
      items: sortOptions.map((option) => ({
        id: option.value,
        kind: 'radio' as const,
        label: t(option.labelKey),
        checked: option.value === sortBy,
        onSelect: () => onSortChange(option.value),
      })),
    },
  ];

  const renderSortButton = () => (
    <ActionMenu
      ariaLabel={t('myLibrary.sort.label')}
      placement="bottom-end"
      activator={({ activatorProps, ref }) => (
        <ToolbarIconButton
          {...activatorProps}
          ref={ref}
          icon="arrow-down-up"
          showActiveDot={hasActiveSort}
          aria-label={t('myLibrary.sort.label')}
        />
      )}
      sections={sortMenuSections}
    />
  );

  return (
    <div className="relative flex flex-col gap-5">
      <div className="flex w-full items-center gap-2 md:gap-3">
        <div className="hidden">{renderSortButton()}</div>

        {/* TODO: Revisit whether local library-item search should return to the visible controls. */}
        <div className="hidden">
          <Input
            id="item-filter-input"
            aria-label={t('myLibrary.localSearch.label')}
            className="h-10 w-full border-rule/60 bg-vellum/50 text-sm focus:bg-vellum"
            placeholder={t('catalog.works.searchPlaceholder')}
            prependIcon="search"
            value={localSearchText}
            onChange={(event) => onLocalSearchChange(event.target.value)}
          />
        </div>

        <div className="hidden">
          <FilterTriggerButton
            isOpen={isFilterPanelOpen}
            onToggle={onFilterToggle}
            activeCount={activeFilterCount}
            controlsId={LIBRARY_FILTER_SHEET_TITLE_ID}
            ariaLabel={t('myLibrary.header.actions.filter')}
          />
        </div>
      </div>
    </div>
  );
}

function LibraryShelf({
  canManage,
  items,
  libraryTotalCount,
  emptyStateAddItemButtonRef,
  onOpenAddItem,
}: {
  canManage: boolean;
  items: LibraryItem[];
  libraryTotalCount?: number;
  emptyStateAddItemButtonRef: RefObject<HTMLButtonElement | null>;
  onOpenAddItem: (trigger: HTMLButtonElement | null) => void;
}) {
  const { t } = useI18n();

  if (libraryTotalCount === 0) {
    return (
      <div className="flex min-h-[320px] flex-1 items-center justify-center">
        <EmptyState
          className="-translate-y-16"
          ornament={
            <EmptyChairIllustration
              className="text-ink-3"
              width={184}
              height={184}
            />
          }
          title={{
            key: canManage
              ? 'myLibrary.items.emptyTitle'
              : 'libraries.items.empty.other.title',
          }}
          body={{
            key: canManage
              ? 'myLibrary.items.emptyBody'
              : 'libraries.items.empty.other.body',
          }}
          action={
            canManage ? (
              <Button
                ref={emptyStateAddItemButtonRef}
                onClick={(event) => onOpenAddItem(event.currentTarget)}
                className="min-w-[180px]"
                prependIcon="search"
              >
                {t('myLibrary.items.emptyAction')}
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <EmptyState
          className="-translate-y-16"
          ornament={
            <LibraryIllustration
              className="text-ink-3"
              width={184}
              height={184}
            />
          }
          title={{
            key: canManage
              ? 'myLibrary.items.noResultsTitle'
              : 'libraries.items.noResultsTitle',
          }}
          body={{
            key: canManage
              ? 'myLibrary.items.noResults'
              : 'libraries.items.noResultsBody',
          }}
        />
      </div>
    );
  }

  return (
    <ul
      aria-label={t(
        canManage ? 'myLibrary.items.title' : 'libraries.items.title',
      )}
      className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2"
      role="list"
    >
      {items.map((item) => (
        <li key={item.id}>
          <LibraryItemCard canManage={canManage} item={item} />
        </li>
      ))}
    </ul>
  );
}
