import { publicLegalDocuments } from '@towelbooks/schemas/legal-documents';

import { LegalDocumentPage } from './LegalDocumentPage';
import { useI18n } from '../../i18n';

export function CookiesPage() {
  const { locale } = useI18n();
  const isEnglish = locale === 'en-US';
  const content = isEnglish
    ? publicLegalDocuments.cookies.en
    : publicLegalDocuments.cookies['pt-BR'];

  return (
    <LegalDocumentPage
      backToAppLabel={isEnglish ? 'Back to the app' : 'Voltar para o app'}
      canonicalPath="/legal/cookies"
      content={content}
      metaDescription={
        isEnglish
          ? 'Which cookies and browser storage TowelBooks uses, why, and the choices available to you.'
          : 'Quais cookies e armazenamento de navegador o TowelBooks usa, por quê, e as escolhas disponíveis para você.'
      }
    />
  );
}
