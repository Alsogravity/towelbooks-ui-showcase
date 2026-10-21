import type {
  AffiliatePlacement,
  AffiliateProvider,
  AnalyticsEvent,
  AnalyticsEventMap,
  AnalyticsReferrerCategory,
  AnalyticsRouteName,
  CatalogWorkOpenSource,
} from './types';

const MAX_EVENT_STRING_LENGTH = 64;
const MAX_QUERY_LENGTH = 256;
const MAX_RESULT_COUNT = 10_000;

const routeNames = new Set<AnalyticsRouteName>([
  'landing',
  'login',
  'register',
  'catalog_search',
  'book_detail',
  'room_detail',
  'settings_privacy',
  'legal_privacy',
  'legal_cookies',
  'legal_terms',
  'not_found',
]);
const referrerCategories = new Set<AnalyticsReferrerCategory>([
  'internal',
  'external',
  'direct',
]);
const catalogWorkOpenSources = new Set<CatalogWorkOpenSource>([
  'catalog_search',
  'library',
  'room',
  'direct_navigation',
]);
const affiliateProviders = new Set<AffiliateProvider>(['amazon_br']);
const affiliatePlacements = new Set<AffiliatePlacement>([
  'book_detail_primary',
  'book_detail_secondary',
  'reading_section',
  'library_item_header',
]);
const approvedParameterKeys = new Set([
  'route_name',
  'referrer_category',
  'query_length',
  'result_count',
  'source',
  'provider',
  'placement',
]);

const sensitiveKeyPattern =
  /(?:email|name|password|passcode|token|secret|authorization|cookie|session|state|code|redirect|invite|reset)/i;
const sensitiveValuePattern =
  /(?:https?:\/\/|javascript:|data:|bearer\s|password|passcode|token|secret|authorization|cookie|session|invite|reset|@[a-z0-9.-]+\.[a-z]{2,})/i;

type AnalyticsRecord = Record<string, unknown>;

export type SanitizedAnalyticsEvent = {
  event: AnalyticsEvent;
  params: AnalyticsEventMap[AnalyticsEvent];
};

export function sanitizeAnalyticsEvent(
  event: unknown,
  params: unknown,
): SanitizedAnalyticsEvent | null {
  if (!isAnalyticsEvent(event) || !isRecord(params)) {
    return null;
  }

  if (hasSensitiveEntries(params)) {
    return null;
  }

  switch (event) {
    case 'page_view_v1':
      return sanitizePageView(params);
    case 'signup_completed_v1':
    case 'login_v1':
      return { event, params: {} };
    case 'search_v1':
      return sanitizeSearch(params);
    case 'book_opened_v1':
      return sanitizeCatalogWorkOpened(params);
    case 'affiliate_link_clicked_v1':
      return sanitizeAffiliateClick(params);
  }
}

export function routeNameFromPath(pathname: string): AnalyticsRouteName {
  const normalizedPath = pathname.split(/[?#]/, 1)[0] || '/';

  if (normalizedPath === '/') return 'landing';
  if (
    /^\/(?:login|forgot-password|reset-password|verify-email)/.test(
      normalizedPath,
    )
  ) {
    return 'login';
  }
  if (/^\/register(?:\/|$)/.test(normalizedPath)) return 'register';
  if (/^\/legal\/privacy(?:\/|$)/.test(normalizedPath)) {
    return 'legal_privacy';
  }
  if (/^\/legal\/cookies(?:\/|$)/.test(normalizedPath)) {
    return 'legal_cookies';
  }
  if (/^\/legal\/terms(?:\/|$)/.test(normalizedPath)) return 'legal_terms';
  if (/^\/(?:settings|legal-updates)(?:\/|$)/.test(normalizedPath)) {
    return 'settings_privacy';
  }
  if (/^\/catalog\/[^/]+$/.test(normalizedPath)) return 'book_detail';
  if (/^\/rooms\/[^/]+$/.test(normalizedPath)) return 'room_detail';
  if (/^\/(?:catalog|my-library|libraries)(?:\/|$)/.test(normalizedPath)) {
    return 'catalog_search';
  }

  return 'not_found';
}

export function referrerCategoryFromValue(
  referrer: string | undefined,
): AnalyticsReferrerCategory {
  if (!referrer) return 'direct';

  try {
    const parsed = new URL(referrer);
    return typeof window !== 'undefined' &&
      parsed.origin === window.location.origin
      ? 'internal'
      : 'external';
  } catch {
    return 'direct';
  }
}

function sanitizePageView(
  params: AnalyticsRecord,
): SanitizedAnalyticsEvent | null {
  const routeName = params.route_name;
  const referrerCategory = params.referrer_category;

  if (
    !isFiniteString(routeName, routeNames) ||
    !isFiniteString(referrerCategory, referrerCategories)
  ) {
    return null;
  }

  return {
    event: 'page_view_v1',
    params: {
      route_name: routeName,
      referrer_category: referrerCategory,
    },
  };
}

function sanitizeSearch(
  params: AnalyticsRecord,
): SanitizedAnalyticsEvent | null {
  const queryLength = params.query_length;
  const resultCount = params.result_count;

  if (
    !isBoundedInteger(queryLength, 0, MAX_QUERY_LENGTH) ||
    !isBoundedInteger(resultCount, 0, MAX_RESULT_COUNT)
  ) {
    return null;
  }

  return {
    event: 'search_v1',
    params: { query_length: queryLength, result_count: resultCount },
  };
}

function sanitizeCatalogWorkOpened(
  params: AnalyticsRecord,
): SanitizedAnalyticsEvent | null {
  const source = params.source;

  if (!isFiniteString(source, catalogWorkOpenSources)) return null;

  return { event: 'book_opened_v1', params: { source } };
}

function sanitizeAffiliateClick(
  params: AnalyticsRecord,
): SanitizedAnalyticsEvent | null {
  const provider = params.provider;
  const placement = params.placement;

  if (
    !isFiniteString(provider, affiliateProviders) ||
    !isFiniteString(placement, affiliatePlacements)
  ) {
    return null;
  }

  return {
    event: 'affiliate_link_clicked_v1',
    params: { provider, placement },
  };
}

function isAnalyticsEvent(value: unknown): value is AnalyticsEvent {
  return (
    value === 'page_view_v1' ||
    value === 'signup_completed_v1' ||
    value === 'login_v1' ||
    value === 'search_v1' ||
    value === 'book_opened_v1' ||
    value === 'affiliate_link_clicked_v1'
  );
}

function isFiniteString<T extends string>(
  value: unknown,
  allowed: Set<T>,
): value is T {
  return (
    typeof value === 'string' &&
    value.length <= MAX_EVENT_STRING_LENGTH &&
    allowed.has(value as T)
  );
}

function isBoundedInteger(
  value: unknown,
  minimum: number,
  maximum: number,
): value is number {
  return (
    typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value >= minimum &&
    value <= maximum
  );
}

function isRecord(value: unknown): value is AnalyticsRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasSensitiveEntries(record: AnalyticsRecord): boolean {
  return Object.entries(record).some(([key, value]) => {
    if (sensitiveKeyPattern.test(key) && !approvedParameterKeys.has(key)) {
      return true;
    }
    return typeof value === 'string' && sensitiveValuePattern.test(value);
  });
}
