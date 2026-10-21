import type { ReactNode } from 'react';

import { HeaderActionCapsule } from '../overlay/HeaderActionCapsule';

export interface AppearanceSheetShellProps {
  bodyClassName?: string;
  children: ReactNode;
  closeLabel: string;
  /**
   * Non-icon content before the close capsule.
   * Icon chrome should use structured actions on standard Dialog headers.
   */
  headerAccessory?: ReactNode;
  onClose: () => void;
  title: string;
  titleId: string;
}

/**
 * Embedded sheet chrome (filters, bottom sheets) with capsule close.
 * Prefer standard `Dialog` title + `showCloseButton` when the surface is a
 * centered titled dialog (see AppearanceEditSheet).
 */
export function AppearanceSheetShell({
  bodyClassName,
  children,
  closeLabel,
  headerAccessory,
  onClose,
  title,
  titleId,
}: AppearanceSheetShellProps) {
  const bodyClass = [
    'min-h-0 flex-1',
    bodyClassName ?? 'overflow-y-auto px-5 py-5',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="vui-appearance-sheet-shell flex h-full min-h-0 flex-col">
      <div className="vui-appearance-sheet-shell__header flex shrink-0 items-center justify-between gap-4 border-b px-5 py-4">
        <h3 id={titleId} className="app-text-dialog-title text-ink">
          {title}
        </h3>
        <div className="flex shrink-0 items-center gap-2">
          {headerAccessory}
          <HeaderActionCapsule
            close={{
              ariaLabel: closeLabel,
              onClick: () => onClose(),
            }}
          />
        </div>
      </div>
      <div className={bodyClass}>{children}</div>
    </div>
  );
}
