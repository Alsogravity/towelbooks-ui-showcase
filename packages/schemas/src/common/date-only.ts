import { z } from 'zod';

export const DATE_ONLY_INVALID_MESSAGE =
  'Must be a valid date in YYYY-MM-DD format.';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseDateOnlyString(value: string): Date | null {
  if (!DATE_ONLY_PATTERN.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function isDateOnlyString(value: string): boolean {
  return parseDateOnlyString(value) !== null;
}

export function formatDateOnlyString(
  value: Date | null | undefined,
): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}

export const dateOnlyStringSchema = z
  .string()
  .refine(isDateOnlyString, DATE_ONLY_INVALID_MESSAGE);
