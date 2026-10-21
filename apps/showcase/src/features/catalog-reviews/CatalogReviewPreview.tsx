import { useI18n } from '../../i18n';

type CatalogReviewPreviewProps = {
  body: string;
  title: string;
};

export function CatalogReviewPreview({
  body,
  title,
}: CatalogReviewPreviewProps) {
  const { t } = useI18n();
  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();

  return (
    <article
      className="mx-auto max-w-5xl space-y-16"
      aria-label={t('catalog.catalogReviewEditor.preview.ariaLabel')}
    >
      <header className="space-y-6 text-center">
        <h2 className="text-h1 font-semibold text-ink">
          {trimmedTitle.length > 0
            ? trimmedTitle
            : t('catalog.catalogReviewEditor.preview.emptyTitle')}
        </h2>
        <div className="mx-auto h-1 w-12 rounded-full bg-brick/20" />
      </header>

      <div className="relative">
        {trimmedBody.length > 0 ? (
          <div className="mx-auto">
            <p className="text-xl leading-relaxed text-ink-2 dropcap whitespace-pre-wrap">
              {trimmedBody}
            </p>
          </div>
        ) : (
          <p className="text-center text-xl italic text-ink-4">
            {t('catalog.catalogReviewEditor.preview.emptyBody')}
          </p>
        )}
      </div>

      <footer className="flex justify-center pt-8">
        <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-rule/30 to-transparent" />
      </footer>
    </article>
  );
}
