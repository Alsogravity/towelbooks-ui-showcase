import {
  contributionIdentifierRequestSchema,
  normalizeIdentifierFormatting,
} from '@towelbooks/schemas';

export type CatalogContributionOrigin =
  | { kind: 'catalog' }
  | { kind: 'library'; libraryId: string }
  | { kind: 'reading'; roomId: string; query?: string };

export type CatalogContributionLocationState = {
  origin: CatalogContributionOrigin;
  identifier?: string;
};

export function normalizeCatalogContributionIdentifier(value: string): string {
  return normalizeIdentifierFormatting(value);
}

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

export function catalogContributionOriginFromLocationState(
  state: unknown,
): CatalogContributionOrigin {
  return catalogContributionLocationStateFromLocationState(state).origin;
}

export function catalogContributionLocationStateFromLocationState(
  state: unknown,
): CatalogContributionLocationState {
  if (!isRecord(state) || !isRecord(state.origin)) {
    return { origin: { kind: 'catalog' } };
  }

  const origin = state.origin;
  let parsedOrigin: CatalogContributionOrigin;

  if (origin.kind === 'catalog') {
    parsedOrigin = { kind: 'catalog' };
  } else if (
    origin.kind === 'library' &&
    isSafeRouteSegment(origin.libraryId)
  ) {
    parsedOrigin = { kind: 'library', libraryId: origin.libraryId };
  } else if (origin.kind === 'reading' && isSafeRouteSegment(origin.roomId)) {
    const query = typeof origin.query === 'string' ? origin.query.trim() : '';

    parsedOrigin =
      query.length > 0
        ? { kind: 'reading', query, roomId: origin.roomId }
        : { kind: 'reading', roomId: origin.roomId };
  } else {
    parsedOrigin = { kind: 'catalog' };
  }

  const candidateIdentifier = isSafeRouteSegment(state.identifier)
    ? normalizeCatalogContributionIdentifier(state.identifier)
    : '';
  const identifier =
    candidateIdentifier.length > 0 &&
    contributionIdentifierRequestSchema.safeParse({
      identifier: candidateIdentifier,
    }).success
      ? candidateIdentifier
      : '';

  return identifier.length > 0
    ? { identifier, origin: parsedOrigin }
    : { origin: parsedOrigin };
}
