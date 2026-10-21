import { createContext, useContext, type ReactNode } from 'react';

import type { CapsuleActionTone, IconName } from '../primitives';

export type PageMobileHeaderAction = {
  ariaLabel: string;
  disabled?: boolean;
  iconName: IconName;
  onClick: () => void;
  tone?: CapsuleActionTone;
};

export type PageMobileHeaderActions = {
  leadingAction?: PageMobileHeaderAction | null;
  primaryAction?: PageMobileHeaderAction | null;
};

const defaultRegisterPageMobileHeaderAction = () => {};

const PageMobileHeaderActionContext = createContext<
  (actions: PageMobileHeaderActions | null) => void
>(defaultRegisterPageMobileHeaderAction);

export function PageMobileHeaderActionProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: (actions: PageMobileHeaderActions | null) => void;
}) {
  return (
    <PageMobileHeaderActionContext.Provider value={value}>
      {children}
    </PageMobileHeaderActionContext.Provider>
  );
}

export function useRegisterPageMobileHeaderAction() {
  return useContext(PageMobileHeaderActionContext);
}
