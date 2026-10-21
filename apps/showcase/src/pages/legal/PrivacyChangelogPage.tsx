import { publicLegalDocuments } from '@towelbooks/schemas/legal-documents';

import { LegalDocumentPage } from './LegalDocumentPage';
import { useI18n } from '../../i18n';

export function PrivacyChangelogPage() {
  const { locale } = useI18n();
  const isEnglish = locale === 'en-US';
  const content = isEnglish
    ? publicLegalDocuments.privacyChangelog.en
    : publicLegalDocuments.privacyChangelog['pt-BR'];

  return (
    <LegalDocumentPage
      backToAppLabel={isEnglish ? 'Back to the app' : 'Voltar para o app'}
      canonicalPath="/legal/privacy/changelog"
      content={content}
      metaDescription={
        isEnglish
          ? 'A dated history of changes to the TowelBooks privacy policy.'
          : 'Um histórico datado das mudanças na política de privacidade do TowelBooks.'
      }
    />
  );
}
