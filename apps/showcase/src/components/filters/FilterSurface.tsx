import { type ReactNode, type RefObject, useState } from 'react';
import { useIsFilterBottomSheetViewport } from '../../layouts/app/shellViewport';
import {
  AnchoredBottomSheet,
  AppearanceSheetShell,
  Dialog,
} from '../primitives';
import { FilterPanelLayout } from './FilterPanelLayout';

const FILTER_BOTTOM_SHEET_EXIT_DURATION_MS = 150;

export type FilterSurfaceProps<T> = {
  appliedValue: T;
  applyLabel: string;
  children: (
    draft: T,
    setDraft: (next: T | ((previous: T) => T)) => void,
  ) => ReactNode;
  closeLabel: string;
  hostRef: RefObject<HTMLElement | null>;
  onApply: (value: T) => void;
  onClose: () => void;
  panelClassName?: string;
  resetLabel: string;
  resetValue: T;
  title: string;
  titleId: string;
};

const desktopDialogPanelClassName =
  'app-dialog-panel relative flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-paper-3 bg-paper shadow-2xl outline-none';

export function FilterSurface<T>({
  appliedValue,
  applyLabel,
  children,
  closeLabel,
  hostRef,
  onApply,
  onClose,
  panelClassName = 'filter-surface-panel',
  resetLabel,
  resetValue,
  title,
  titleId,
}: FilterSurfaceProps<T>) {
  const useBottomSheet = useIsFilterBottomSheetViewport();
  const [draft, setDraft] = useState(appliedValue);
  const [lastAppliedValue, setLastAppliedValue] = useState(appliedValue);

  if (lastAppliedValue !== appliedValue) {
    setLastAppliedValue(appliedValue);
    setDraft(appliedValue);
  }

  const renderPanel = (close: () => void) => (
    <FilterPanelLayout
      applyLabel={applyLabel}
      resetLabel={resetLabel}
      onReset={() => setDraft(resetValue)}
      onApply={() => {
        onApply(draft);
        close();
      }}
      body={
        <AppearanceSheetShell
          closeLabel={closeLabel}
          onClose={close}
          title={title}
          titleId={titleId}
        >
          {children(draft, setDraft)}
        </AppearanceSheetShell>
      }
    />
  );

  if (useBottomSheet) {
    return (
      <AnchoredBottomSheet
        hostRef={hostRef}
        titleId={titleId}
        fallbackPeekHeight="0"
        overlayScope="viewport"
        exitAnimationDurationMs={FILTER_BOTTOM_SHEET_EXIT_DURATION_MS}
        panelClassName={panelClassName}
        onClose={onClose}
      >
        {({ close }) => renderPanel(close)}
      </AnchoredBottomSheet>
    );
  }

  return (
    <Dialog
      aria-labelledby={titleId}
      onClose={onClose}
      size="lg"
      panelClassName={`${panelClassName} ${desktopDialogPanelClassName}`}
    >
      {({ close }) => renderPanel(close)}
    </Dialog>
  );
}
