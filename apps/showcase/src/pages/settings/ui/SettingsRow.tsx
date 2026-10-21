import { AppControlRow } from '../../../components/application';

import type { ReactNode } from 'react';

type SettingsRowProps = {
  title?: ReactNode;
  description?: ReactNode;
  control: ReactNode;
  className?: string;
};

export function SettingsRow({
  title,
  description,
  control,
  className = '',
}: SettingsRowProps) {
  return (
    <AppControlRow
      className={className}
      control={control}
      description={description}
      label={title}
      mobileLayout="inline"
    />
  );
}
