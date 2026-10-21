import {
  formatPublicLegalEffectiveDateLabel,
  listLegalVersions,
  type VersionedPublicLegalDocumentKey,
} from '@towelbooks/schemas/legal-documents';
import { Link } from 'react-router';

import { useDocumentMetadata } from '../../app/DocumentMetadataProvider';
import { PageStateShell } from '../../components/layout';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useScrollToTopOnMount } from '../../hooks/useScrollToTopOnMount';
import { useSmartBack } from '../../hooks/useSmartBack';
import { useI18n } from '../../i18n';
import {
  legalDocumentPath,
  legalDocumentVersionPath,
  PUBLIC_APP_ENTRY_PATH,
  type VersionedLegalDocumentKey,
} from '../../lib/origins';
import { GuestSiteFooter } from '../landing/GuestSiteFooter';

const DOCUMENT_TITLES = {
  terms: {
    en: 'Terms of Service — previous versions',
    'pt-BR': 'Termos de Serviço — versões anteriores',
    eyebrowEn: 'Terms of Service',
    eyebrowPt: 'Termos de Serviço',
  },
  privacy: {
    en: 'Privacy Policy — previous versions',
    'pt-BR': 'Política de Privacidade — versões anteriores',
    eyebrowEn: 'Privacy Policy',
    eyebrowPt: 'Política de Privacidade',
  },
} as const;

/** High-contrast surface aligned with legal document pages. */
const LEGAL_PAGE_SURFACE = 'bg-[#fafafa] dark:bg-[#000000] text-ink';

type LegalRevisionsPageProps = {
  documentKey: VersionedLegalDocumentKey;
};

export function LegalRevisionsPage({ documentKey }: LegalRevisionsPageProps) {
  useScrollToTopOnMount();
  const { locale } = useI18n();
  const isEnglish = locale === 'en-US';
  const titles = DOCUMENT_TITLES[documentKey];
  const pageTitle = isEnglish ? titles.en : titles['pt-BR'];
  const catalogKey = documentKey as VersionedPublicLegalDocumentKey;
  const versions = listLegalVersions(catalogKey);
  const latestVersion = versions[0]?.version;
  const smartBack = useSmartBack(legalDocumentPath(documentKey));

  usePageTitle(pageTitle);
  useDocumentMetadata({
    canonicalPath: `/legal/${documentKey}/revisions`,
    description: isEnglish
      ? `Published versions of the TowelBooks ${titles.eyebrowEn}.`
      : `Versões publicadas d${documentKey === 'terms' ? 'os' : 'a'} ${titles.eyebrowPt} da TowelBooks.`,
    shareTitle: pageTitle,
  });

  return (
    <PageStateShell
      background="transparent"
      containerSize="default"
      className={LEGAL_PAGE_SURFACE}
      containerClassName="!max-w-none px-0"
      stateClassName="items-stretch justify-start text-left"
    >
      <div className="flex w-full flex-1 flex-col">
        <article className="mx-auto w-full max-w-3xl">
          <nav className="mb-10 flex items-center justify-between gap-4 pb-6 text-sm">
            <Link
              to={PUBLIC_APP_ENTRY_PATH}
              aria-label="TowelBooks"
              className="inline-flex no-underline"
            >
              <img
                src="/assets/brand/wordmark.svg"
                alt=""
                aria-hidden="true"
                width={120}
                height={26}
                className="h-8 w-auto dark:hidden"
              />
              <img
                src="/assets/brand/wordmark-white.svg"
                alt=""
                aria-hidden="true"
                width={120}
                height={26}
                className="hidden h-8 w-auto dark:block"
              />
            </Link>
            <Link
              to={legalDocumentPath(documentKey)}
              onClick={smartBack.onClick}
              className="font-medium text-ink underline underline-offset-4"
            >
              {isEnglish ? 'Back to current version' : 'Voltar à versão atual'}
            </Link>
          </nav>

          <header className="pb-8 text-center">
            <p className="text-sm text-ink-3">
              {isEnglish ? titles.eyebrowEn : titles.eyebrowPt}
            </p>
            <h1 className="mt-2 text-h1 font-normal text-ink">{pageTitle}</h1>
          </header>

          <ul className="space-y-3">
            {versions.map((entry) => {
              const isCurrent = entry.version === latestVersion;
              const href = isCurrent
                ? legalDocumentPath(documentKey)
                : legalDocumentVersionPath(documentKey, entry.version);
              const effectiveLabel = formatPublicLegalEffectiveDateLabel(
                isEnglish ? 'en' : 'pt-BR',
                entry.effectiveAt,
              );

              return (
                <li key={entry.version}>
                  <Link
                    to={href}
                    className={[
                      'block rounded-lg border px-4 py-4 no-underline transition-colors sm:px-5',
                      isCurrent
                        ? 'border-ink/25 bg-ink/[0.04] ring-1 ring-ink/10 dark:bg-white/[0.04]'
                        : 'border-ink/10 hover:border-ink/20 hover:bg-ink/[0.02] dark:hover:bg-white/[0.03]',
                    ].join(' ')}
                    aria-current={isCurrent ? 'page' : undefined}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-base font-medium text-ink underline-offset-4 group-hover:underline sm:text-lg">
                          <span className="underline decoration-ink/30">
                            {entry.version}
                          </span>
                          {isCurrent ? (
                            <span className="ml-2 inline-flex items-center rounded-full bg-ink px-2 py-0.5 text-xs font-medium text-[#fafafa] no-underline dark:bg-[#fafafa] dark:text-[#000000]">
                              {isEnglish ? 'Current' : 'Vigente'}
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-1 text-sm text-ink-3">
                          {effectiveLabel}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-ink-2">
                        {isEnglish ? 'Open' : 'Abrir'}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </article>

        <GuestSiteFooter className="mt-auto" />
      </div>
    </PageStateShell>
  );
}

export function TermsRevisionsPage() {
  return <LegalRevisionsPage documentKey="terms" />;
}

export function PrivacyRevisionsPage() {
  return <LegalRevisionsPage documentKey="privacy" />;
}
