import type { ReactNode } from 'react';

export type FilterSectionProps = {
  children: ReactNode;
  sectionId: string;
  title: string;
};

export function FilterSection({
  children,
  sectionId,
  title,
}: FilterSectionProps) {
  const sectionTitleId = `filter-section-${sectionId}`;

  return (
    <fieldset
      aria-labelledby={sectionTitleId}
      className="m-0 min-w-0 border-0 p-0"
    >
      <legend
        id={sectionTitleId}
        className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-3"
      >
        {title}
      </legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}
