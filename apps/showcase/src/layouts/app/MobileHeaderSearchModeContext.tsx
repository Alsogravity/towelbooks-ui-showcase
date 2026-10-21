import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

const MobileHeaderSearchModeContext = createContext(false);

const MobileHeaderSearchModeSetterContext = createContext<
  ((isOpen: boolean) => void) | null
>(null);

export function MobileHeaderSearchModeProvider({
  children,
  initialIsOpen = false,
}: {
  children: ReactNode;
  initialIsOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);

  return (
    <MobileHeaderSearchModeSetterContext.Provider value={setIsOpen}>
      <MobileHeaderSearchModeContext.Provider value={isOpen}>
        {children}
      </MobileHeaderSearchModeContext.Provider>
    </MobileHeaderSearchModeSetterContext.Provider>
  );
}

export function useMobileHeaderSearchMode() {
  return useContext(MobileHeaderSearchModeContext);
}

export function useSyncMobileHeaderSearchMode(isOpen: boolean) {
  const setIsOpen = useContext(MobileHeaderSearchModeSetterContext);

  useEffect(() => {
    if (setIsOpen === null) {
      return;
    }

    setIsOpen(isOpen);

    return () => {
      setIsOpen(false);
    };
  }, [isOpen, setIsOpen]);
}
