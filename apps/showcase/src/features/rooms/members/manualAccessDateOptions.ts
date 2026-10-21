import { localDateEndOfDayToUtcIso } from '../../../lib/datetime';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type ManualAccessExpirationMode = 'none' | 'date';
type ManualAccessPreset = 'days7' | 'days30' | 'days90';

type ManualDurationOption =
  'days7' | 'days30' | 'days90' | 'custom' | 'noExpiration';

function isoDaysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_IN_MS).toISOString();
}

function localDateDaysFromNow(days: number): string {
  const date = new Date(Date.now() + days * DAY_IN_MS);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getManualExpiresAt(
  duration: ManualDurationOption,
  customDate: string,
): string | null {
  switch (duration) {
    case 'days7':
      return isoDaysFromNow(7);
    case 'days30':
      return isoDaysFromNow(30);
    case 'days90':
      return isoDaysFromNow(90);
    case 'custom':
      return customDate ? localDateEndOfDayToUtcIso(customDate) : null;
    case 'noExpiration':
      return null;
  }
}

function toManualAccessExpiresAt(
  input: { mode: 'none' } | { mode: 'date'; date: string },
): string | null {
  if (input.mode === 'none') {
    return null;
  }
  return input.date ? localDateEndOfDayToUtcIso(input.date) : null;
}

export type {
  ManualAccessExpirationMode,
  ManualAccessPreset,
  ManualDurationOption,
};
export {
  DAY_IN_MS,
  getManualExpiresAt,
  isoDaysFromNow,
  localDateDaysFromNow,
  toManualAccessExpiresAt,
};
