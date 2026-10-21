import type { ReactNode } from 'react';

interface SectionHeaderProps {
  actions?: ReactNode;
  className?: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
}

export function SectionHeader({
  actions,
  className = '',
  description,
  eyebrow,
  title,
}: SectionHeaderProps) {
  const hasTitle = Boolean(title);

  return (
    <div
      className={['flex flex-col gap-1.5', className].filter(Boolean).join(' ')}
    >
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {hasTitle ? (
        <header className="flex min-h-9 items-center gap-4">
          <h2 className="app-text-section-title min-w-0 truncate text-ink">
            {title}
          </h2>
          <div
            aria-hidden="true"
            className="min-w-0 flex-1 border-t border-paper-3"
          />
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>
      ) : actions ? (
        <div className="flex items-center justify-end">{actions}</div>
      ) : null}
      {description ? (
        <p className="app-text-supporting-copy text-ink-2">{description}</p>
      ) : null}
    </div>
  );
}
