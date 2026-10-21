import { Icon } from '../../../components/primitives';

import type { ReactNode } from 'react';

type SettingsLinkRowProps = {
  href: string;
  children: ReactNode;
};

export function SettingsLinkRow({ href, children }: SettingsLinkRowProps) {
  return (
    <a
      className="flex items-center justify-between gap-3 py-3 text-sm text-brick no-underline transition-colors hover:underline"
      href={href}
    >
      <span>{children}</span>
      <Icon name="chevron-right" size={18} className="shrink-0 text-ink-3" />
    </a>
  );
}
