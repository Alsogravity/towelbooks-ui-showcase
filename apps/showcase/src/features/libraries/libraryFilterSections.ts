import type {
  LibraryItemFacetKindCounts,
  LibraryItemFacetStatusCounts,
  LibraryItemFilterableKind,
} from '@towelbooks/schemas';
import {
  getVisibleLibraryItemTypeFilters,
  type StatusFilterChipId,
} from './libraryItemFilters';

export type LibraryFilterStatusSection = {
  id: 'status';
  sectionLabel: string;
  options: { id: StatusFilterChipId; label: string }[];
};

export type LibraryFilterTypeSection = {
  id: 'type';
  sectionLabel: string;
  options: { id: LibraryItemFilterableKind; label: string }[];
};

export type LibraryFilterSectionConfig =
  LibraryFilterStatusSection | LibraryFilterTypeSection;

type TranslateFn = (
  key: string,
  options?: { values?: Record<string, number | string> },
) => string;

export function buildLibraryFilterSections(
  facets: {
    statuses: LibraryItemFacetStatusCounts;
    kinds: LibraryItemFacetKindCounts;
  } | null,
  t: TranslateFn,
): LibraryFilterSectionConfig[] {
  const visibleKinds = getVisibleLibraryItemTypeFilters(facets?.kinds);
  const counts = {
    reading: facets?.statuses.reading ?? 0,
    notStarted: facets?.statuses.not_started ?? 0,
    finished: facets?.statuses.read ?? 0,
    paused: facets?.statuses.paused ?? 0,
    abandoned: facets?.statuses.abandoned ?? 0,
    manga: facets?.kinds.manga ?? 0,
    books: facets?.kinds.book ?? 0,
    comics: facets?.kinds.comic ?? 0,
  };

  return [
    {
      id: 'status',
      sectionLabel: t('myLibrary.filter.statusSectionLabel'),
      options: [
        {
          id: 'reading',
          label: t('myLibrary.filter.reading', {
            values: { count: counts.reading },
          }),
        },
        {
          id: 'not_started',
          label: t('myLibrary.filter.notStarted', {
            values: { count: counts.notStarted },
          }),
        },
        {
          id: 'read',
          label: t('myLibrary.filter.finished', {
            values: { count: counts.finished },
          }),
        },
        {
          id: 'paused',
          label: t('myLibrary.filter.paused', {
            values: { count: counts.paused },
          }),
        },
        {
          id: 'abandoned',
          label: t('myLibrary.filter.abandoned', {
            values: { count: counts.abandoned },
          }),
        },
      ],
    },
    {
      id: 'type',
      sectionLabel: t('myLibrary.filter.typeSectionLabel'),
      options: [
        {
          id: 'book',
          label: t('myLibrary.filter.books', {
            values: { count: counts.books },
          }),
        },
        ...(visibleKinds.includes('manga')
          ? [
              {
                id: 'manga' as const,
                label: t('myLibrary.filter.manga', {
                  values: { count: counts.manga },
                }),
              },
            ]
          : []),
        ...(visibleKinds.includes('comic')
          ? [
              {
                id: 'comic' as const,
                label: t('myLibrary.filter.comic', {
                  values: { count: counts.comics },
                }),
              },
            ]
          : []),
      ],
    },
  ];
}
