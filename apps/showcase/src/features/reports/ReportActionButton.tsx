import { Button } from '../../components/primitives';
import { useI18n } from '../../i18n';

import { useReportOverlay } from './ReportOverlayContext';

import type { ReportTarget } from './reportHash';

type ReportActionButtonProps = ReportTarget & {
  className?: string;
  variant?: 'ghost' | 'icon' | 'text';
};

export function ReportActionButton({
  className,
  targetId,
  targetType,
  variant = 'text',
}: ReportActionButtonProps) {
  const { t } = useI18n();
  const { openReport } = useReportOverlay();
  const label = t('reports.action.report');
  const onClick = () => openReport({ targetId, targetType });

  if (variant === 'icon') {
    return (
      <Button
        aria-label={label}
        className={className}
        icon="flag"
        size="sm"
        title={label}
        type="button"
        variant="icon"
        onClick={onClick}
      />
    );
  }

  if (variant === 'ghost') {
    return (
      <Button
        aria-label={label}
        className={className}
        icon="flag"
        size="sm"
        title={label}
        type="button"
        variant="ghost"
        onClick={onClick}
      />
    );
  }

  return (
    <Button
      className={className}
      prependIcon="flag"
      size="sm"
      type="button"
      variant="text"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
