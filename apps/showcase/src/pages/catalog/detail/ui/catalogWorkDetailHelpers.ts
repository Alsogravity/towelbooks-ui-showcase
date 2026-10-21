import {
  type CatalogEdition,
  type CatalogItem,
  type CatalogWorkType,
  type LibraryItemOwnershipFormat,
} from '@towelbooks/schemas';

import type { Translate } from '../../../../i18n';

import {
  type CatalogCoverSource,
  catalogCoverSourcesFromUrl,
  catalogWorkCoverSources,
} from '../../../../entities/reading/ui/coverImages';

export type CatalogWorkDetailTabKey =
  'overview' | 'ratings' | 'catalog-reviews';

export type CatalogWorkDetailField = {
  label: string;
  value: string;
};

export function getCatalogWorkTypeLabel(
  kind: CatalogWorkType,
  t: Translate,
): string {
  switch (kind) {
    case 'manga':
      return t('catalog.workDetail.type.manga');
    case 'comic':
      return t('catalog.workDetail.type.comic');
    case 'book':
      return t('catalog.workDetail.type.book');
  }
}

export function resolveCatalogWorkDetailTab(
  tab: string | null,
): CatalogWorkDetailTabKey {
  if (tab === 'ratings' || tab === 'catalog-reviews') {
    return tab;
  }

  return 'overview';
}

export function buildDetailCoverSources(
  item: CatalogItem,
): CatalogCoverSource[] {
  return catalogWorkCoverSources({
    coverUrl: item.display.coverUrl,
    coverThumbnailUrl: item.display.coverThumbnailUrl,
    coverGeometry: item.display.coverGeometry ?? null,
    coverResolvedSource: (item as { coverResolvedSource?: string | null })
      .coverResolvedSource,
  });
}

export function buildCatalogEditionCoverSources(
  item: CatalogItem,
  edition: CatalogEdition,
): CatalogCoverSource[] {
  const usesWorkCover =
    item.display.coverCatalogEditionId === edition.id ||
    (item.display.coverUrl !== null &&
      edition.coverUrl === item.display.coverUrl) ||
    (item.display.coverThumbnailUrl !== null &&
      edition.coverThumbnailUrl === item.display.coverThumbnailUrl);

  if (usesWorkCover) {
    return buildDetailCoverSources(item);
  }

  return catalogCoverSourcesFromUrl(
    edition.coverUrl,
    edition.coverThumbnailUrl,
  );
}

export function toggleOwnershipFormat(
  selectedFormats: LibraryItemOwnershipFormat[],
  format: LibraryItemOwnershipFormat,
) {
  return selectedFormats.includes(format)
    ? selectedFormats.filter((selectedFormat) => selectedFormat !== format)
    : [...selectedFormats, format];
}
