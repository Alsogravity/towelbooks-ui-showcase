import { Link } from 'react-router';

import { Icon } from '../primitives';

import type { ReactNode } from 'react';

export function SectionTitleLink({
  ariaLabel,
  title,
  to,
}: {
  ariaLabel: string;
  title: ReactNode;
  to: string;
}) {
  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      className="flex min-h-9 items-center gap-4 rounded-md no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2"
    >
      <h2 className="app-text-section-title min-w-0 truncate text-ink">
        {title}
      </h2>
      <div
        aria-hidden="true"
        className="min-w-0 flex-1 border-t border-paper-3"
      />
      <span
        aria-hidden="true"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-brick"
      >
        <Icon name="chevron-right" size={18} />
      </span>
    </Link>
  );
}
