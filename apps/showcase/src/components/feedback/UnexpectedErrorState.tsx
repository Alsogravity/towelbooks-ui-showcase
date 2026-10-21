import { StatusPanel } from './StatusPanel';
import { type LocalizedText, resolveLocalizedText, useI18n } from '../../i18n';

import type { IconName } from '../primitives';
import type { ReactNode } from 'react';

type UnexpectedErrorStateProps = {
  action?: ReactNode;
  body?: LocalizedText;
  className?: string;
  icon?: IconName;
  requestId?: string | null;
  title?: LocalizedText;
};

export function UnexpectedErrorState({
  action,
  body = {
    key: 'errors.unexpected.body',
    fallback:
      'Try again in a moment. If the problem continues, contact support with the request ID below.',
  },
  className = '',
  icon = 'book-x',
  requestId,
  title = {
    key: 'errors.unexpected.title',
    fallback: 'Something went wrong',
  },
}: UnexpectedErrorStateProps) {
  const { t } = useI18n();
  const reference =
    requestId && requestId !== 'unknown'
      ? requestId
      : t('errors.requestId.unavailable');

  return (
    <StatusPanel
      actions={action}
      body={resolveLocalizedText(body, t)}
      bodyClassName="app-text-supporting-copy mx-auto max-w-md text-ink-3"
      className={className}
      footer={
        <>
          {t('errors.requestId.label')}{' '}
          <span className="font-mono text-ink">{reference}</span>
        </>
      }
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
