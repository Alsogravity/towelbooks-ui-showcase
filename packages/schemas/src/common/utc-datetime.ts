import { z } from 'zod';

export const UTC_DATETIME_INVALID_MESSAGE =
  'Must be a valid ISO-8601 datetime with explicit offset.';

export const utcDateTimeStringSchema = z
  .string()
  .datetime({ offset: true, message: UTC_DATETIME_INVALID_MESSAGE });

export function isUtcDateTimeString(value: string): boolean {
  return utcDateTimeStringSchema.safeParse(value).success;
}
