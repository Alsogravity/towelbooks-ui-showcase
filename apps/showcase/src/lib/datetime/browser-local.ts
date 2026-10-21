const BROWSER_LOCAL_DATETIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

type BrowserLocalDateTimeComponents = {
  day: number;
  hour: number;
  minute: number;
  month: number;
  year: number;
};

function parseStrictBrowserLocalDateTime(
  value: string,
): BrowserLocalDateTimeComponents | null {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return null;
  }

  const match = BROWSER_LOCAL_DATETIME_PATTERN.exec(trimmedValue);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);

  if (month < 1 || month > 12 || hour > 23 || minute > 59) {
    return null;
  }

  const reconstructed = new Date(year, month - 1, day, hour, minute);

  if (
    reconstructed.getFullYear() !== year ||
    reconstructed.getMonth() !== month - 1 ||
    reconstructed.getDate() !== day ||
    reconstructed.getHours() !== hour ||
    reconstructed.getMinutes() !== minute
  ) {
    return null;
  }

  return { day, hour, minute, month, year };
}

export function isValidDateTimeLocalInput(value: string): boolean {
  return parseStrictBrowserLocalDateTime(value) !== null;
}

export function parseBrowserLocalDateTimeInput(
  value: string | undefined,
): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const components = parseStrictBrowserLocalDateTime(value);

  if (!components) {
    return undefined;
  }

  return new Date(
    components.year,
    components.month - 1,
    components.day,
    components.hour,
    components.minute,
  ).toISOString();
}

export function formatBrowserLocalDateTimeInput(
  value: string | null | undefined,
): string {
  if (!value) {
    return '';
  }

  const parsedValue = new Date(value);

  if (Number.isNaN(parsedValue.getTime())) {
    return '';
  }

  const localValue = new Date(
    parsedValue.getTime() - parsedValue.getTimezoneOffset() * 60_000,
  );

  return localValue.toISOString().slice(0, 16);
}

export function formatBrowserLocalDateTimeInputFromDate(date: Date): string {
  const localValue = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  );

  return localValue.toISOString().slice(0, 16);
}
