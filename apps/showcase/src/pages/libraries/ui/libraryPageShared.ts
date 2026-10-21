import {
  type LibraryItem,
  type LibraryItemAcquisitionSource,
  type LibraryItemDigitalPlatform,
  type LibraryItemOwnershipFormat,
  type LibraryItemPhysicalCondition,
  type LibraryItemReadingStatus,
  type LibraryItemSort,
  libraryItemAcquisitionSourceSchema,
  libraryItemDigitalPlatformSchema,
  libraryItemOwnershipFormatSchema,
  libraryItemPhysicalConditionSchema,
  libraryItemReadingStatusSchema,
  type CatalogSourceProvider,
  type CatalogWorkType,
  catalogWorkTypeSchema,
} from '@towelbooks/schemas';

import type { TagVariant } from '../../../components/primitives';
import { catalogWorkCoverSources } from '../../../entities/reading/ui/coverImages';

export type FilterValue = 'all' | LibraryItemReadingStatus | CatalogWorkType;

const readingKindMap = catalogWorkTypeSchema.enum;
const libraryItemReadingStatusMap = libraryItemReadingStatusSchema.enum;
const libraryItemOwnershipFormatMap = libraryItemOwnershipFormatSchema.enum;
const libraryItemAcquisitionSourceMap = libraryItemAcquisitionSourceSchema.enum;
const libraryItemPhysicalConditionMap = libraryItemPhysicalConditionSchema.enum;
const libraryItemDigitalPlatformMap = libraryItemDigitalPlatformSchema.enum;

export const libraryItemReadingStatusValues = Object.values(
  libraryItemReadingStatusMap,
) as LibraryItemReadingStatus[];

export const readingStatusValues = libraryItemReadingStatusValues;

export const libraryItemOwnershipFormatValues = Object.values(
  libraryItemOwnershipFormatMap,
) as LibraryItemOwnershipFormat[];

export const libraryItemAcquisitionSourceValues = Object.values(
  libraryItemAcquisitionSourceMap,
) as LibraryItemAcquisitionSource[];

export const libraryItemPhysicalConditionValues = Object.values(
  libraryItemPhysicalConditionMap,
) as LibraryItemPhysicalCondition[];

export const libraryItemDigitalPlatformValues = Object.values(
  libraryItemDigitalPlatformMap,
) as LibraryItemDigitalPlatform[];

export const sourceLabelKeys: Record<CatalogSourceProvider, string> = {
  manual: 'myLibrary.items.source.manual',
  open_library: 'myLibrary.items.source.openLibrary',
};

export const ownershipFormatLabelKeys: Record<
  LibraryItemOwnershipFormat,
  string
> = {
  physical: 'myLibrary.items.ownership.format.physical',
  ebook: 'myLibrary.items.ownership.format.ebook',
  audiobook: 'myLibrary.items.ownership.format.audiobook',
};

export const ownershipSourceLabelKeys: Record<
  LibraryItemAcquisitionSource,
  string
> = {
  purchased: 'myLibrary.items.ownership.source.purchased',
  gift: 'myLibrary.items.ownership.source.gift',
  borrowed: 'myLibrary.items.ownership.source.borrowed',
  other: 'myLibrary.items.ownership.source.other',
};

export const ownershipConditionLabelKeys: Record<
  LibraryItemPhysicalCondition,
  string
> = {
  new: 'myLibrary.items.ownership.condition.new',
  good: 'myLibrary.items.ownership.condition.good',
  worn: 'myLibrary.items.ownership.condition.worn',
  damaged: 'myLibrary.items.ownership.condition.damaged',
  unknown: 'myLibrary.items.ownership.condition.unknown',
};

export const ownershipPlatformLabelKeys: Record<
  LibraryItemDigitalPlatform,
  string
> = {
  kindle: 'myLibrary.items.ownership.platform.kindle',
  kobo: 'myLibrary.items.ownership.platform.kobo',
  apple_books: 'myLibrary.items.ownership.platform.appleBooks',
  google_play_books: 'myLibrary.items.ownership.platform.googlePlayBooks',
  pdf: 'myLibrary.items.ownership.platform.pdf',
  epub: 'myLibrary.items.ownership.platform.epub',
  other: 'myLibrary.items.ownership.platform.other',
  unknown: 'myLibrary.items.ownership.platform.unknown',
};

export const DEFAULT_LIBRARY_ITEM_SORT: LibraryItemSort = 'recently_added';

export const sortOptions: { value: LibraryItemSort; labelKey: string }[] = [
  { value: 'recently_added', labelKey: 'myLibrary.sort.recently_added' },
  { value: 'recently_updated', labelKey: 'myLibrary.sort.recently_updated' },
  { value: 'title', labelKey: 'myLibrary.sort.title' },
];

export const statusConfig: Record<
  LibraryItemReadingStatus,
  { labelKey: string; tagVariant: TagVariant }
> = {
  not_started: {
    labelKey: 'myLibrary.status.notStarted',
    tagVariant: 'default',
  },
  reading: {
    labelKey: 'myLibrary.status.reading',
    tagVariant: 'reading',
  },
  read: {
    labelKey: 'myLibrary.status.read',
    tagVariant: 'role',
  },
  paused: {
    labelKey: 'myLibrary.status.paused',
    tagVariant: 'paused',
  },
  abandoned: {
    labelKey: 'myLibrary.status.abandoned',
    tagVariant: 'private',
  },
};

export function getReadingSessionCountLabelKey(count: number): string {
  return count === 1
    ? 'myLibrary.items.sessions.countOne'
    : 'myLibrary.items.sessions.count';
}

export function getItemTitle(item: LibraryItem): string {
  return item.work.display.title;
}

export function matchesLibraryItemLocalSearch(
  item: LibraryItem,
  query: string,
): boolean {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const normalizedTitle = item.work.display.title.toLowerCase();
  const normalizedAuthor = (item.work.contributors[0] ?? '').toLowerCase();

  return (
    normalizedTitle.includes(normalizedQuery) ||
    normalizedAuthor.includes(normalizedQuery)
  );
}

export function sortItems(
  items: LibraryItem[],
  sortBy: LibraryItemSort,
): LibraryItem[] {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return getItemTitle(a).localeCompare(getItemTitle(b));
      case 'recently_updated':
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });
}

export function parseContributors(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function hasOwnKey<T extends object>(
  object: T,
  key: PropertyKey,
): key is Extract<keyof T, string> {
  return Object.hasOwn(object, key);
}

export function isLibraryItemReadingStatusValue(
  value: FilterValue,
): value is LibraryItemReadingStatus {
  return hasOwnKey(libraryItemReadingStatusMap, value);
}

export function isCatalogWorkTypeValue(
  value: FilterValue,
): value is CatalogWorkType {
  return hasOwnKey(readingKindMap, value);
}

export function getLibraryItemCoverSources(item: LibraryItem) {
  return catalogWorkCoverSources(item.work.display);
}
