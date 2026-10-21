import { PageStateShell } from '../components/layout';
import { ButtonLink } from '../components/primitives';
import { useDocumentMetadata } from '../app/DocumentMetadataProvider';
import { usePageTitle } from '../hooks/usePageTitle';
import { useI18n } from '../i18n';
import { PUBLIC_APP_ENTRY_PATH } from '../lib/origins';
import { GuestSiteFooter } from './landing/GuestSiteFooter';

export function MaintenancePage() {
  const { t } = useI18n();

  usePageTitle({
    key: 'maintenance.meta.title',
    fallback: 'Maintenance in progress',
  });
  useDocumentMetadata({
    description: t('maintenance.body'),
    canonicalPath: PUBLIC_APP_ENTRY_PATH,
  });

  return (
    <PageStateShell
      background="transparent"
      containerSize="narrow"
      className="bg-[#fafafa] text-ink dark:bg-[#000000]"
    >
      <div className="flex w-full flex-1 flex-col">
        <section className="mx-auto w-full max-w-2xl text-center">
          <p className="app-text-label uppercase tracking-[0.18em] text-brick">
            {t('maintenance.eyebrow')}
          </p>
          <div className="my-5 text-ink-4" aria-hidden="true">
            ❦
          </div>
          <h1 className="app-text-page-title text-ink">
            {t('maintenance.heading')}
          </h1>
          <p className="app-text-page-description mx-auto mt-4 max-w-xl text-ink-2">
            {t('maintenance.body')}
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink
              to={PUBLIC_APP_ENTRY_PATH}
              className="w-full justify-center sm:w-auto"
            >
              {t('maintenance.action')}
            </ButtonLink>
          </div>
        </section>
        <GuestSiteFooter className="mt-20" />
      </div>
    </PageStateShell>
  );
}
