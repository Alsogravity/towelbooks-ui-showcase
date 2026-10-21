import type { AppLocale } from '@towelbooks/schemas';

export function publicationDateTimeToInputValue(
  value: string | null | undefined,
): string {
  if (!value) return '';

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

export function publicationDateTimeFromInput(value: string): string | null {
  const normalized = value.trim();
  if (!normalized) return null;

  const date = new Date(`${normalized}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function formatPublicationCalendarDate(
  value: string | null | undefined,
  locale: AppLocale,
): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(date);
}
