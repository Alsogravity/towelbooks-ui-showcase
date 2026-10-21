import { type PublicLegalDocument } from '@towelbooks/schemas/legal-documents';
import { Link } from 'react-router';

import { useDocumentMetadata } from '../../app/DocumentMetadataProvider';
import { PageStateShell } from '../../components/layout';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useScrollToTopOnMount } from '../../hooks/useScrollToTopOnMount';
import { useSmartBack } from '../../hooks/useSmartBack';
import { PUBLIC_APP_ENTRY_PATH } from '../../lib/origins';
import { GuestSiteFooter } from '../landing/GuestSiteFooter';
import { RichText } from './RichText';

type ArchiveBanner = {
  message: string;
  currentVersionLabel: string;
  currentVersionHref: string;
};

type PreviousVersionsLink = {
  href: string;
  label: string;
};

type LegalDocumentPageProps = {
  backToAppLabel: string;
  content: PublicLegalDocument;
  canonicalPath: string;
  /** One-line summary for this document, used as its meta/share description. */
  metaDescription?: string;
  /** Shown at the top when viewing a non-latest archived version. */
  archiveBanner?: ArchiveBanner;
  /** Optional revisions link shown next to the effective date. */
  previousVersionsLink?: PreviousVersionsLink;
};

/** High-contrast surface for long legal reading (near-white / pure black). */
const LEGAL_PAGE_SURFACE = 'bg-[#fafafa] dark:bg-[#000000] text-ink';

export function LegalDocumentPage({
  archiveBanner,
  backToAppLabel,
  canonicalPath,
  content,
  metaDescription,
  previousVersionsLink,
}: LegalDocumentPageProps) {
  useScrollToTopOnMount();
  usePageTitle(content.title);
  useDocumentMetadata({
    canonicalPath,
    description: metaDescription,
    shareTitle: content.eyebrow,
  });
  const smartBack = useSmartBack(PUBLIC_APP_ENTRY_PATH);

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
              to={PUBLIC_APP_ENTRY_PATH}
              onClick={smartBack.onClick}
              className="font-medium text-ink underline underline-offset-4"
            >
              {backToAppLabel}
            </Link>
          </nav>

          {archiveBanner ? (
            <aside
              className="mb-8 rounded-lg border border-brick/30 bg-brick/5 px-4 py-4 text-sm leading-6 text-ink sm:px-5 sm:text-base"
              role="status"
            >
              <p className="font-medium text-ink">{archiveBanner.message}</p>
              <p className="mt-3">
                <Link
                  to={archiveBanner.currentVersionHref}
                  className="font-medium text-ink underline underline-offset-4"
                >
                  {archiveBanner.currentVersionLabel}
                </Link>
              </p>
            </aside>
          ) : null}

          <header className="pb-8 text-center">
            <p className="text-sm text-ink-3">
              <span className="font-medium text-ink">
                {content.effectiveDateLabel}
              </span>
              {previousVersionsLink ? (
                <>
                  {' · '}
                  <Link
                    to={previousVersionsLink.href}
                    className="underline underline-offset-4"
                  >
                    {previousVersionsLink.label}
                  </Link>
                </>
              ) : null}
            </p>
            <h1 className="mt-2 text-h1 font-normal text-ink">
              {content.title}
            </h1>
          </header>

          <div className="pt-8 pb-24 text-base leading-8 text-ink-2 sm:text-lg">
            {content.sections.map((section, index) => (
              <section
                key={section.title}
                className="py-8 last:pb-0 first:pt-0"
              >
                <div className="space-y-4">
                  <h2 className="text-xl font-medium text-ink sm:text-2xl">
                    {index + 1}. {section.title}
                  </h2>
                  <div className="space-y-4">
                    {section.paragraphs?.map((paragraph) => (
                      <p key={paragraph}>
                        <RichText text={paragraph} />
                      </p>
                    ))}
                    {section.bullets?.length ? (
                      <ul className="list-disc space-y-3 pl-5">
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>
                            <RichText text={bullet} />
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {section.paragraphsAfterBullets?.map((paragraph) => (
                      <p key={paragraph}>
                        <RichText text={paragraph} />
                      </p>
                    ))}
                    {section.table ? (
                      <div className="overflow-x-auto">
                        {section.table.caption ? (
                          <p className="px-4 py-3 text-sm text-ink-3">
                            {section.table.caption}
                          </p>
                        ) : null}
                        <table className="min-w-full border-collapse text-sm leading-6 sm:text-base">
                          <thead>
                            <tr>
                              {section.table.headers.map((header) => (
                                <th
                                  key={header}
                                  scope="col"
                                  className="px-4 py-3 text-left font-semibold text-ink"
                                >
                                  <RichText text={header} />
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {section.table.rows.map((row) => (
                              <tr key={row.join('|')} className="align-top">
                                {row.map((cell, index) => (
                                  <td
                                    key={`${row.join('|')}-${index}`}
                                    className="px-4 py-3"
                                  >
                                    <RichText text={cell} />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </article>

        <GuestSiteFooter className="mt-auto" />
      </div>
    </PageStateShell>
  );
}
