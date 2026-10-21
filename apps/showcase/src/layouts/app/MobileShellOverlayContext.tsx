import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface MobileShellOverlayContextValue {
  isOverlayOpen: boolean;
  setOverlayOpen: (open: boolean) => void;
}

const MobileShellOverlayContext =
  createContext<MobileShellOverlayContextValue | null>(null);

export function MobileShellOverlayProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [overlayLockCount, setOverlayLockCount] = useState(0);

  const setOverlayOpen = useCallback((open: boolean) => {
    setOverlayLockCount((current) => {
      if (open) {
        return current + 1;
      }

      return Math.max(0, current - 1);
    });
  }, []);

  const value = useMemo<MobileShellOverlayContextValue>(
    () => ({
      isOverlayOpen: overlayLockCount > 0,
      setOverlayOpen,
    }),
    [overlayLockCount, setOverlayOpen],
  );

  return (
    <MobileShellOverlayContext.Provider value={value}>
      {children}
    </MobileShellOverlayContext.Provider>
  );
}

export function useMobileShellOverlay() {
  const context = useContext(MobileShellOverlayContext);

  if (context === null) {
    throw new Error(
      'useMobileShellOverlay must be used within MobileShellOverlayProvider',
    );
  }

  return context;
}

export function useMobileShellOverlayLock(active: boolean) {
  const context = useContext(MobileShellOverlayContext);

  useEffect(() => {
    if (!active || context === null) {
      return undefined;
    }

    context.setOverlayOpen(true);

    return () => {
      context.setOverlayOpen(false);
    };
  }, [active, context]);
}
