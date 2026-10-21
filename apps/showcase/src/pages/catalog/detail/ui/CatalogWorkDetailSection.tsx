import { type ReactNode } from 'react';

import type { CatalogWorkDetailField } from './catalogWorkDetailHelpers';

export function CatalogWorkDetailScalarField({
  label,
  value,
}: CatalogWorkDetailField) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="app-text-label text-ink-2">{label}</dt>
      <dd className="app-text-body-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export function CatalogWorkDetailSection({
  children,
  className,
  id,
  title,
}: {
  children: ReactNode;
  className?: string;
  id: string;
  title?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 pt-6 first:pt-0 ${className ?? ''}`}
    >
      <div className="flex flex-col gap-4">
        {title ? (
          <header className="flex items-center gap-4">
            <h2 className="app-text-section-title shrink-0 text-ink">
              {title}
            </h2>
            <div className="h-px w-full bg-rule/20" />
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export function CatalogWorkDetailPlaceholderList({
  message,
}: {
  message: string;
}) {
  return (
    <div className="app-text-body-sm rounded-2xl border border-dashed border-rule/60 bg-paper-2/30 px-5 py-6 text-center text-ink-3">
      {message}
    </div>
  );
}
