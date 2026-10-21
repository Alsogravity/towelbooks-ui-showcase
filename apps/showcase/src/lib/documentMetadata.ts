import {
  resolveLocalizedText,
  type AppLocale,
  type LocalizedText,
  type TranslationValues,
} from '../i18n';

type TranslateFn = (
  key: string,
  options?: { fallback?: string; values?: TranslationValues },
) => string;

const APP_NAME = 'TowelBooks';
const CANONICAL_ORIGIN = 'https://towelbooks-ui-showcase.pages.dev';
export const PROFILE_DEFAULT_SOCIAL_IMAGE =
  'https://towelbooks-ui-showcase.pages.dev/assets/brand/og-image-en.png';
export const PROFILE_DEFAULT_SOCIAL_IMAGE_ALT =
  'TowelBooks: the reading life, together';
export const INDEXABLE_ROBOTS_DIRECTIVE =
  'index, follow, max-image-preview:large';
export const NON_INDEXABLE_ROBOTS_DIRECTIVE = 'noindex, nofollow, noarchive';
export type RobotsDirective =
  typeof INDEXABLE_ROBOTS_DIRECTIVE | typeof NON_INDEXABLE_ROBOTS_DIRECTIVE;
type OpenGraphType = 'profile' | 'website';
type SocialImageType = 'image/png' | 'image/webp';
type TwitterCard = 'summary' | 'summary_large_image';
const INDEXABLE_PUBLIC_PATHS = new Set([
  '/',
  '/pricing',
  '/legal/privacy',
  '/legal/privacy/changelog',
  '/legal/privacy/revisions',
  '/legal/terms',
  '/legal/terms/revisions',
  '/legal/cookies',
  '/catalog-reviews',
]);

// Absolute base for social-share images. Non-JS scrapers read the static
// (default-locale) card committed in index.html; the locale-aware swap here is
// for JS-rendering crawlers and in-app share previews.
const SHARE_IMAGE_ORIGIN =
  'https://towelbooks-ui-showcase.pages.dev/assets/brand';

export function shareImageUrl(locale: AppLocale): string {
  return `${SHARE_IMAGE_ORIGIN}/${locale === 'en-US' ? 'og-image-en.png' : 'og-image.png'}`;
}

/** Document metadata a route may declare via `useDocumentMetadata`. */
export type DocumentMetadataOverride = {
  canonicalPath?: string;
  description?: LocalizedText;
  ogType?: OpenGraphType;
  robots?: RobotsDirective;
  socialPath?: string | null;
  shareTitle?: LocalizedText;
  shareImage?: string;
  shareImageAlt?: LocalizedText;
  shareImageHeight?: 256 | 630 | null;
  shareImageType?: SocialImageType | null;
  shareImageWidth?: 256 | 1200 | null;
  twitterCard?: TwitterCard;
};

export type ResolvedDocumentMetadata = {
  description: string;
  ogType: OpenGraphType;
  shareTitle: string;
  shareImage: string;
  shareImageAlt: string;
  shareImageHeight?: 256 | 630;
  shareImageType?: SocialImageType;
  shareImageWidth?: 256 | 1200;
  twitterCard: TwitterCard;
  ogLocale: string;
  ogLocaleAlternate: string;
  robots: string;
  socialUrl: string | null;
  canonicalUrl: string | null;
};

export function resolveRobotsDirective(pathname: string): string {
  return INDEXABLE_PUBLIC_PATHS.has(pathname)
    ? INDEXABLE_ROBOTS_DIRECTIVE
    : NON_INDEXABLE_ROBOTS_DIRECTIVE;
}

function resolveCanonicalUrl(pathname: string): string {
  if (
    !pathname.startsWith('/') ||
    pathname.includes('://') ||
    pathname.includes('?') ||
    pathname.includes('#')
  ) {
    throw new Error('canonicalPath must be an absolute path without a query.');
  }

  return `${CANONICAL_ORIGIN}${pathname}`;
}

/** Brand defaults applied whenever the active route declares no overrides. */
export function resolveDefaultMetadata(
  t: TranslateFn,
  locale: AppLocale,
  pathname = '/',
): ResolvedDocumentMetadata {
  const appName = t('app.name', { fallback: APP_NAME });
  const robots = resolveRobotsDirective(pathname);
  const canonicalUrl = robots.startsWith('index')
    ? resolveCanonicalUrl(pathname)
    : null;

  return {
    description: t('meta.description', {
      fallback:
        'TowelBooks — a collaborative reading app for small private rooms.',
    }),
    ogType: 'website',
    shareTitle: t('meta.shareTitle', { fallback: appName }),
    shareImage: shareImageUrl(locale),
    shareImageAlt: t('meta.shareImageAlt', { fallback: appName }),
    shareImageHeight: 630,
    shareImageType: 'image/png',
    shareImageWidth: 1200,
    twitterCard: 'summary_large_image',
    ogLocale: locale === 'en-US' ? 'en_US' : 'pt_BR',
    ogLocaleAlternate: locale === 'en-US' ? 'pt_BR' : 'en_US',
    robots,
    socialUrl: canonicalUrl,
    canonicalUrl,
  };
}

export function resolveDocumentMetadata(
  override: DocumentMetadataOverride,
  t: TranslateFn,
  locale: AppLocale,
  pathname = '/',
): ResolvedDocumentMetadata {
  const defaults = resolveDefaultMetadata(t, locale, pathname);
  const canonicalPath = override.canonicalPath ?? pathname;
  const robots = override.robots ?? defaults.robots;
  const canonicalUrl = robots.startsWith('index')
    ? resolveCanonicalUrl(canonicalPath)
    : null;
  const socialUrl =
    override.socialPath === null
      ? null
      : override.socialPath
        ? resolveCanonicalUrl(override.socialPath)
        : defaults.socialUrl;

  return {
    description: override.description
      ? resolveLocalizedText(override.description, t)
      : defaults.description,
    ogType: override.ogType ?? defaults.ogType,
    shareTitle: override.shareTitle
      ? resolveLocalizedText(override.shareTitle, t)
      : defaults.shareTitle,
    shareImage: override.shareImage ?? defaults.shareImage,
    shareImageAlt: override.shareImageAlt
      ? resolveLocalizedText(override.shareImageAlt, t)
      : defaults.shareImageAlt,
    shareImageHeight:
      override.shareImageHeight === null
        ? undefined
        : (override.shareImageHeight ?? defaults.shareImageHeight),
    shareImageType:
      override.shareImageType === null
        ? undefined
        : (override.shareImageType ?? defaults.shareImageType),
    shareImageWidth:
      override.shareImageWidth === null
        ? undefined
        : (override.shareImageWidth ?? defaults.shareImageWidth),
    twitterCard: override.twitterCard ?? defaults.twitterCard,
    ogLocale: defaults.ogLocale,
    ogLocaleAlternate: defaults.ogLocaleAlternate,
    robots,
    socialUrl,
    canonicalUrl,
  };
}

type ProfileSocialMetadataSource = {
  avatar: {
    imageUrl: string | null;
    imageUrls?: Record<'128' | '256', string> | null;
  };
  bio: string | null;
  username: string;
};

export type ProfileSocialMetadata = {
  description: string;
  ogType: 'profile';
  shareImage: string;
  shareImageAlt: string;
  shareImageHeight?: 256 | 630;
  shareImageType?: SocialImageType;
  shareImageWidth?: 256 | 1200;
  shareTitle: string;
  twitterCard: 'summary';
};

function isSafeSocialImageUrl(
  value: string | null | undefined,
): value is string {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === 'https:' &&
      url.username.length === 0 &&
      url.password.length === 0
    );
  } catch {
    return false;
  }
}

export function resolveProfileSocialMetadata(
  profile: ProfileSocialMetadataSource,
): ProfileSocialMetadata | null {
  const avatarImage256 = profile.avatar.imageUrls?.['256'];
  const avatarImageUrl = profile.avatar.imageUrl;

  if (
    (avatarImage256 !== undefined && !isSafeSocialImageUrl(avatarImage256)) ||
    (avatarImageUrl !== null && !isSafeSocialImageUrl(avatarImageUrl))
  ) {
    return null;
  }

  const avatarImage = [avatarImage256, avatarImageUrl].find(
    isSafeSocialImageUrl,
  );
  const hasKnownAvatarMetadata = isSafeSocialImageUrl(avatarImage256);
  const username = `@${profile.username}`;

  return {
    description: profile.bio?.trim() || `View ${username} on TowelBooks.`,
    ogType: 'profile',
    shareImage: avatarImage ?? PROFILE_DEFAULT_SOCIAL_IMAGE,
    shareImageAlt: `${username} on TowelBooks`,
    shareImageHeight: hasKnownAvatarMetadata
      ? 256
      : avatarImage
        ? undefined
        : 630,
    shareImageType: hasKnownAvatarMetadata
      ? 'image/webp'
      : avatarImage
        ? undefined
        : 'image/png',
    shareImageWidth: hasKnownAvatarMetadata
      ? 256
      : avatarImage
        ? undefined
        : 1200,
    shareTitle: `TowelBooks - ${username}`,
    twitterCard: 'summary',
  };
}

function updateMetaContent(
  selector: string,
  content: string | undefined,
  attributes?: { name?: string; property?: string },
) {
  const elements = Array.from(
    document.querySelectorAll<HTMLMetaElement>(selector),
  );
  let element = elements.shift();

  elements.forEach((duplicate) => duplicate.remove());

  if (content === undefined) {
    element?.remove();
    return;
  }

  if (!element) {
    if (!attributes) {
      return;
    }

    element = document.createElement('meta');
    Object.entries(attributes).forEach(([name, value]) => {
      if (value) {
        element!.setAttribute(name, value);
      }
    });
    document.head.appendChild(element);
  }

  element.content = content;
}

/**
 * Writes resolved metadata onto the existing static tags so there is always a
 * single, deduplicated tag per channel (the no-JS fallback stays authoritative
 * for scrapers; this keeps it in sync for JS-rendering consumers).
 */
export function applyDocumentMetadata(meta: ResolvedDocumentMetadata) {
  if (typeof document === 'undefined') {
    return;
  }

  updateMetaContent('meta[name="description"]', meta.description);
  updateMetaContent('meta[name="robots"]', meta.robots);
  updateMetaContent('meta[property="og:type"]', meta.ogType);
  updateMetaContent('meta[property="og:locale"]', meta.ogLocale, {
    property: 'og:locale',
  });
  updateMetaContent(
    'meta[property="og:locale:alternate"]',
    meta.ogLocaleAlternate,
    { property: 'og:locale:alternate' },
  );
  updateMetaContent('meta[property="og:url"]', meta.socialUrl ?? '');
  updateMetaContent('meta[property="og:title"]', meta.shareTitle);
  updateMetaContent('meta[property="og:description"]', meta.description);
  updateMetaContent('meta[property="og:image"]', meta.shareImage);
  updateMetaContent('meta[property="og:image:type"]', meta.shareImageType, {
    property: 'og:image:type',
  });
  updateMetaContent(
    'meta[property="og:image:width"]',
    meta.shareImageWidth === undefined
      ? undefined
      : String(meta.shareImageWidth),
    { property: 'og:image:width' },
  );
  updateMetaContent(
    'meta[property="og:image:height"]',
    meta.shareImageHeight === undefined
      ? undefined
      : String(meta.shareImageHeight),
    { property: 'og:image:height' },
  );
  updateMetaContent('meta[property="og:image:alt"]', meta.shareImageAlt);
  updateMetaContent('meta[name="twitter:card"]', meta.twitterCard);
  updateMetaContent('meta[name="twitter:title"]', meta.shareTitle);
  updateMetaContent('meta[name="twitter:description"]', meta.description);
  updateMetaContent('meta[name="twitter:image"]', meta.shareImage);
  updateMetaContent('meta[name="twitter:image:alt"]', meta.shareImageAlt);

  const canonicalLink = document.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );

  if (canonicalLink) {
    if (meta.canonicalUrl) {
      canonicalLink.href = meta.canonicalUrl;
    } else {
      canonicalLink.removeAttribute('href');
    }
  }
}
