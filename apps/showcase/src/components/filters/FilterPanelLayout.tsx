import type { ReactNode } from 'react';
import { Button, DialogActions } from '../primitives';

export type FilterPanelLayoutProps = {
  applyLabel: string;
  body: ReactNode;
  onApply: () => void;
  onReset: () => void;
  resetLabel: string;
};

export function FilterPanelLayout({
  applyLabel,
  body,
  onApply,
  onReset,
  resetLabel,
}: FilterPanelLayoutProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{body}</div>
      <DialogActions
        className="vui-surface-panel-actions shrink-0 px-5 pb-5 pt-4"
        stackOnMobile
      >
        <Button type="button" variant="secondary" onClick={onReset}>
          {resetLabel}
        </Button>
        <Button type="button" variant="primary" onClick={onApply}>
          {applyLabel}
        </Button>
      </DialogActions>
    </div>
  );
}
