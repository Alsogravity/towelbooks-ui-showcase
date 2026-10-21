import { Link } from 'react-router';

import { useI18n } from '../../../i18n';
import { PUBLIC_APP_ENTRY_PATH } from '../../../lib/origins';

export type AuthBrandHeaderProps = {
  showDarkPanel: boolean;
};

function AuthWordmarks({ showDarkPanel }: AuthBrandHeaderProps) {
  return (
    <>
      <img
        src="/assets/brand/wordmark-white.svg"
        alt="TowelBooks"
        width={160}
        height={32}
        className={`h-8 w-auto dark:block ${showDarkPanel ? 'hidden lg:block' : 'hidden'}`}
      />
      <img
        src="/assets/brand/wordmark.svg"
        alt="TowelBooks"
        width={160}
        height={32}
        className={`h-8 w-auto dark:hidden ${showDarkPanel ? 'block lg:hidden' : 'block'}`}
      />
    </>
  );
}

export function AuthBrandHeader({ showDarkPanel }: AuthBrandHeaderProps) {
  const { t } = useI18n();

  return (
    <>
      <header
        data-testid="auth-brand-inline"
        className="flex shrink-0 justify-start px-4 pt-4 sm:px-6 sm:pt-6 lg:hidden"
      >
        <Link
          to={PUBLIC_APP_ENTRY_PATH}
          aria-label={t('app.name')}
          className="inline-flex no-underline"
        >
          <AuthWordmarks showDarkPanel={showDarkPanel} />
        </Link>
      </header>

      <Link
        to={PUBLIC_APP_ENTRY_PATH}
        aria-label={t('app.name')}
        data-testid="auth-brand-fixed"
        className="fixed left-4 top-4 z-20 hidden no-underline sm:left-8 sm:top-8 lg:inline-flex"
      >
        <AuthWordmarks showDarkPanel={showDarkPanel} />
      </Link>
    </>
  );
}
