import { PageSection, SectionHeaderWithIcon } from '../../../components/layout';

import type { IconName } from '@towelbooks/ui';
import type { ReactNode } from 'react';

type LibrarySectionSpacing = 'compact' | 'default' | 'none';

type LibrarySectionProps = {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  icon: IconName;
  spacing?: LibrarySectionSpacing;
  title: string;
};

export function LibrarySection({
  actions,
  children,
  className,
  description,
  icon,
  spacing = 'default',
  title,
}: LibrarySectionProps) {
  return (
    <PageSection
      className={className}
      header={
        <div className="flex flex-col gap-1.5">
          <SectionHeaderWithIcon actions={actions} icon={icon} title={title} />
          {description ? (
            <p className="app-text-supporting-copy text-ink-2">{description}</p>
          ) : null}
        </div>
      }
      spacing={spacing}
    >
      {children}
    </PageSection>
  );
}
