import { Link } from 'react-router';

import { useI18n } from '../../i18n';

export function AppSidebarHeader() {
  const { t } = useI18n();

  return (
    <div className="flex justify-start px-2">
      <Link
        to="/"
        aria-label={t('shell.brandGoToLibrary')}
        className="flex items-center no-underline"
      >
        <img
          src="/assets/brand/mark.svg"
          alt=""
          width={24}
          height={24}
          className="h-6 w-6 dark:hidden"
        />
        <img
          src="/assets/brand/mark-white.svg"
          alt=""
          width={24}
          height={24}
          className="h-6 w-6 hidden dark:block"
        />
      </Link>
    </div>
  );
}
