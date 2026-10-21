import {
  formatPublicLegalArchivePeriodLabel,
  isLatestLegalVersion,
  resolveLegalVersion,
  type VersionedPublicLegalDocumentKey,
} from '@towelbooks/schemas/legal-documents';
import { useSearchParams } from 'react-router';

import { LegalDocumentPage } from './LegalDocumentPage';
import { NotFoundPage } from '../NotFoundPage';
import { useI18n } from '../../i18n';
import {
  legalDocumentPath,
  type VersionedLegalDocumentKey,
} from '../../lib/origins';

type VersionedLegalDocumentViewProps = {
  documentKey: VersionedLegalDocumentKey;
  metaDescriptionEn: string;
  metaDescriptionPt: string;
};

export function VersionedLegalDocumentView({
  documentKey,
  metaDescriptionEn,
  metaDescriptionPt,
}: VersionedLegalDocumentViewProps) {
  const { locale } = useI18n();
  const isEnglish = locale === 'en-US';
  const [searchParams] = useSearchParams();
  const requestedVersion = searchParams.get('version');

  const catalogKey = documentKey as VersionedPublicLegalDocumentKey;
  const entry = resolveLegalVersion(catalogKey, requestedVersion);

  if (!entry) {
    return <NotFoundPage />;
  }

  const content = isEnglish ? entry.content.en : entry.content['pt-BR'];
  const isLatest = isLatestLegalVersion(catalogKey, entry.version);
  const period = formatPublicLegalArchivePeriodLabel(
    isEnglish ? 'en' : 'pt-BR',
    entry.effectiveAt,
  );

  const archiveBanner = !isLatest
    ? {
        message: isEnglish
          ? `This is an archived version of our ${content.eyebrow} from ${period}. A newer version is currently in effect.`
          : documentKey === 'terms'
            ? `Esta é uma versão arquivada dos Termos de Serviço de ${period}. Uma versão mais recente está em vigor.`
            : `Esta é uma versão arquivada da Política de Privacidade de ${period}. Uma versão mais recente está em vigor.`,
        currentVersionLabel: isEnglish
          ? 'View current version'
          : 'Ver versão atual',
        currentVersionHref: legalDocumentPath(documentKey),
      }
    : undefined;

  return (
    <LegalDocumentPage
      backToAppLabel={isEnglish ? 'Back to the app' : 'Voltar para o app'}
      canonicalPath={legalDocumentPath(documentKey)}
      content={content}
      metaDescription={isEnglish ? metaDescriptionEn : metaDescriptionPt}
      archiveBanner={archiveBanner}
      previousVersionsLink={undefined}
    />
  );
}
