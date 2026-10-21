import { StatusPanel } from './StatusPanel';
import { type LocalizedText, resolveLocalizedText, useI18n } from '../../i18n';

import type { IconName } from '../primitives';
import type { ReactNode } from 'react';

interface ErrorStateProps {
  action?: ReactNode;
  body: LocalizedText;
  className?: string;
  icon?: IconName;
  title: LocalizedText;
}

export function ErrorState({
  action,
  body,
  className = '',
  icon,
  title,
}: ErrorStateProps) {
  const { t } = useI18n();

  return (
    <StatusPanel
      actions={action}
      body={resolveLocalizedText(body, t)}
      bodyClassName="app-text-supporting-copy mx-auto max-w-sm text-ink-3"
      className={className}
      icon={icon}
      ornament={null}
      role="alert"
      surface="card"
      title={resolveLocalizedText(title, t)}
      titleClassName="app-text-entity-title text-ink"
      tone="brick"
    />
  );
}
