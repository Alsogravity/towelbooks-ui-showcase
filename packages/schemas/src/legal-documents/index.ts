import { cookiesDocuments } from './content/cookies.js';
import { privacyChangelogDocuments } from './content/privacy-changelog.js';
import type { PublicLegalDocument, PublicLegalLocale } from './types.js';
import { getLatestLegalVersion } from './version-catalog.js';

export * from './types.js';
export * from './constants.js';
export * from './format-labels.js';
export * from './version-catalog.js';

const latestPrivacy = getLatestLegalVersion('privacy').content;
const latestTerms = getLatestLegalVersion('terms').content;

export const publicLegalDocuments: Record<
  'privacy' | 'terms' | 'cookies' | 'privacyChangelog',
  Record<PublicLegalLocale, PublicLegalDocument>
> = {
  cookies: cookiesDocuments,
  privacy: latestPrivacy,
  terms: latestTerms,
  privacyChangelog: privacyChangelogDocuments,
};
