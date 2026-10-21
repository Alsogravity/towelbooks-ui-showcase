import { type AriaRole, type ReactNode } from 'react';

import { type LocalizedText, resolveLocalizedText, useI18n } from '../../i18n';
import { Card, Icon, type IconName } from '../primitives';

type StatusTone = 'brick' | 'forest' | 'neutral';
type StatusSurface = 'card' | 'plain';

type StatusPanelProps = {
  actions?: ReactNode;
  ariaLive?: 'assertive' | 'off' | 'polite';
  body?: ReactNode;
  bodyClassName?: string;
  className?: string;
  eyebrow?: LocalizedText;
  footer?: ReactNode;
  icon?: IconName;
  iconPulse?: boolean;
  ornament?: ReactNode;
  role?: AriaRole;
  surface?: StatusSurface;
  title: ReactNode;
  titleClassName?: string;
  tone?: StatusTone;
};

const toneClasses: Record<StatusTone, string> = {
  brick: 'border-brick bg-brick-soft text-brick',
  forest: 'border-forest bg-forest-soft text-forest',
  neutral: 'border-rule bg-paper-2 text-ink-3',
};

const defaultTitleClassName = 'app-text-entity-title text-ink';
const defaultBodyClassName = 'app-text-body mx-auto max-w-md text-ink-3';

export function StatusPanel({
  actions,
  ariaLive,
  body,
  bodyClassName = defaultBodyClassName,
  className = '',
  eyebrow,
  footer,
  icon,
  iconPulse = false,
  ornament,
  role,
  surface = 'plain',
  title,
  titleClassName = defaultTitleClassName,
  tone = 'neutral',
}: StatusPanelProps) {
  const { t } = useI18n();

  const panel = (
    <section
      aria-live={ariaLive}
      className={`flex flex-col items-center text-center ${className}`.trim()}
      role={role}
    >
      {ornament ? (
        <div
          className="app-text-stat-value mb-6 flex items-center justify-center text-ink-4"
          aria-hidden="true"
        >
          {ornament}
        </div>
      ) : null}

      {icon && !ornament ? (
        <div
          className={[
            'mb-5 flex h-16 w-16 items-center justify-center rounded-full border',
            toneClasses[tone],
            iconPulse ? 'animate-pulse' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <Icon name={icon} size={28} />
        </div>
      ) : null}

      {eyebrow ? (
        <p className="eyebrow mb-3">{resolveLocalizedText(eyebrow, t)}</p>
      ) : null}

      <h2 className={titleClassName}>{title}</h2>
      {body ? <p className={`mt-4 ${bodyClassName}`}>{body}</p> : null}

      {actions ? (
        <div className="mt-6 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          {actions}
        </div>
      ) : null}

      {footer ? (
        <div className="app-text-supporting-copy mt-4 text-ink-3">{footer}</div>
      ) : null}
    </section>
  );

  if (surface === 'card') {
    return <Card className="py-12 text-center">{panel}</Card>;
  }

  return panel;
}
