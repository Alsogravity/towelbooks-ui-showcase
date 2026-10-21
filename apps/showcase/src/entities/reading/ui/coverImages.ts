import {
  normalizeCoverGeometry,
  sanitizeCoverImageUrl,
  type CoverGeometry,
} from '@towelbooks/schemas';

export type CatalogCoverVariant = 'detail' | 'thumbnail';

export type CatalogCoverSource = {
  coverThumbnailUrl: string | null;
  coverUrl: string | null;
  /** Intrinsic geometry for this exact artwork source, never CSS dimensions. */
  coverGeometry?: CoverGeometry | null;
  /** When the API exposes resolved source (detail/admin). Optional. */
  coverResolvedSource?: string | null;
};

export type CatalogWorkCoverFields = {
  coverUrl?: string | null;
  coverThumbnailUrl?: string | null;
  coverGeometry?: CoverGeometry | null;
  coverResolvedSource?: string | null;
};

export function catalogCoverSourcesFromUrl(
  coverUrl?: string | null,
  coverThumbnailUrl?: string | null,
  coverGeometry?: CoverGeometry | null,
): CatalogCoverSource[] {
  if (!coverUrl && !coverThumbnailUrl) {
    return [];
  }

  return [
    {
      coverThumbnailUrl: coverThumbnailUrl ?? null,
      coverUrl: coverUrl ?? null,
      coverGeometry: coverGeometry ?? null,
    },
  ];
}

/** Work-level cover sources only (ADR-008); never edition URLs. */
export function catalogWorkCoverSources(
  fields: CatalogWorkCoverFields = {},
): CatalogCoverSource[] {
  const sources = catalogCoverSourcesFromUrl(
    fields.coverUrl,
    fields.coverThumbnailUrl,
    fields.coverGeometry,
  );

  if (sources.length === 0 || fields.coverResolvedSource == null) {
    return sources;
  }

  return [{ ...sources[0], coverResolvedSource: fields.coverResolvedSource }];
}

// Multi-source allowlist (Open Library Cover ID/OLID paths, first-party
// assets). Clients never assemble cover URLs from ISBN.
// Source of truth: cover-policy in @towelbooks/schemas.
function normalizeCatalogCoverUrl(
  url: string | null | undefined,
): string | null {
  const localMediaOrigin = import.meta.env.DEV
    ? import.meta.env.VITE_LOCAL_MEDIA_ORIGIN?.trim()
    : undefined;

  return sanitizeCoverImageUrl(
    url,
    localMediaOrigin
      ? { additionalAllowedOrigins: [localMediaOrigin] }
      : undefined,
  );
}

export function resolveCatalogCoverUrls(
  source: CatalogCoverSource,
  preferredVariant: CatalogCoverVariant,
): string[] {
  return resolveCatalogCoverCandidates(source, preferredVariant).map(
    (candidate) => candidate.url,
  );
}

export type CatalogCoverCandidate = {
  coverGeometry: CoverGeometry | null;
  url: string;
};

export function resolveCatalogCoverCandidates(
  source: CatalogCoverSource,
  preferredVariant: CatalogCoverVariant,
): CatalogCoverCandidate[] {
  const orderedCandidates =
    preferredVariant === 'thumbnail'
      ? [source.coverThumbnailUrl, source.coverUrl]
      : [source.coverUrl, source.coverThumbnailUrl];

  const seen = new Set<string>();

  return orderedCandidates.flatMap((candidate) => {
    const url = normalizeCatalogCoverUrl(candidate);

    if (!url || seen.has(url)) {
      return [];
    }

    seen.add(url);
    return [
      {
        coverGeometry: normalizeCoverGeometry(source.coverGeometry),
        url,
      },
    ];
  });
}

export function resolveCatalogCoverUrl(
  source: CatalogCoverSource,
  preferredVariant: CatalogCoverVariant,
): string | null {
  return resolveCatalogCoverUrls(source, preferredVariant)[0] ?? null;
}

export function isOpenLibraryCoverSource(
  source: string | null | undefined,
): boolean {
  return source === 'open_library_covers_api';
}

export function openLibraryCourtesyAttributionUrl(
  noticeUrl?: string | null,
): string {
  if (typeof noticeUrl === 'string' && noticeUrl.startsWith('https://')) {
    return noticeUrl;
  }

  return 'https://openlibrary.org';
}

export function isProbablyValidCatalogCoverDimensions(
  width: number,
  height: number,
): boolean {
  if (width <= 0 || height <= 0) {
    return false;
  }

  const aspectRatio = width / height;

  return aspectRatio >= 0.3 && aspectRatio <= 0.85;
}
