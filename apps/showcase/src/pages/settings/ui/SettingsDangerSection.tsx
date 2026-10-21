import {
  settingsDescriptionClassName,
  settingsSectionTitleClassName,
} from './settingsTypography';
import { PageSection } from '../../../components/layout';

import type { ReactNode } from 'react';

type SettingsDangerSectionProps = {
  title: ReactNode;
  titleAs?: 'h2' | 'h3';
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

const dangerStyling =
  'rounded-xl border border-brick bg-brick-soft/40 px-5 py-6 sm:px-6';

export function SettingsDangerSection({
  title,
  titleAs = 'h3',
  description,
  children,
  className = '',
}: SettingsDangerSectionProps) {
  const TitleTag = titleAs;

  return (
    <PageSection
      className={[dangerStyling, className].filter(Boolean).join(' ')}
      spacing="compact"
      header={
        <div>
          <TitleTag className={settingsSectionTitleClassName}>{title}</TitleTag>
          {description ? (
            <p className={`mt-2 ${settingsDescriptionClassName}`}>
              {description}
            </p>
          ) : null}
        </div>
      }
    >
      {children}
    </PageSection>
  );
}
