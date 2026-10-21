/**
 * Book-cover image sourcing policy — single source of truth.
 *
 * Multi-source covers are allowed under provider-specific terms (ADR-008):
 * - Open Library Covers: hotlink `covers.openlibrary.org` by Cover ID or OLID
 *   only; no ISBN/OCLC/LCCN keys at display time; no bulk/crawl.
 * - First-party asset hosts: operator fixed URL or MediaAsset public URLs.
 * - Placeholder: typographic cover when nothing resolves.
 *
 * Enforced at write guardrails, CoverResolver, response sanitizer, and web
 * render allowlist. See docs/architecture/cover-image-policy.md and
 * docs/architecture/cover-resolution.md.
 */

export const COVER_SOURCES = [
  'auto',
  'open_library_covers_api',
  'fixed_url',
  'user_upload',
  'none',
] as const;

export type CoverSource = (typeof COVER_SOURCES)[number];

export const OPEN_LIBRARY_COVER_SIZES = ['S', 'M', 'L'] as const;
export type OpenLibraryCoverSize = (typeof OPEN_LIBRARY_COVER_SIZES)[number];

// Exact hosts that may serve cover image bytes to the browser.
export const ALLOWED_COVER_IMAGE_HOSTS = [
  'archive.org',
  'covers.openlibrary.org',
  'assets.towelbooks.com',
  'assets-staging.towelbooks.com',
] as const;

export const ALLOWED_COVER_IMAGE_HOST_SUFFIXES = ['.us.archive.org'] as const;

export type CoverImagePolicyOptions = Readonly<{
  /**
   * Exact, trusted first-party origins supplied by a local development
   * environment. Callers must never derive these values from user input.
   */
  additionalAllowedOrigins?: readonly string[];
}>;

const OPEN_LIBRARY_COVERS_HOST = 'covers.openlibrary.org';

/** Cover ID / OLID path segments only — ISBN/OCLC/LCCN keys are forbidden. */
const OPEN_LIBRARY_ALLOWED_KEY_PATH =
  /^\/b\/(id|olid)\/[A-Za-z0-9._-]+-[SML]\.jpe?g$/i;

const OPEN_LIBRARY_FORBIDDEN_KEY_PATH = /^\/b\/(isbn|oclc|lccn)\//i;

function isExactAllowedHost(host: string): boolean {
  return (ALLOWED_COVER_IMAGE_HOSTS as readonly string[]).includes(host);
}

function isAllowedHostSuffix(host: string): boolean {
  return (ALLOWED_COVER_IMAGE_HOST_SUFFIXES as readonly string[]).some(
    (suffix) => host.endsWith(suffix),
  );
}

function isAllowedAdditionalOrigin(
  parsed: URL,
  options: CoverImagePolicyOptions | undefined,
): boolean {
  if (parsed.protocol !== 'https:') {
    return false;
  }

  if (parsed.username || parsed.password || parsed.port) {
    return false;
  }

  return (options?.additionalAllowedOrigins ?? []).some((origin) => {
    try {
      const allowed = new URL(origin);
      return (
        !allowed.username &&
        !allowed.password &&
        allowed.protocol === 'https:' &&
        allowed.origin === parsed.origin
      );
    } catch {
      return false;
    }
  });
}

function isAllowedOpenLibraryCoverPath(pathname: string): boolean {
  if (OPEN_LIBRARY_FORBIDDEN_KEY_PATH.test(pathname)) {
    return false;
  }

  return OPEN_LIBRARY_ALLOWED_KEY_PATH.test(pathname);
}

function isAllowedArchiveCoverPath(pathname: string): boolean {
  return pathname.length > 1 && !pathname.includes('\0');
}

/**
 * Whether a cover image URL may be stored or rendered: absolute HTTPS on an
 * approved host family, with Open Library restricted to Cover ID / OLID paths.
 */
export function isAllowedCoverImageUrl(
  url: string | null | undefined,
  options?: CoverImagePolicyOptions,
): boolean {
  if (typeof url !== 'string' || url.length === 0) {
    return false;
  }

  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'https:') {
    return false;
  }

  if (parsed.username || parsed.password || parsed.port) {
    return false;
  }

  const host = parsed.hostname.toLowerCase();

  if (host === OPEN_LIBRARY_COVERS_HOST) {
    return isAllowedOpenLibraryCoverPath(parsed.pathname);
  }

  if (
    (host === 'archive.org' || host.endsWith('.us.archive.org')) &&
    isAllowedArchiveCoverPath(parsed.pathname)
  ) {
    return true;
  }

  if (isExactAllowedHost(host)) {
    return true;
  }

  return (
    isAllowedHostSuffix(host) || isAllowedAdditionalOrigin(parsed, options)
  );
}

/**
 * Returns the URL only when it is an allowed cover image URL, otherwise `null`.
 * Use at every boundary that stores or emits a cover URL.
 */
export function sanitizeCoverImageUrl(
  url: string | null | undefined,
  options?: CoverImagePolicyOptions,
): string | null {
  return isAllowedCoverImageUrl(url, options) ? (url as string) : null;
}

export type BuildOpenLibraryCoverUrlInput =
  | {
      coverId: string;
      olid?: never;
      size?: OpenLibraryCoverSize;
    }
  | {
      coverId?: never;
      olid: string;
      size?: OpenLibraryCoverSize;
    };

function normalizeOpenLibraryToken(value: string): string | null {
  const normalized = value.trim();

  if (normalized.length === 0 || /[/\\?\s]/.test(normalized)) {
    return null;
  }

  return normalized;
}

/**
 * Build a Covers API display URL using Cover ID or OLID only.
 * Never accepts ISBN/OCLC/LCCN (those keys are rate-limited and forbidden at display).
 */
export function buildOpenLibraryCoverUrl(
  input: BuildOpenLibraryCoverUrlInput,
): string | null {
  const size = input.size ?? 'L';

  if (!OPEN_LIBRARY_COVER_SIZES.includes(size)) {
    return null;
  }

  if ('coverId' in input && input.coverId != null) {
    const coverId = normalizeOpenLibraryToken(input.coverId);

    if (!coverId) {
      return null;
    }

    return sanitizeCoverImageUrl(
      `https://${OPEN_LIBRARY_COVERS_HOST}/b/id/${coverId}-${size}.jpg`,
    );
  }

  if ('olid' in input && input.olid != null) {
    const olid = normalizeOpenLibraryToken(input.olid);

    if (!olid) {
      return null;
    }

    return sanitizeCoverImageUrl(
      `https://${OPEN_LIBRARY_COVERS_HOST}/b/olid/${olid}-${size}.jpg`,
    );
  }

  return null;
}

/**
 * Durable write guard for cover URL columns: allowlisted hosts only.
 */
export function sanitizeDurableCoverImageUrl(
  url: string | null | undefined,
): string | null {
  return sanitizeCoverImageUrl(url);
}
