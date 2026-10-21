import type { AppLocale, PollKind } from '@towelbooks/schemas';

/** Option-like shape shared by voting options and result options. */
type PollOptionLike = {
  dateSlotEndsAt?: string | null;
  dateSlotStartsAt?: string | null;
  label?: string | null;
  referenceSnapshot?: { title: string; coverUrl?: string | null } | null;
};

type FormatDateTime = (
  value: string,
  options?: Intl.DateTimeFormatOptions,
) => string;

type Translate = (
  key: string,
  options?: { values?: Record<string, string | number> },
) => string;

export function getPollKindEmoji(kind: PollKind): string {
  switch (kind) {
    case 'reading':
      return '📚';
    case 'scheduling':
      return '📅';
    case 'general':
      return '💬';
  }
}

export function getPollKindLabelKey(kind: PollKind): string {
  return `rooms.detail.polls.kind.${kind}`;
}

/**
 * Human-readable label for a date-slot option. Returns null when the option is
 * not a date slot so callers can fall back to text/reference labels.
 */
export function formatPollDateSlot(
  option: PollOptionLike,
  formatDateTime: FormatDateTime,
): string | null {
  if (!option.dateSlotStartsAt) {
    return null;
  }

  const start = formatDateTime(option.dateSlotStartsAt, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  if (option.dateSlotEndsAt) {
    const end = formatDateTime(option.dateSlotEndsAt, { timeStyle: 'short' });
    return `${start} – ${end}`;
  }

  return start;
}

/** Resolves the best display label for any poll option. */
export function getPollOptionLabel(
  option: PollOptionLike,
  formatDateTime: FormatDateTime,
  t: Translate,
): string {
  return (
    formatPollDateSlot(option, formatDateTime) ??
    option.label ??
    option.referenceSnapshot?.title ??
    t('rooms.detail.polls.optionFallback')
  );
}

/**
 * Relative deadline such as "in 3 days" / "tomorrow". Works for both future and
 * past timestamps via Intl.RelativeTimeFormat (numeric: 'auto').
 */
export function formatPollDeadline(
  endsAt: string | null,
  locale: AppLocale,
): string | null {
  if (endsAt === null) {
    return null;
  }

  const target = new Date(endsAt).getTime();

  if (!Number.isFinite(target)) {
    return null;
  }

  const diffMs = target - Date.now();
  const absSeconds = Math.abs(diffMs) / 1000;
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (absSeconds < 3600) {
    return formatter.format(Math.round(diffMs / 60000), 'minute');
  }

  if (absSeconds < 86400) {
    return formatter.format(Math.round(diffMs / 3600000), 'hour');
  }

  return formatter.format(Math.round(diffMs / 86400000), 'day');
}
