export const PUBLIC_APP_ENTRY_PATH = '/';

/** Canonical guest sign-in route (login form). */
export const GUEST_LOGIN_PATH = '/login';

/** Public credits page (providers, Open Library courtesy, OSS note). */
export const ACKNOWLEDGEMENTS_PATH = '/acknowledgements';

/** Public pricing page. */
export const PRICING_PATH = '/pricing';

const LEGAL_DOCUMENT_PATHS = {
  cookies: '/legal/cookies',
  privacyChangelog: '/legal/privacy/changelog',
  privacy: '/legal/privacy',
  terms: '/legal/terms',
} as const;

export type LegalDocumentKey = keyof typeof LEGAL_DOCUMENT_PATHS;

export type VersionedLegalDocumentKey = 'privacy' | 'terms';

export function legalDocumentPath(document: LegalDocumentKey): string {
  return LEGAL_DOCUMENT_PATHS[document];
}

export function legalDocumentRevisionsPath(
  document: VersionedLegalDocumentKey,
): string {
  return `${LEGAL_DOCUMENT_PATHS[document]}/revisions`;
}

export function legalDocumentVersionPath(
  document: VersionedLegalDocumentKey,
  version: string,
): string {
  return `${LEGAL_DOCUMENT_PATHS[document]}?version=${encodeURIComponent(version)}`;
}
