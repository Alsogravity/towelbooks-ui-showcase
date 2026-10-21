import { Link } from 'react-router';

import { FooterLanguageSelect } from '../../../components/i18n/FooterLanguageSelect';
import { useI18n } from '../../../i18n';
import { legalDocumentPath } from '../../../lib/origins';

const legalLinkClassName =
  'meta text-ink-3 no-underline transition-colors hover:text-ink';

export function AuthLegalFooter() {
  const { t } = useI18n();

  return (
    <footer className="flex shrink-0 flex-col items-center justify-center gap-2 px-4 pb-4 sm:pb-6 lg:pb-8">
      <nav
        aria-label={t('auth.shell.legal.label')}
        className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1"
      >
        <Link to={legalDocumentPath('terms')} className={legalLinkClassName}>
          {t('auth.shell.legal.terms')}
        </Link>
        <span className="meta text-ink-3" aria-hidden="true">
          ·
        </span>
        <Link to={legalDocumentPath('privacy')} className={legalLinkClassName}>
          {t('auth.shell.legal.privacy')}
        </Link>
        <span className="meta text-ink-3" aria-hidden="true">
          ·
        </span>
        <Link to={legalDocumentPath('cookies')} className={legalLinkClassName}>
          {t('auth.shell.legal.cookies')}
        </Link>
      </nav>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <FooterLanguageSelect />
        <p className="meta text-ink-3">{t('auth.shell.copyright')}</p>
      </div>
    </footer>
  );
}
