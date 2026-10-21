import type { TranslationValues } from './locales';

export type DateInput = Date | number | string;

export type TranslateOptions = {
  fallback?: string;
  values?: TranslationValues;
};

export function interpolate(
  message: string,
  values?: TranslationValues,
): string {
  if (!values) {
    return message;
  }

  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    message,
  );
}

export function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value);
}
