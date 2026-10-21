import type {
  PublicLegalDocumentKey,
  PublicLegalDocumentMetadata,
  PublicLegalDocumentMetadataMap,
  RequiredPublicLegalDocumentMetadataEntry,
} from './types.js';

export const PRIVACY_CONTACT_EMAIL = 'privacy@towelbooks.com';

export const COPYRIGHT_NOTICE_EMAIL = 'contact@towelbooks.com';

/** First official public legal document version (YYYY-MM-DD). */
export const FIRST_PUBLIC_LEGAL_VERSION = '2026-08-12';

export const FIRST_PUBLIC_LEGAL_EFFECTIVE_AT = '2026-08-12T00:00:00.000Z';

/** Current privacy policy version. */
export const CURRENT_PRIVACY_POLICY_VERSION = '2026-08-24';

export const CURRENT_PRIVACY_POLICY_EFFECTIVE_AT = '2026-08-24T00:00:00.000Z';

/** Launch cookie notice version. */
export const CURRENT_COOKIE_NOTICE_VERSION = FIRST_PUBLIC_LEGAL_VERSION;

export const CURRENT_COOKIE_NOTICE_EFFECTIVE_AT =
  FIRST_PUBLIC_LEGAL_EFFECTIVE_AT;

/** Current terms version. */
export const CURRENT_TERMS_VERSION = '2026-08-24';

export const CURRENT_TERMS_EFFECTIVE_AT = '2026-08-24T00:00:00.000Z';

/** Current privacy changelog marker. */
export const CURRENT_PRIVACY_CHANGELOG_VERSION = CURRENT_PRIVACY_POLICY_VERSION;

export const CURRENT_PRIVACY_CHANGELOG_EFFECTIVE_AT =
  CURRENT_PRIVACY_POLICY_EFFECTIVE_AT;

/** Version id must be a calendar date only. */
export const LEGAL_VERSION_ID_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const PUBLIC_LEGAL_DOCUMENT_METADATA = {
  privacy: {
    // eslint-disable-next-line no-secrets/no-secrets -- stable legal acceptance type, not a secret
    acceptanceType: 'privacy_policy_acknowledgement',
    documentType: 'privacy_policy',
    effectiveAt: CURRENT_PRIVACY_POLICY_EFFECTIVE_AT,
    route: '/legal/privacy',
    version: CURRENT_PRIVACY_POLICY_VERSION,
    requiresAcceptance: true,
  },
  terms: {
    acceptanceType: 'terms_acceptance',
    documentType: 'terms_of_service',
    effectiveAt: CURRENT_TERMS_EFFECTIVE_AT,
    route: '/legal/terms',
    version: CURRENT_TERMS_VERSION,
    requiresAcceptance: true,
  },
  cookies: {
    effectiveAt: CURRENT_COOKIE_NOTICE_EFFECTIVE_AT,
    route: '/legal/cookies',
    version: CURRENT_COOKIE_NOTICE_VERSION,
    requiresAcceptance: false,
  },
  privacyChangelog: {
    effectiveAt: CURRENT_PRIVACY_CHANGELOG_EFFECTIVE_AT,
    route: '/legal/privacy/changelog',
    version: CURRENT_PRIVACY_CHANGELOG_VERSION,
    requiresAcceptance: false,
  },
} as const satisfies PublicLegalDocumentMetadataMap;

export function isLegalVersionId(value: string): boolean {
  if (!LEGAL_VERSION_ID_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function getRequiredPublicLegalDocumentMetadataEntries(): RequiredPublicLegalDocumentMetadataEntry[] {
  return (
    Object.entries(PUBLIC_LEGAL_DOCUMENT_METADATA) as Array<
      [PublicLegalDocumentKey, PublicLegalDocumentMetadata]
    >
  ).flatMap(([key, metadata]) =>
    metadata.requiresAcceptance
      ? [{ key: key as 'privacy' | 'terms', metadata }]
      : [],
  );
}
