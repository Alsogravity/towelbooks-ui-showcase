import { Link } from 'react-router';

import { useDocumentMetadata } from '../../app/DocumentMetadataProvider';
import { PageStateShell } from '../../components/layout';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useScrollToTopOnMount } from '../../hooks/useScrollToTopOnMount';
import { useSmartBack } from '../../hooks/useSmartBack';
import { useI18n, type MessageKey } from '../../i18n';
import { PUBLIC_APP_ENTRY_PATH } from '../../lib/origins';
import { GuestSiteFooter } from '../landing/GuestSiteFooter';

/** High-contrast surface aligned with public legal reading pages. */
const PAGE_SURFACE = 'bg-[#fafafa] dark:bg-[#000000] text-ink';

type CreditEntry = {
  id: string;
  nameKey: MessageKey;
  descriptionKey: MessageKey;
  referenceHref?: string;
  referenceLabelKey?: MessageKey;
  external?: boolean;
};

const CREDIT_ENTRIES: CreditEntry[] = [
  {
    id: 'openLibrary',
    nameKey: 'acknowledgements.service.openLibrary.name',
    descriptionKey: 'acknowledgements.service.openLibrary.description',
    referenceHref: 'https://openlibrary.org',
    referenceLabelKey: 'acknowledgements.service.openLibrary.reference',
    external: true,
  },
  {
    id: 'amazon',
    nameKey: 'acknowledgements.service.amazon.name',
    descriptionKey: 'acknowledgements.service.amazon.description',
    referenceHref: 'https://affiliate-program.amazon.com/',
    referenceLabelKey: 'acknowledgements.service.amazon.reference',
    external: true,
  },
  {
    id: 'lucide',
    nameKey: 'acknowledgements.service.lucide.name',
    descriptionKey: 'acknowledgements.service.lucide.description',
    referenceHref: 'https://lucide.dev',
    referenceLabelKey: 'acknowledgements.service.lucide.reference',
    external: true,
  },
  {
    id: 'fonts',
    nameKey: 'acknowledgements.service.fonts.name',
    descriptionKey: 'acknowledgements.service.fonts.description',
    referenceHref: '/assets/fonts/LICENSES.md',
    referenceLabelKey: 'acknowledgements.service.fonts.reference',
  },
  {
    id: 'oss',
    nameKey: 'acknowledgements.service.oss.name',
    descriptionKey: 'acknowledgements.service.oss.description',
  },
];

export function AcknowledgementsPage() {
  useScrollToTopOnMount();
  const { t } = useI18n();
  usePageTitle(t('acknowledgements.meta.title'));
  useDocumentMetadata({
    description: t('acknowledgements.meta.description'),
    canonicalPath: '/acknowledgements',
    shareTitle: t('acknowledgements.eyebrow'),
  });
  const smartBack = useSmartBack(PUBLIC_APP_ENTRY_PATH);

  return (
    <PageStateShell
      background="transparent"
      containerSize="default"
      className={PAGE_SURFACE}
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
              to={PUBLIC_APP_ENTRY_PATH}
              onClick={smartBack.onClick}
              className="font-medium text-ink underline underline-offset-4"
            >
              {t('acknowledgements.backToApp')}
            </Link>
          </nav>

          <header className="pb-8 text-center">
            <p className="text-sm font-medium text-ink-3">
              {t('acknowledgements.eyebrow')}
            </p>
            <h1 className="mt-2 text-h1 font-normal text-ink">
              {t('acknowledgements.title')}
            </h1>
          </header>

          <div className="pt-8 pb-24 text-base leading-8 text-ink-2 sm:text-lg">
            <p className="pb-2">{t('acknowledgements.intro')}</p>

            <ul className="mt-8 divide-y divide-ink/10">
              {CREDIT_ENTRIES.map((credit) => {
                const name = t(credit.nameKey);
                const description = t(credit.descriptionKey);
                const referenceHref = credit.referenceHref;
                const referenceLabelKey = credit.referenceLabelKey;

                return (
                  <li key={credit.id} className="py-6 first:pt-0 last:pb-0">
                    <p>
                      <span className="font-medium text-ink">{name}:</span>{' '}
                      {description}
                    </p>
                    {referenceHref && referenceLabelKey ? (
                      <p className="mt-2 text-sm leading-6 sm:text-base">
                        <span className="text-ink-3">
                          {t('acknowledgements.referenceLabel')}:
                        </span>{' '}
                        <a
                          href={referenceHref}
                          className="font-medium text-ink underline underline-offset-4"
                          {...(credit.external
                            ? {
                                rel: 'noopener noreferrer',
                                target: '_blank',
                              }
                            : {})}
                        >
                          {t(referenceLabelKey)}
                        </a>
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            <p className="mt-10 border-t border-ink/10 pt-8 text-ink-3">
              {t('acknowledgements.closing')}
            </p>
          </div>
        </article>

        <GuestSiteFooter className="mt-auto" />
      </div>
    </PageStateShell>
  );
}
