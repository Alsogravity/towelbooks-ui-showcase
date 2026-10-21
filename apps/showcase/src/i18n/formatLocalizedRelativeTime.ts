const minuteInSeconds = 60;
const hourInSeconds = 60 * minuteInSeconds;
const dayInSeconds = 24 * hourInSeconds;
const weekInSeconds = 7 * dayInSeconds;
const monthInSeconds = 30 * dayInSeconds;
const yearInSeconds = 365 * dayInSeconds;

export function formatLocalizedRelativeTime({
  locale,
  now = Date.now(),
  timestamp,
  justNowLabel,
}: {
  justNowLabel: string;
  locale: AppLocale;
  now?: number;
  timestamp: string;
}) {
  const parsedTimestamp = new Date(timestamp).getTime();

  if (!Number.isFinite(parsedTimestamp)) {
    return null;
  }

  const elapsedSeconds = Math.floor((now - parsedTimestamp) / 1000);

  if (elapsedSeconds <= 0 || elapsedSeconds < minuteInSeconds) {
    return justNowLabel;
  }

  const formatter = new Intl.RelativeTimeFormat(locale, {
    numeric: 'always',
  });

  if (elapsedSeconds < hourInSeconds) {
    return formatter.format(
      -Math.floor(elapsedSeconds / minuteInSeconds),
      'minute',
    );
  }

  if (elapsedSeconds < dayInSeconds) {
    return formatter.format(
      -Math.floor(elapsedSeconds / hourInSeconds),
      'hour',
    );
  }

  if (elapsedSeconds < weekInSeconds) {
    return formatter.format(-Math.floor(elapsedSeconds / dayInSeconds), 'day');
  }

  if (elapsedSeconds < monthInSeconds) {
    return formatter.format(
      -Math.floor(elapsedSeconds / weekInSeconds),
      'week',
    );
  }

  if (elapsedSeconds < yearInSeconds) {
    return formatter.format(
      -Math.floor(elapsedSeconds / monthInSeconds),
      'month',
    );
  }

  return formatter.format(-Math.floor(elapsedSeconds / yearInSeconds), 'year');
}
import type { AppLocale } from '@towelbooks/schemas';
