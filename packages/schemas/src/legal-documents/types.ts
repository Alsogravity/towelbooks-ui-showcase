export type PublicLegalLocale = 'pt-BR' | 'en';

export type PublicLegalTable = {
  caption?: string;
  headers: readonly string[];
  rows: readonly (readonly string[])[];
};

export type PublicLegalSection = {
  title: string;
  paragraphs?: readonly string[];
  bullets?: readonly string[];
  paragraphsAfterBullets?: readonly string[];
  table?: PublicLegalTable;
};

export type PublicLegalDocument = {
  eyebrow: string;
  title: string;
  effectiveDateLabel: string;
  sections: readonly PublicLegalSection[];
};

export type PublicLegalDocumentKey =
  'privacy' | 'terms' | 'cookies' | 'privacyChangelog';

export type RequiredLegalAcceptanceTypeName =
  | 'terms_acceptance'
  // eslint-disable-next-line no-secrets/no-secrets -- stable legal acceptance type, not a secret
  | 'privacy_policy_acknowledgement';

export type RequiredLegalDocumentTypeName =
  'privacy_policy' | 'terms_of_service';

export type RequiredPublicLegalDocumentMetadata = {
  acceptanceType: RequiredLegalAcceptanceTypeName;
  documentType: RequiredLegalDocumentTypeName;
  effectiveAt: string;
  route: `/legal/${string}`;
  version: string;
  requiresAcceptance: true;
};

export type InformationalPublicLegalDocumentMetadata = {
  effectiveAt: string;
  route: `/legal/${string}`;
  version: string;
  requiresAcceptance: false;
};

export type PublicLegalDocumentMetadata =
  | RequiredPublicLegalDocumentMetadata
  | InformationalPublicLegalDocumentMetadata;

export type PublicLegalDocumentMetadataMap = {
  readonly privacy: RequiredPublicLegalDocumentMetadata;
  readonly terms: RequiredPublicLegalDocumentMetadata;
  readonly cookies: InformationalPublicLegalDocumentMetadata;
  readonly privacyChangelog: InformationalPublicLegalDocumentMetadata;
};

export type RequiredPublicLegalDocumentMetadataEntry = {
  key: 'privacy' | 'terms';
  metadata: RequiredPublicLegalDocumentMetadata;
};

/** Legal document version id: calendar date only (YYYY-MM-DD). */
export type LegalVersionId = string;
