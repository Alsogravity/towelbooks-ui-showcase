import { useCallback, useEffect, useRef, useState } from 'react';

export type OverlayViewParent<TView> = TView | 'close';

export type UseOverlayViewStackOptions<TView extends { type: string }> = {
  getParent: (view: TView) => OverlayViewParent<TView>;
  initialView: TView;
  onBeforeBack?: (view: TView) => void;
  onClose: () => void;
};

export function useOverlayViewStack<TView extends { type: string }>({
  getParent,
  initialView,
  onBeforeBack,
  onClose,
}: UseOverlayViewStackOptions<TView>) {
  const [view, setView] = useState<TView>(initialView);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo?.({ top: 0 });
  }, [view]);

  const back = useCallback(() => {
    onBeforeBack?.(view);

    const parent = getParent(view);

    if (parent === 'close') {
      onClose();
      return;
    }

    setView(parent);
  }, [getParent, onBeforeBack, onClose, view]);

  const isRootView = getParent(view) === 'close';

  return {
    back,
    isRootView,
    scrollRef,
    setView,
    view,
  };
}
