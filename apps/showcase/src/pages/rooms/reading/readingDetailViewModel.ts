import {
  formatCatalogLanguageLabel,
  type AppLocale,
  type Reading,
} from '@towelbooks/schemas';

import { formatPublicationCalendarDate } from '../../../lib/datetime';

type Translate = (
  key: string,
  options?: { fallback?: string; values?: Record<string, number | string> },
) => string;

export interface ReadingDetailFact {
  label: string;
  value: string;
}

export interface ReadingDetailStatus {
  label: string;
  variant: 'gilt' | 'paused' | 'reading';
}

export interface ReadingDetailViewModel {
  edition: Reading['catalogEdition'] | null;
  editionFacts: ReadingDetailFact[];
  status: ReadingDetailStatus;
}

interface CreateReadingDetailViewModelInput {
  reading: Reading;
  referenceTime: number;
  locale?: AppLocale;
  t: Translate;
}

function resolveReadingStatus(
  reading: Reading,
  t: Translate,
  referenceTime: number,
): ReadingDetailStatus {
  if (reading.endsAt && new Date(reading.endsAt).getTime() <= referenceTime) {
    return { label: t('rooms.reading.status.ended'), variant: 'paused' };
  }

  if (
    reading.startsAt &&
    new Date(reading.startsAt).getTime() > referenceTime
  ) {
    return { label: t('rooms.reading.status.upcoming'), variant: 'gilt' };
  }

  return { label: t('rooms.reading.status.active'), variant: 'reading' };
}

export function createReadingDetailViewModel({
  reading,
  referenceTime,
  locale = 'pt-BR',
  t,
}: CreateReadingDetailViewModelInput): ReadingDetailViewModel {
  const edition = reading.catalogEdition ?? null;
  const languageLabel = edition?.language
    ? formatCatalogLanguageLabel(edition.language, locale)
    : null;

  return {
    edition,
    editionFacts: edition
      ? [
          ...(edition.publisher
            ? [
                {
                  label: t('rooms.reading.edition.meta.publisher'),
                  value: edition.publisher,
                },
              ]
            : []),
          ...(edition.publishedDate !== null &&
          formatPublicationCalendarDate(edition.publishedDate, locale) !== null
            ? [
                {
                  label: t('rooms.reading.edition.meta.publishedDate'),
                  value: formatPublicationCalendarDate(
                    edition.publishedDate,
                    locale,
                  )!,
                },
              ]
            : []),
          ...(edition.pageCount
            ? [
                {
                  label: t('rooms.reading.edition.meta.pageCount'),
                  value: t('rooms.reading.edition.pageCountValue', {
                    values: { count: edition.pageCount },
                  }),
                },
              ]
            : []),
          ...(languageLabel
            ? [
                {
                  label: t('rooms.reading.edition.meta.language'),
                  value: languageLabel,
                },
              ]
            : []),
          ...((edition.isbn13 ?? edition.isbn10)
            ? [
                {
                  label: t('rooms.reading.edition.meta.isbn'),
                  value: edition.isbn13 ?? edition.isbn10 ?? '',
                },
              ]
            : []),
        ]
      : [],
    status: resolveReadingStatus(reading, t, referenceTime),
  };
}
