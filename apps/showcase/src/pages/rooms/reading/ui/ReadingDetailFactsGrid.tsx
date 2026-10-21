import type { ReactNode } from 'react';

export interface ReadingDetailFactItem {
  label: string;
  value: ReactNode;
}

interface ReadingDetailFactsGridProps {
  columnsClassName: string;
  facts: ReadingDetailFactItem[];
}

export function ReadingDetailFactsGrid({
  columnsClassName,
  facts,
}: ReadingDetailFactsGridProps) {
  return (
    <div className={`grid gap-3 ${columnsClassName}`}>
      {facts.map((fact) => (
        <div key={fact.label} className="py-1">
          <p className="app-text-label text-ink-3">{fact.label}</p>
          <p className="app-text-body-sm font-medium text-ink">{fact.value}</p>
        </div>
      ))}
    </div>
  );
}
