import {
  type CatalogItem,
  type CatalogSearchCandidate,
  type CoverGeometry,
} from '@towelbooks/schemas';

export type Translate = (
  key: string,
  options?: { fallback?: string; values?: Record<string, number | string> },
) => string;

export type SelectedCatalogWork = {
  author: string | null;
  catalogEditionId: string | null;
  coverGeometry?: CoverGeometry | null;
  coverThumbnailUrl: string | null;
  coverUrl: string | null;
  catalogWorkId: string;
  title: string;
};

export function createSelectedCatalogWorkFromSearchCandidate(
  candidate: CatalogSearchCandidate,
  catalogWorkId: string,
): SelectedCatalogWork {
  return {
    author:
      candidate.contributors.length > 0
        ? candidate.contributors.join(', ')
        : null,
    catalogEditionId: candidate.display.catalogEditionId,
    coverGeometry: candidate.coverGeometry,
    coverThumbnailUrl: candidate.coverThumbnailUrl,
    coverUrl: candidate.coverUrl,
    catalogWorkId,
    title: candidate.display.title,
  };
}

export function createSelectedCatalogWorkFromCatalogItem(
  item: CatalogItem,
): SelectedCatalogWork {
  return {
    author: item.contributors.length > 0 ? item.contributors.join(', ') : null,
    catalogEditionId: item.display.catalogEditionId,
    coverGeometry: item.display.coverGeometry,
    coverThumbnailUrl: item.display.coverThumbnailUrl,
    coverUrl: item.display.coverUrl,
    catalogWorkId: item.id,
    title: item.display.title,
  };
}

export function parseContributors(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
