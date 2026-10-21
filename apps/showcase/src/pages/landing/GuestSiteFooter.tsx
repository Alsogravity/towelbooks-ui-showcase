import { Link } from 'react-router';

import { FooterLanguageSelect } from '../../components/i18n/FooterLanguageSelect';
import { useI18n } from '../../i18n';
import {
  ACKNOWLEDGEMENTS_PATH,
  GUEST_LOGIN_PATH,
  PRICING_PATH,
  legalDocumentPath,
} from '../../lib/origins';

const REGISTER_PATH = '/register';

type GuestSiteFooterProps = {
  className?: string;
};

/** Shared public-site footer used on the guest landing and legal documents. */
export function GuestSiteFooter({ className }: GuestSiteFooterProps) {
  const { t } = useI18n();

  return (
    <footer
      className={[
        'border-t border-ink/10 bg-transparent px-6 pb-10 pt-16 sm:px-12 lg:px-24',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="flex flex-col items-start gap-4">
            <img
              src="/assets/brand/wordmark.svg"
              alt="TowelBooks"
              width={123}
              height={28}
              className="h-7 w-auto dark:hidden"
            />
            <img
              src="/assets/brand/wordmark-white.svg"
              alt="TowelBooks"
              width={123}
              height={28}
              className="hidden h-7 w-auto dark:block"
            />
            <p className="max-w-xs text-sm leading-relaxed text-ink-3">
              {t('auth.shell.tagline')}
            </p>
          </div>

          <nav className="flex flex-col gap-3">
            <h3 className="meta-label text-ink-3">
              {t('landing.footer.startHeading')}
            </h3>
            <Link
              to={REGISTER_PATH}
              className="text-sm text-ink-2 no-underline transition-colors hover:text-ink"
            >
              {t('landing.nav.signup')}
            </Link>
            <Link
              to={GUEST_LOGIN_PATH}
              className="text-sm text-ink-2 no-underline transition-colors hover:text-ink"
            >
              {t('landing.nav.login')}
            </Link>
            <Link
              to={PRICING_PATH}
              className="text-sm text-ink-2 no-underline transition-colors hover:text-ink"
            >
              {t('landing.nav.pricing')}
            </Link>
          </nav>

          <nav className="flex flex-col gap-3">
            <h3 className="meta-label text-ink-3">
              {t('landing.footer.legalHeading')}
            </h3>
            <Link
              to={legalDocumentPath('terms')}
              className="text-sm text-ink-2 no-underline transition-colors hover:text-ink"
            >
              {t('auth.shell.legal.terms')}
            </Link>
            <Link
              to={legalDocumentPath('privacy')}
              className="text-sm text-ink-2 no-underline transition-colors hover:text-ink"
            >
              {t('auth.shell.legal.privacy')}
            </Link>
            <Link
              to={legalDocumentPath('cookies')}
              className="text-sm text-ink-2 no-underline transition-colors hover:text-ink"
            >
              {t('auth.shell.legal.cookies')}
            </Link>
          </nav>

          <nav className="flex flex-col gap-3">
            <h3 className="meta-label text-ink-3">
              {t('landing.footer.moreHeading')}
            </h3>
            <Link
              to={ACKNOWLEDGEMENTS_PATH}
              className="text-sm text-ink-2 no-underline transition-colors hover:text-ink"
            >
              {t('auth.shell.legal.acknowledgements')}
            </Link>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-ink/10 pt-6 sm:flex-row">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <FooterLanguageSelect className="text-ink-4" />
            <p className="text-xs text-ink-4">{t('auth.shell.copyright')}</p>
          </div>
          <a
            href="https://instagram.com/towelbooks"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-ink-4 no-underline transition-colors hover:text-ink"
          >
            <img
              src="/assets/brand/instagram-glyph-black.svg"
              alt="Instagram"
              width={20}
              height={20}
              className="dark:hidden"
            />
            <img
              src="/assets/brand/instagram-glyph-white.svg"
              alt="Instagram"
              width={20}
              height={20}
              className="hidden dark:block"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
