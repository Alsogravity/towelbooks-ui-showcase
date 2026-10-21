import { VersionedLegalDocumentView } from './versionedLegalDocument';

export function TermsPage() {
  return (
    <VersionedLegalDocumentView
      documentKey="terms"
      metaDescriptionEn="The terms that govern your use of TowelBooks, including community catalog contributions, your account, acceptable use, and the limits of the service."
      metaDescriptionPt="Os termos que regem o uso do TowelBooks, incluindo contribuições para o catálogo da comunidade, sua conta, uso aceitável e os limites do serviço."
    />
  );
}
