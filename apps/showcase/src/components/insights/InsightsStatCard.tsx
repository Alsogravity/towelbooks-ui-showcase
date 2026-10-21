import { Card } from '../primitives';

import type { ReactNode } from 'react';

export type InsightsStatAccent = 'brick' | 'forest' | 'gold';

export function InsightsStatGlyphText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={['dashboard-stat-glyph', className].filter(Boolean).join(' ')}
    >
      <span aria-hidden className="dashboard-stat-glyph__blur">
        {children}
      </span>
      <span className="dashboard-stat-glyph__sharp">{children}</span>
    </span>
  );
}

export function InsightsStatCard({
  illustration,
  isLoading = false,
  label,
  value,
}: {
  illustration: ReactNode;
  isLoading?: boolean;
  label: string;
  value: number | string | null;
}) {
  return (
    <Card
      padding={false}
      className="group relative flex min-h-[96px] flex-col justify-between overflow-hidden p-4"
    >
      {illustration}
      <div className="relative z-10 flex h-full w-full flex-col justify-between">
        {isLoading || value === null ? (
          <span
            aria-hidden="true"
            className="block h-7 w-10 animate-pulse rounded-sm bg-rule/50"
          />
        ) : (
          <InsightsStatGlyphText className="app-text-stat-value text-ink">
            {value}
          </InsightsStatGlyphText>
        )}
        <span className="app-text-stat-label mt-auto pt-2 text-ink-3">
          {label}
        </span>
      </div>
    </Card>
  );
}

export function insightsStatIllustrationClass(
  accent: InsightsStatAccent,
): string {
  const accentClass = {
    brick: 'text-brick',
    forest: 'text-forest',
    gold: 'text-gold',
  }[accent];

  return `${accentClass} stats-illustration pointer-events-none absolute -right-5 -bottom-5`;
}
