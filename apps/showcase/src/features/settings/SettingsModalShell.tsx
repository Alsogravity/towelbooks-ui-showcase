import { Dialog, DialogBody } from '../../components/primitives';
import { HeaderActionCapsule } from '../../components/overlay/HeaderActionCapsule';

import type { ReactNode } from 'react';

const settingsModalPanelClassName =
  'app-dialog-panel app-settings-desktop-modal relative flex h-[min(720px,calc(100dvh-2rem))] w-[960px] max-w-[calc(100vw-2rem)] flex-row overflow-hidden rounded-xl border border-paper-3 bg-paper shadow-2xl outline-none';

type SettingsModalShellProps = {
  canClose?: boolean;
  children: ReactNode;
  closeLabel: string;
  nav: ReactNode;
  onClose: () => void;
  title: ReactNode;
  titleId: string;
};

/**
 * Two-column settings desktop modal (app + room). Layout stays special-case;
 * dismiss chrome uses HeaderActionCapsule for visual parity with dialog headers.
 */
export function SettingsModalShell({
  canClose = true,
  children,
  closeLabel,
  nav,
  onClose,
  title,
  titleId,
}: SettingsModalShellProps) {
  return (
    <Dialog
      aria-labelledby={titleId}
      getReturnFocusElement={() => null}
      onClose={onClose}
      panelClassName={settingsModalPanelClassName}
      size="lg"
    >
      {canClose ? (
        <div className="absolute right-4 top-4 z-10">
          <HeaderActionCapsule
            close={{
              ariaLabel: closeLabel,
              onClick: () => onClose(),
            }}
          />
        </div>
      ) : null}
      <aside className="flex w-60 shrink-0 flex-col overflow-y-auto border-r border-rule bg-paper">
        <div className="space-y-6 px-5 py-6">
          <h2 id={titleId} className="app-text-dialog-title text-ink">
            {title}
          </h2>
          {nav}
        </div>
      </aside>
      <DialogBody className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-paper-2 px-6 py-6">
        {children}
      </DialogBody>
    </Dialog>
  );
}
