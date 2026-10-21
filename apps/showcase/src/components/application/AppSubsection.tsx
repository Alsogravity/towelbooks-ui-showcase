import { PageSection } from '../layout';
import {
  appDescriptionClassName,
  appSectionTitleClassName,
} from './appUiTypography';

import type { ReactNode } from 'react';

export type AppSubsectionSpacing = 'compact' | 'default' | 'none';

export type AppSubsectionProps = {
  title?: ReactNode;
  titleAs?: 'h2' | 'h3' | 'h4';
  titleAccessory?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  spacing?: AppSubsectionSpacing;
};

export function AppSubsection({
  title,
  titleAs = 'h3',
  titleAccessory,
  description,
  actions,
  children,
  className = '',
  headerClassName = '',
  spacing = 'compact',
}: AppSubsectionProps) {
  const TitleTag = titleAs;
  const sectionSpacing = spacing === 'compact' ? 'space-y-1.5' : '';
  const pageSectionSpacing = spacing === 'compact' ? 'none' : spacing;
  const hasHeader = title != null || description != null || actions != null;

  const header = hasHeader ? (
    <div
      className={[
        'flex flex-wrap items-start justify-between gap-4',
        headerClassName,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="min-w-0">
        {title != null && titleAccessory ? (
          <div
            className={[
              'flex min-w-0 items-center gap-1.5',
              description ? 'mb-1' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <TitleTag className={appSectionTitleClassName}>{title}</TitleTag>
            <div className="shrink-0">{titleAccessory}</div>
          </div>
        ) : title != null ? (
          <TitleTag
            className={[appSectionTitleClassName, description ? 'mb-1' : '']
              .filter(Boolean)
              .join(' ')}
          >
            {title}
          </TitleTag>
        ) : null}
        {description ? (
          <p className={appDescriptionClassName}>{description}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  ) : undefined;

  return (
    <PageSection
      className={[sectionSpacing, className].filter(Boolean).join(' ')}
      spacing={pageSectionSpacing}
      header={header}
    >
      {children}
    </PageSection>
  );
}
