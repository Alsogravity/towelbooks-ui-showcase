import { VersionedLegalDocumentView } from './versionedLegalDocument';

export function PrivacyPolicyPage() {
  return (
    <VersionedLegalDocumentView
      documentKey="privacy"
      metaDescriptionEn="How TowelBooks collects, uses, and protects your data, and the rights and controls you have over it."
      metaDescriptionPt="Como o TowelBooks coleta, usa e protege seus dados, e os direitos e controles que você tem sobre eles."
    />
  );
}
