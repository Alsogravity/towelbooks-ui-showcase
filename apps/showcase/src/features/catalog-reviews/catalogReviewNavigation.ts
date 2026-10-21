export type CatalogReviewOrigin =
  | {
      kind: 'catalog-review-discovery';
    }
  | {
      kind: 'library-item';
      libraryId: string;
      libraryItemId: string;
    }
  | {
      kind: 'profile-reviews';
      username: string;
    };

export type CatalogReviewLocationState = {
  origin?: CatalogReviewOrigin;
};

function isSafeRouteSegment(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    !/[/?#]/u.test(value)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function catalogReviewOriginFromLocationState(
  state: unknown,
): CatalogReviewOrigin | null {
  if (!isRecord(state) || !isRecord(state.origin)) {
    return null;
  }

  const origin = state.origin;
  if (origin.kind === 'catalog-review-discovery') {
    return { kind: origin.kind };
  }

  if (
    origin.kind === 'profile-reviews' &&
    isSafeRouteSegment(origin.username)
  ) {
    return { kind: origin.kind, username: origin.username };
  }

  if (
    origin.kind !== 'library-item' ||
    !isSafeRouteSegment(origin.libraryId) ||
    !isSafeRouteSegment(origin.libraryItemId)
  ) {
    return null;
  }

  return {
    kind: 'library-item',
    libraryId: origin.libraryId,
    libraryItemId: origin.libraryItemId,
  };
}

export function buildCatalogReviewLocationState(
  origin: CatalogReviewOrigin | null,
): CatalogReviewLocationState | undefined {
  return origin ? { origin } : undefined;
}

export function buildCatalogReviewBackHref(
  catalogWorkId: string,
  origin: CatalogReviewOrigin | null,
): string {
  if (origin?.kind === 'catalog-review-discovery') {
    return '/catalog-reviews';
  }

  if (origin?.kind === 'profile-reviews') {
    return `/${encodeURIComponent(origin.username)}/reviews`;
  }

  if (origin) {
    return `/libraries/${encodeURIComponent(origin.libraryId)}/items/${encodeURIComponent(origin.libraryItemId)}`;
  }

  return `/catalog/${encodeURIComponent(catalogWorkId)}?tab=catalog-reviews`;
}
