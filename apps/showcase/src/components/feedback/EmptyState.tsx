import { StatusPanel } from './StatusPanel';
import { type LocalizedText, resolveLocalizedText, useI18n } from '../../i18n';
import { Icon, type IconName } from '../primitives';

import type { ReactNode } from 'react';

interface EmptyStateProps {
  action?: ReactNode;
  body?: LocalizedText;
  className?: string;
  icon?: IconName;
  ornament?: ReactNode;
  title: LocalizedText;
}

export function EmptyState({
  action,
  body,
  className = '',
  icon,
  ornament,
  title,
}: EmptyStateProps) {
  const { t } = useI18n();

  const ornamentNode =
    icon !== undefined ? (
      <Icon name={icon} size={44} strokeWidth={1.5} className="text-ink-3" />
    ) : ornament !== undefined ? (
      ornament
    ) : (
      '❦'
    );

  return (
    <StatusPanel
      actions={action}
      body={body ? resolveLocalizedText(body, t) : undefined}
      bodyClassName="app-text-body mx-auto max-w-md text-ink-3"
      className={['mb-20 lg:mb-0', className].filter(Boolean).join(' ')}
      ornament={ornamentNode}
      title={resolveLocalizedText(title, t)}
    />
  );
}
