import { normalizeAsin } from './contribution-resolution.js';
import { parseCanonicalIsbn } from './isbn.js';

export const DEFAULT_AMAZON_MARKETPLACE = 'amazon.com.br';

const ALLOWED_AMAZON_MARKETPLACES = new Set([DEFAULT_AMAZON_MARKETPLACE]);
const ASSOCIATE_TAG_PATTERN = /^[A-Za-z0-9_-]+$/;

export type AmazonAffiliateUrlInput = {
  asin?: string | null;
  associateTag?: string | null;
  isbn10?: string | null;
  isbn13?: string | null;
  marketplace?: string | null;
};

export function isSupportedAmazonMarketplace(value: string): boolean {
  return ALLOWED_AMAZON_MARKETPLACES.has(value.trim().toLowerCase());
}

export function isValidAmazonAssociateTag(value: string): boolean {
  const trimmedValue = value.trim();

  return (
    trimmedValue.length > 0 &&
    trimmedValue.length <= 128 &&
    ASSOCIATE_TAG_PATTERN.test(trimmedValue)
  );
}

export function buildAmazonAffiliateUrl(
  input: AmazonAffiliateUrlInput,
): string | null {
  const associateTag = input.associateTag?.trim();

  if (!associateTag || !isValidAmazonAssociateTag(associateTag)) {
    return null;
  }

  const marketplace = (
    input.marketplace?.trim() || DEFAULT_AMAZON_MARKETPLACE
  ).toLowerCase();

  if (!isSupportedAmazonMarketplace(marketplace)) {
    return null;
  }

  const productIdentifier =
    normalizeAsin(input.asin) ?? normalizeIsbn(input.isbn10, 'isbn10');
  const url = new URL(`https://${marketplace}`);

  if (productIdentifier) {
    url.pathname = `/dp/${productIdentifier}`;
    url.searchParams.set('tag', associateTag);

    return url.toString();
  }

  const searchIdentifier =
    normalizeIsbn(input.isbn13, 'isbn13') ??
    normalizeIsbn(input.isbn10, 'isbn10');

  if (!searchIdentifier) {
    return null;
  }

  url.pathname = '/s';
  url.searchParams.set('k', searchIdentifier);
  url.searchParams.set('tag', associateTag);

  return url.toString();
}

function normalizeIsbn(
  value: string | null | undefined,
  kind: 'isbn10' | 'isbn13',
) {
  if (typeof value !== 'string') {
    return null;
  }

  const parsed = parseCanonicalIsbn(value);

  return parsed?.kind === kind ? parsed.value : null;
}
