import { Icon } from '../primitives';

import type { IconName } from '@towelbooks/ui';
import type { ReactNode } from 'react';

type SectionHeaderWithIconProps = {
  actions?: ReactNode;
  className?: string;
  icon: IconName;
  title: string;
};

export function SectionHeaderWithIcon({
  actions,
  className = '',
  icon,
  title,
}: SectionHeaderWithIconProps) {
  return (
    <div
      className={[
        'flex flex-wrap items-center justify-between gap-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <h2 className="app-text-section-title min-w-0 text-ink">
        <span className="inline-flex items-center gap-2">
          <Icon name={icon} size={24} strokeWidth={1.7} />
          {title}
        </span>
      </h2>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
