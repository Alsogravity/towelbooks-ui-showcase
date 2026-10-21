function getTimezoneOffsetMinutes(date: Date, timeZone: string): number {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    }).formatToParts(date);

    const map: Record<string, string> = {};
    for (const part of parts) {
      map[part.type] = part.value;
    }

    const year = Number.parseInt(map.year, 10);
    const month = Number.parseInt(map.month, 10) - 1;
    const day = Number.parseInt(map.day, 10);
    const hour = Number.parseInt(map.hour, 10);
    const minute = Number.parseInt(map.minute, 10);
    const second = Number.parseInt(map.second, 10);

    const dateInTz = Date.UTC(year, month, day, hour, minute, second);
    return (dateInTz - date.getTime()) / 60_000;
  } catch {
    return -date.getTimezoneOffset();
  }
}

export function localDateTimeToUtcIso(
  localDateTime: string,
  timeZone: string,
): string {
  if (!localDateTime) {
    return '';
  }

  try {
    const date = new Date(`${localDateTime}:00Z`);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const offsetMinutes = getTimezoneOffsetMinutes(date, timeZone);
    return new Date(date.getTime() - offsetMinutes * 60_000).toISOString();
  } catch {
    return new Date(localDateTime).toISOString();
  }
}

export function utcIsoToLocalDateTimeInput(
  iso: string,
  timeZone: string,
): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  try {
    const offsetMinutes = getTimezoneOffsetMinutes(date, timeZone);
    const localInTz = new Date(date.getTime() + offsetMinutes * 60_000);
    const pad = (value: number) => String(value).padStart(2, '0');

    return `${localInTz.getUTCFullYear()}-${pad(
      localInTz.getUTCMonth() + 1,
    )}-${pad(localInTz.getUTCDate())}T${pad(localInTz.getUTCHours())}:${pad(
      localInTz.getUTCMinutes(),
    )}`;
  } catch {
    const pad = (value: number) => String(value).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate(),
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}
