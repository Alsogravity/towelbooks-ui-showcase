import type { AppLocale } from './locales';

const NBSP = '\u00A0';

function capitalizeMonth(month: string) {
  if (month.length === 0) {
    return month;
  }

  return month.charAt(0).toUpperCase() + month.slice(1);
}

function readDateParts(timestamp: string, locale: AppLocale) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).formatToParts(date);

  const day = parts.find((part) => part.type === 'day')?.value;
  const month = capitalizeMonth(
    parts.find((part) => part.type === 'month')?.value.replace(/\.$/, '') ?? '',
  );
  const year = parts.find((part) => part.type === 'year')?.value;

  if (!day || !month || !year) {
    return null;
  }

  return {
    date,
    day,
    month,
    year,
  };
}

export function formatNotificationTimestamp(
  timestamp: string,
  locale: AppLocale,
  now = Date.now(),
) {
  const resolved = readDateParts(timestamp, locale);

  if (!resolved) {
    return null;
  }

  const currentDate = new Date(now);
  const isSameYear = currentDate.getFullYear() === resolved.date.getFullYear();

  if (locale === 'pt-BR') {
    return isSameYear
      ? `${resolved.day}${NBSP}${resolved.month}`
      : `${resolved.day}${NBSP}${resolved.month} ${resolved.year}`;
  }

  return isSameYear
    ? `${resolved.month}${NBSP}${resolved.day}`
    : `${resolved.month}${NBSP}${resolved.day}, ${resolved.year}`;
}
