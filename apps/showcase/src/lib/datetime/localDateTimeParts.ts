import {
  formatBrowserLocalDateTimeInput,
  isValidDateTimeLocalInput,
  parseBrowserLocalDateTimeInput,
} from './browser-local';
import {
  localDateTimeToUtcIso,
  utcIsoToLocalDateTimeInput,
} from './timezone-aware';

export type LocalDateTimeParts = {
  date: string;
  time: string;
};

export type LocalDateTimeRangeParts = {
  startsDate: string;
  startsTime: string;
  endsDate: string;
  endsTime: string;
};

export type LocalDateTimePartsState =
  'complete' | 'empty' | 'incomplete' | 'invalid';

export type LocalDateTimeRangeErrorCode = 'incomplete' | 'invalid' | 'order';

export type LocalDateTimeRangeErrorCodes = {
  endsAt?: LocalDateTimeRangeErrorCode;
  startsAt?: LocalDateTimeRangeErrorCode;
};

export function createEmptyLocalDateTimeParts(): LocalDateTimeParts {
  return { date: '', time: '' };
}

export function createEmptyLocalDateTimeRangeParts(): LocalDateTimeRangeParts {
  return {
    startsDate: '',
    startsTime: '',
    endsDate: '',
    endsTime: '',
  };
}

export function resolveBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function splitLocalDateTimeInput(
  value: string | null | undefined,
): LocalDateTimeParts {
  if (!value) {
    return createEmptyLocalDateTimeParts();
  }

  const [date = '', time = ''] = value.split('T');

  return { date, time };
}

export function getLocalDateTimePartsState(
  parts: LocalDateTimeParts,
): LocalDateTimePartsState {
  const hasDate = (parts.date ?? '').trim().length > 0;
  const hasTime = (parts.time ?? '').trim().length > 0;

  if (!hasDate && !hasTime) {
    return 'empty';
  }

  if (!hasDate || !hasTime) {
    return 'incomplete';
  }

  const localDateTime = `${parts.date.trim()}T${parts.time.trim()}`;

  return isValidDateTimeLocalInput(localDateTime) ? 'complete' : 'invalid';
}

export function isLocalDateTimePartsEmpty(parts: LocalDateTimeParts): boolean {
  return getLocalDateTimePartsState(parts) === 'empty';
}

export function joinLocalDateTimeParts(
  parts: LocalDateTimeParts,
): string | undefined {
  if (getLocalDateTimePartsState(parts) !== 'complete') {
    return undefined;
  }

  return `${parts.date.trim()}T${parts.time.trim()}`;
}

export function browserLocalDateTimePartsToUtcIso(
  parts: LocalDateTimeParts,
): string | undefined {
  const localDateTime = joinLocalDateTimeParts(parts);

  if (!localDateTime) {
    return undefined;
  }

  return parseBrowserLocalDateTimeInput(localDateTime);
}

export function timezoneLocalDateTimePartsToUtcIso(
  parts: LocalDateTimeParts,
  timezone: string,
): string | undefined {
  const localDateTime = joinLocalDateTimeParts(parts);

  if (!localDateTime) {
    return undefined;
  }

  const utcIso = localDateTimeToUtcIso(localDateTime, timezone);
  return utcIso || undefined;
}

export function utcIsoToBrowserLocalDateTimeParts(
  value: string | null | undefined,
): LocalDateTimeParts {
  return splitLocalDateTimeInput(formatBrowserLocalDateTimeInput(value));
}

export function utcIsoToTimezoneLocalDateTimeParts(
  value: string | null | undefined,
  timezone: string,
): LocalDateTimeParts {
  if (!value) {
    return createEmptyLocalDateTimeParts();
  }

  return splitLocalDateTimeInput(utcIsoToLocalDateTimeInput(value, timezone));
}

export function browserLocalDateTimeRangeFromUtcIso(
  startsAt: string | null | undefined,
  endsAt: string | null | undefined,
): LocalDateTimeRangeParts {
  const starts = utcIsoToBrowserLocalDateTimeParts(startsAt);
  const ends = utcIsoToBrowserLocalDateTimeParts(endsAt);

  return {
    startsDate: starts.date,
    startsTime: starts.time,
    endsDate: ends.date,
    endsTime: ends.time,
  };
}

export function timezoneLocalDateTimeRangeFromUtcIso(
  startsAt: string | null | undefined,
  endsAt: string | null | undefined,
  timezone: string,
): LocalDateTimeRangeParts {
  const starts = utcIsoToTimezoneLocalDateTimeParts(startsAt, timezone);
  const ends = utcIsoToTimezoneLocalDateTimeParts(endsAt, timezone);

  return {
    startsDate: starts.date,
    startsTime: starts.time,
    endsDate: ends.date,
    endsTime: ends.time,
  };
}

export function getStartLocalDateTimeParts(
  value: LocalDateTimeRangeParts,
): LocalDateTimeParts {
  return {
    date: value.startsDate,
    time: value.startsTime,
  };
}

export function getEndLocalDateTimeParts(
  value: LocalDateTimeRangeParts,
): LocalDateTimeParts {
  return {
    date: value.endsDate,
    time: value.endsTime,
  };
}

export function validateLocalDateTimeRange(
  value: LocalDateTimeRangeParts,
  options?: {
    orderField?: 'endsAt' | 'startsAt';
  },
): LocalDateTimeRangeErrorCodes {
  const errors: LocalDateTimeRangeErrorCodes = {};
  const starts = getStartLocalDateTimeParts(value);
  const ends = getEndLocalDateTimeParts(value);
  const startsState = getLocalDateTimePartsState(starts);
  const endsState = getLocalDateTimePartsState(ends);

  if (startsState === 'incomplete') {
    errors.startsAt = 'incomplete';
  } else if (startsState === 'invalid') {
    errors.startsAt = 'invalid';
  }

  if (endsState === 'incomplete') {
    errors.endsAt = 'incomplete';
  } else if (endsState === 'invalid') {
    errors.endsAt = 'invalid';
  }

  if (
    startsState === 'complete' &&
    endsState === 'complete' &&
    `${value.startsDate}T${value.startsTime}` >=
      `${value.endsDate}T${value.endsTime}`
  ) {
    errors[options?.orderField ?? 'startsAt'] = 'order';
  }

  return errors;
}
