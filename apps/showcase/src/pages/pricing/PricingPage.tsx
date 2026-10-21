import { Link } from 'react-router';

import { useDocumentMetadata } from '../../app/DocumentMetadataProvider';
import { PageStateShell } from '../../components/layout';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useSmartBack } from '../../hooks/useSmartBack';
import { useI18n } from '../../i18n';
import { PUBLIC_APP_ENTRY_PATH } from '../../lib/origins';
import { SketchBookDataIcon } from '../landing/sketchMarks';
import { GuestSiteFooter } from '../landing/GuestSiteFooter';
import { PricingCard } from './PricingCard';

const REGISTER_PATH = '/register';

const PAGE_SURFACE = 'bg-[#fafafa] dark:bg-[#000000] text-ink';

export function PricingPage() {
  const { t } = useI18n();

  usePageTitle(t('pricing.meta.title'));
  useDocumentMetadata({
    canonicalPath: '/pricing',
    description: t('pricing.meta.description'),
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
        <div className="mx-auto w-full max-w-5xl">
          <nav className="mb-10 flex items-center justify-between gap-4 px-4 pb-6 text-sm sm:px-0">
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

          <header className="px-4 pb-12 text-center sm:px-0">
            <h1 className="text-h1 font-normal text-ink">
              {t('pricing.title')}
            </h1>
          </header>

          <div className="grid gap-6 px-4 sm:grid-cols-2 sm:px-0">
            <PricingCard
              icon={<SketchBookDataIcon className="h-10 w-10 text-ink" />}
              price={t('pricing.free.price')}
              description={t('pricing.free.description')}
              features={[
                t('pricing.free.feature.1'),
                t('pricing.free.feature.3'),
                t('pricing.free.feature.4'),
                t('pricing.free.feature.5'),
                t('pricing.free.feature.6'),
                t('pricing.free.feature.2'),
                t('pricing.free.feature.7'),
                t('pricing.free.feature.8'),
              ]}
              cta={{
                label: t('pricing.free.cta'),
                to: REGISTER_PATH,
              }}
            />
            <PricingCard
              price="$??"
              description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
              features={[
                'Lorem ipsum dolor sit amet',
                'Consectetur adipiscing elit sed do',
                'Eiusmod tempor incididunt ut labore',
              ]}
              cta={{
                label: 'Lorem ipsum',
                disabled: true,
              }}
              badge={t('pricing.pro.badge')}
            />
          </div>

          <p className="mx-auto mt-6 max-w-xl px-4 text-center text-sm italic text-ink-3 sm:px-0">
            {t('pricing.free.disclaimer')}
          </p>

          <section className="mx-auto my-8 max-w-xl text-center">
            <h2 className="app-text-section-title font-medium text-ink">
              {t('pricing.faq.title')}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">
              {t('pricing.faq.body')}
            </p>
            <a
              href="mailto:contact@towelbooks.com"
              className="mt-4 inline-block text-sm font-medium text-ink underline underline-offset-4"
            >
              {t('pricing.faq.email')}
            </a>
          </section>
        </div>

        <GuestSiteFooter className="mt-auto" />
      </div>
    </PageStateShell>
  );
}
