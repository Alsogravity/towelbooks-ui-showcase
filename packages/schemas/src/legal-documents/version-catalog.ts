import { currentPrivacyDocuments } from './content/privacy-current.js';
import { termsDocuments } from './content/terms.js';
import {
  CURRENT_PRIVACY_POLICY_EFFECTIVE_AT,
  CURRENT_PRIVACY_POLICY_VERSION,
  CURRENT_TERMS_EFFECTIVE_AT,
  CURRENT_TERMS_VERSION,
  isLegalVersionId,
  PUBLIC_LEGAL_DOCUMENT_METADATA,
} from './constants.js';
import type { PublicLegalDocument, PublicLegalLocale } from './types.js';

/** Documents that support the launch version and ?version= routing. */
export type VersionedPublicLegalDocumentKey = 'privacy' | 'terms';

export type PublicLegalVersionEntry = {
  version: string;
  effectiveAt: string;
  content: Record<PublicLegalLocale, PublicLegalDocument>;
};

type VersionCatalog = Record<
  VersionedPublicLegalDocumentKey,
  readonly PublicLegalVersionEntry[]
>;

/**
 * Current published legal documents. Historical versions are not retained yet.
 */
const PUBLIC_LEGAL_VERSION_CATALOG: VersionCatalog = {
  privacy: [
    {
      version: CURRENT_PRIVACY_POLICY_VERSION,
      effectiveAt: CURRENT_PRIVACY_POLICY_EFFECTIVE_AT,
      content: currentPrivacyDocuments,
    },
  ],
  terms: [
    {
      version: CURRENT_TERMS_VERSION,
      effectiveAt: CURRENT_TERMS_EFFECTIVE_AT,
      content: termsDocuments,
    },
  ],
};

function sortNewestFirst(
  entries: readonly PublicLegalVersionEntry[],
): PublicLegalVersionEntry[] {
  return [...entries].sort((a, b) => b.version.localeCompare(a.version));
}

export function listLegalVersions(
  key: VersionedPublicLegalDocumentKey,
): PublicLegalVersionEntry[] {
  return sortNewestFirst(PUBLIC_LEGAL_VERSION_CATALOG[key]);
}

export function getLatestLegalVersion(
  key: VersionedPublicLegalDocumentKey,
): PublicLegalVersionEntry {
  const latestVersion = PUBLIC_LEGAL_DOCUMENT_METADATA[key].version;
  const entry = getLegalVersion(key, latestVersion);
  if (!entry) {
    throw new Error(`Missing catalog entry for latest ${key} version.`);
  }
  return entry;
}

export function getLegalVersion(
  key: VersionedPublicLegalDocumentKey,
  version: string,
): PublicLegalVersionEntry | null {
  if (!isLegalVersionId(version)) {
    return null;
  }

  return (
    PUBLIC_LEGAL_VERSION_CATALOG[key].find(
      (entry) => entry.version === version,
    ) ?? null
  );
}

export function resolveLegalVersion(
  key: VersionedPublicLegalDocumentKey,
  version: string | null | undefined,
): PublicLegalVersionEntry | null {
  if (version === null || version === undefined || version === '') {
    return getLatestLegalVersion(key);
  }

  return getLegalVersion(key, version);
}

export function isLatestLegalVersion(
  key: VersionedPublicLegalDocumentKey,
  version: string,
): boolean {
  return version === PUBLIC_LEGAL_DOCUMENT_METADATA[key].version;
}
