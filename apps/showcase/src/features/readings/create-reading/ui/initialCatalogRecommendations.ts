import type { CatalogSearchCandidate, HomeResponse } from '@towelbooks/schemas';

export const INITIAL_CATALOG_RECOMMENDATION_COUNT = 6;

/**
 * Keeps the home service's ranking authoritative while making the compact
 * reading-flow selection deterministic. Catalog browse candidates only fill a
 * sparse home response; they never reorder personalized recommendations.
 */
export function selectInitialCatalogRecommendations(
  home: Pick<HomeResponse, 'discover' | 'forYou'> | undefined,
  fallbackCandidates: readonly CatalogSearchCandidate[] = [],
): CatalogSearchCandidate[] {
  const selected: CatalogSearchCandidate[] = [];
  const selectedIds = new Set<string>();

  for (const candidate of [
    ...(home?.forYou ?? []),
    ...(home?.discover ?? []),
    ...fallbackCandidates,
  ]) {
    if (selectedIds.has(candidate.catalogWorkId)) {
      continue;
    }

    selected.push(candidate);
    selectedIds.add(candidate.catalogWorkId);

    if (selected.length === INITIAL_CATALOG_RECOMMENDATION_COUNT) {
      break;
    }
  }

  return selected;
}
