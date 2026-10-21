/**
 * Settings index section rows (app + room settings first view).
 * Hover raises icon/label/chevron contrast only — no background fill
 * (mobile panel and desktop content share this treatment).
 */
export const settingsIndexActionRowClassName = [
  'group flex w-full items-center justify-between gap-4',
  'px-0 py-4 text-left transition-colors',
  'lg:rounded-lg lg:px-4',
].join(' ');

/** Leading icon: softer at rest, full ink on hover. */
export const settingsIndexActionRowIconClassName =
  'shrink-0 text-ink-2 transition-colors group-hover:text-ink';

/** Primary label: softer at rest, full ink on hover. */
export const settingsIndexActionRowLabelClassName =
  'label block min-w-0 text-ink-2 transition-colors group-hover:text-ink';

/** Trailing chevron: muted at rest, stronger on hover. */
export const settingsIndexActionRowChevronClassName =
  'ml-4 shrink-0 text-ink-3 transition-colors group-hover:text-ink';
