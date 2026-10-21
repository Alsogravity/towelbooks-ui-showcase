import { createContext, useContext, type ReactNode } from 'react';

import type { SettingsRouteKey } from './settingsHash';

export type SettingsPresentation = 'modal' | 'panel';

export type SettingsShellContextValue = {
  close: () => void;
  goTo: (route: SettingsRouteKey) => void;
  presentation: SettingsPresentation;
};

const SettingsShellContext = createContext<SettingsShellContextValue | null>(
  null,
);

export function SettingsShellProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: SettingsShellContextValue;
}) {
  return (
    <SettingsShellContext.Provider value={value}>
      {children}
    </SettingsShellContext.Provider>
  );
}

export function useSettingsShell() {
  const context = useContext(SettingsShellContext);

  if (context === null) {
    throw new Error(
      'useSettingsShell must be used within SettingsShellProvider',
    );
  }

  return context;
}

export function useOptionalSettingsShell() {
  return useContext(SettingsShellContext);
}
