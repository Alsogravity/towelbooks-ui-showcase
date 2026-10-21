import type { PublicLegalLocale } from './types.js';

function effectiveAtToDateOnly(effectiveAt: string): string {
  return effectiveAt.slice(0, 10);
}

function formatLongDate(locale: PublicLegalLocale, dateOnly: string): string {
  const [year, month, day] = dateOnly.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    return dateOnly;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  const tag = locale === 'pt-BR' ? 'pt-BR' : 'en-US';

  return new Intl.DateTimeFormat(tag, {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(date);
}

export function formatPublicLegalTitle(baseTitle: string): string {
  return baseTitle;
}

export function formatPublicLegalEffectiveDateLabel(
  locale: PublicLegalLocale,
  effectiveAt: string,
): string {
  const longDate = formatLongDate(locale, effectiveAtToDateOnly(effectiveAt));

  if (locale === 'pt-BR') {
    return `Vigente a partir de ${longDate}`;
  }

  return `Effective as of ${longDate}`;
}

export function formatPublicLegalLastUpdatedLabel(
  locale: PublicLegalLocale,
  effectiveAt: string,
): string {
  const longDate = formatLongDate(locale, effectiveAtToDateOnly(effectiveAt));

  if (locale === 'pt-BR') {
    return `Última atualização: ${longDate}`;
  }

  return `Last updated: ${longDate}`;
}

export function formatPublicLegalArchivePeriodLabel(
  locale: PublicLegalLocale,
  effectiveAt: string,
): string {
  return formatLongDate(locale, effectiveAtToDateOnly(effectiveAt));
}

export function formatPrivacyChangelogEntryTitle(
  locale: PublicLegalLocale,
  version: string,
  effectiveAt: string,
): string {
  const longDate = formatLongDate(locale, effectiveAtToDateOnly(effectiveAt));
  return `${version} (${longDate})`;
}
