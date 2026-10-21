import { PageStateShell } from '../components/layout';
import { ButtonLink } from '../components/primitives';
import { usePageTitle } from '../hooks/usePageTitle';
import { useI18n } from '../i18n';

export function NotFoundPage() {
  usePageTitle({ key: 'page.notFound.title', fallback: 'Page unavailable' });

  const { t } = useI18n();

  return (
    <PageStateShell containerSize="narrow">
      <section className="w-full max-w-2xl text-center">
        <p className="app-text-stat-value font-display text-brick">404</p>
        <div className="my-5 text-ink-4" aria-hidden="true">
          ❦
        </div>
        <h2 className="app-text-page-title text-ink">
          {t('notFound.heading')}
        </h2>
        <p className="app-text-page-description mx-auto mt-4 max-w-xl text-ink-2">
          {t('notFound.body')}
        </p>
        <div className="mt-8 flex justify-center">
          <ButtonLink to="/" className="w-full justify-center sm:w-auto">
            {t('notFound.action')}
          </ButtonLink>
        </div>
      </section>
    </PageStateShell>
  );
}
