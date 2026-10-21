import { Link } from 'react-router';

import { useI18n } from '../../i18n';
import {
  GUEST_LOGIN_PATH,
  PRICING_PATH,
  PUBLIC_APP_ENTRY_PATH,
} from '../../lib/origins';

const REGISTER_PATH = '/register';

const textLinkClassName =
  'text-sm font-medium text-ink-2 no-underline transition-colors hover:text-ink';

export function LandingHeader({ visible = true }: { visible?: boolean }) {
  const { t } = useI18n();

  return (
    <header
      className={`landing-header fixed inset-x-0 top-0 z-40 transition-all duration-500 ease-in-out ${
        visible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex w-full items-center justify-between gap-4 px-4 py-2 sm:px-5 lg:px-6">
        <Link
          to={PUBLIC_APP_ENTRY_PATH}
          aria-label={t('app.name')}
          className="inline-flex no-underline"
        >
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
        </Link>

        <nav className="flex items-center gap-2">
          <Link to={PRICING_PATH} className={`${textLinkClassName} px-1 py-2`}>
            {t('landing.nav.pricing')}
          </Link>
          <Link
            to={GUEST_LOGIN_PATH}
            className={`${textLinkClassName} px-1 py-2`}
          >
            {t('landing.nav.login')}
          </Link>
          <Link
            to={REGISTER_PATH}
            className="px-1 py-2 text-sm font-medium text-brick no-underline transition-colors hover:text-brick-2"
          >
            {t('landing.nav.signup')}
          </Link>
        </nav>
      </div>
    </header>
  );
}
