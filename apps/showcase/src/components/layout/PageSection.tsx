import { SectionHeader } from './SectionHeader';

import type { ReactNode } from 'react';

type PageSectionSpacing = 'compact' | 'default' | 'none';

interface PageSectionProps {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  header?: ReactNode;
  spacing?: PageSectionSpacing;
  title?: ReactNode;
}

const spacingClasses: Record<PageSectionSpacing, string> = {
  compact: 'space-y-3',
  default: 'space-y-5',
  none: '',
};

export function PageSection({
  actions,
  children,
  className,
  description,
  eyebrow,
  header,
  spacing = 'default',
  title,
}: PageSectionProps) {
  return (
    <section
      className={[spacingClasses[spacing], className].filter(Boolean).join(' ')}
    >
      {header ??
        (title || eyebrow ? (
          <SectionHeader
            actions={actions}
            description={description}
            eyebrow={eyebrow}
            title={title}
          />
        ) : null)}
      {children}
    </section>
  );
}
