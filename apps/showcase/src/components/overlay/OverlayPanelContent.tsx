import { forwardRef, type ReactNode } from 'react';

import { overlayPanelContentClassName } from './overlayPanelStyles';

export type OverlayPanelContentProps = {
  children: ReactNode;
  className?: string;
};

export const OverlayPanelContent = forwardRef<
  HTMLDivElement,
  OverlayPanelContentProps
>(function OverlayPanelContent({ children, className }, ref) {
  return (
    <div
      ref={ref}
      className={[overlayPanelContentClassName, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
});
