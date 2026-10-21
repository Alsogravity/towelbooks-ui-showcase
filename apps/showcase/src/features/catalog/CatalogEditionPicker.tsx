import {
  formatCatalogLanguageLabel,
  type CatalogEdition,
} from '@towelbooks/schemas';

import { CatalogCoverMedia } from '../../entities/reading/ui';
import { catalogCoverSourcesFromUrl } from '../../entities/reading/ui/coverImages';
import { useI18n } from '../../i18n';
import { formatPublicationCalendarDate } from '../../lib/datetime';
import { Icon } from '../../components/primitives';

export type CatalogEditionPickerOption = Omit<
  Pick<
    CatalogEdition,
    | 'coverThumbnailUrl'
    | 'coverUrl'
    | 'id'
    | 'isbn10'
    | 'isbn13'
    | 'language'
    | 'pageCount'
    | 'publishedDate'
    | 'publisher'
    | 'subtitle'
    | 'title'
  >,
  'pageCount'
> & {
  contributors?: readonly string[];
  pageCount: number | null;
};

export type CatalogEditionPickerProps = {
  authorFallback?: string;
  disabled?: boolean;
  editions: readonly CatalogEditionPickerOption[];
  label?: string;
  noEditionDescription?: string;
  noEditionLabel?: string;
  onChange: (catalogEditionId: string | null) => void;
  selectedEditionId: string | null;
};

function optionClassName(isSelected: boolean) {
  return [
    'block w-full overflow-hidden rounded-md border text-left transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2',
    isSelected
      ? 'border-brick bg-brick-soft/25 shadow-2'
      : 'border-rule bg-paper-2/60 hover:border-brick/60',
  ].join(' ');
}

function EditionFacts({
  edition,
  locale,
  t,
}: {
  edition: CatalogEditionPickerOption;
  locale: ReturnType<typeof useI18n>['locale'];
  t: ReturnType<typeof useI18n>['t'];
}) {
  const facts: string[] = [];

  if (edition.publisher) {
    facts.push(
      `${t('rooms.reading.edition.meta.publisher')}: ${edition.publisher}`,
    );
  }

  const publishedDate = formatPublicationCalendarDate(
    edition.publishedDate,
    locale,
  );
  if (publishedDate) {
    facts.push(
      `${t('rooms.reading.edition.meta.publishedDate')}: ${publishedDate}`,
    );
  }

  const language = formatCatalogLanguageLabel(edition.language, locale);
  if (language) {
    facts.push(`${t('rooms.reading.edition.meta.language')}: ${language}`);
  }

  if (edition.pageCount && edition.pageCount > 0) {
    facts.push(
      t('rooms.reading.edition.pageCountValue', {
        values: { count: edition.pageCount },
      }),
    );
  }

  const isbn = edition.isbn13 ?? edition.isbn10;
  if (isbn) {
    facts.push(`${t('rooms.reading.edition.meta.isbn')}: ${isbn}`);
  }

  if (facts.length === 0) {
    return null;
  }

  return (
    <div className="app-text-caption mt-3 flex flex-wrap gap-x-3 gap-y-1 text-ink-3">
      {facts.map((fact) => (
        <span key={fact}>{fact}</span>
      ))}
    </div>
  );
}

function EditionOptionCard({
  authorFallback,
  disabled,
  edition,
  isSelected,
  locale,
  onChange,
  t,
}: {
  authorFallback: string;
  disabled: boolean;
  edition: CatalogEditionPickerOption;
  isSelected: boolean;
  locale: ReturnType<typeof useI18n>['locale'];
  onChange: () => void;
  t: ReturnType<typeof useI18n>['t'];
}) {
  const contributors = edition.contributors?.join(', ') || authorFallback;

  return (
    <button
      aria-checked={isSelected}
      className={optionClassName(isSelected)}
      disabled={disabled}
      onClick={onChange}
      role="radio"
      type="button"
    >
      <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-4 sm:p-4">
        <div className="h-24 w-16 shrink-0 overflow-hidden rounded-sm bg-vellum/20 shadow-sm sm:h-28 sm:w-[72px]">
          <CatalogCoverMedia
            author={contributors}
            className="h-full w-full !aspect-auto rounded-none"
            coverDelivery={{ loading: 'lazy', preferredVariant: 'detail' }}
            fit="cover"
            imageClassName="h-full w-full object-cover"
            size="fluid"
            sources={catalogCoverSourcesFromUrl(
              edition.coverUrl,
              edition.coverThumbnailUrl,
            )}
            theme={edition.id.charCodeAt(0)}
            title={edition.title}
          />
        </div>

        <div className="min-w-0">
          <span className="app-text-card-title block text-ink">
            {edition.title}
          </span>
          {edition.subtitle ? (
            <p className="app-text-caption mt-1 text-ink-3">
              {edition.subtitle}
            </p>
          ) : null}
          <p className="app-text-metadata mt-1 text-ink-3">{contributors}</p>
          <EditionFacts edition={edition} locale={locale} t={t} />
        </div>
      </div>
    </button>
  );
}

function NoEditionOptionCard({
  description,
  disabled,
  isSelected,
  label,
  onChange,
}: {
  description: string;
  disabled: boolean;
  isSelected: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      aria-checked={isSelected}
      className={optionClassName(isSelected)}
      disabled={disabled}
      onClick={onChange}
      role="radio"
      type="button"
    >
      <div className="flex items-center gap-3 p-4">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-vellum text-ink-3"
        >
          <Icon name="book-open" size={24} strokeWidth={1.7} />
        </span>
        <span className="min-w-0">
          <span className="app-text-card-title block text-ink">{label}</span>
          <span className="app-text-caption mt-1 block text-ink-3">
            {description}
          </span>
        </span>
      </div>
    </button>
  );
}

export function CatalogEditionPicker({
  authorFallback,
  disabled = false,
  editions,
  label,
  noEditionDescription,
  noEditionLabel,
  onChange,
  selectedEditionId,
}: CatalogEditionPickerProps) {
  const { locale, t } = useI18n();
  const resolvedAuthorFallback =
    authorFallback ?? t('myLibrary.common.noContributor');
  const resolvedLabel = label ?? t('rooms.readingFlow.edition.title');
  const resolvedNoEditionLabel =
    noEditionLabel ?? t('rooms.readingFlow.edition.noSelection');
  const resolvedNoEditionDescription =
    noEditionDescription ??
    t('rooms.readingFlow.edition.noSelectionDescription');

  return (
    <fieldset>
      <legend className="sr-only">{resolvedLabel}</legend>
      <div aria-label={resolvedLabel} className="space-y-3" role="radiogroup">
        {editions.map((edition) => (
          <EditionOptionCard
            key={edition.id}
            authorFallback={resolvedAuthorFallback}
            disabled={disabled}
            edition={edition}
            isSelected={selectedEditionId === edition.id}
            locale={locale}
            onChange={() => onChange(edition.id)}
            t={t}
          />
        ))}
        <NoEditionOptionCard
          description={resolvedNoEditionDescription}
          disabled={disabled}
          isSelected={selectedEditionId === null}
          label={resolvedNoEditionLabel}
          onChange={() => onChange(null)}
        />
      </div>
    </fieldset>
  );
}
