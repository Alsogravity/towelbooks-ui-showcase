import { isDateOnlyString, parseDateOnlyString } from '@towelbooks/schemas';

import { localDateTimeToUtcIso } from './timezone-aware';
import { resolveBrowserTimezone } from './localDateTimeParts';

export { isDateOnlyString, parseDateOnlyString };

export function getTodayLocalDateString(now = new Date()): string {
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function toDateOnlyInputValue(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  return value.length >= 10 ? value.slice(0, 10) : value;
}

export function localDateEndOfDayToUtcIso(
  dateString: string,
  timeZone = resolveBrowserTimezone(),
): string {
  return localDateTimeToUtcIso(`${dateString}T23:59`, timeZone);
}
