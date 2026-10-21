import { createContext, useContext, type ReactNode } from 'react';

import type { IconName } from '../../../components/primitives';

export type RoomDetailMobileHeaderLeadingAction = {
  ariaLabel: string;
  className?: string;
  iconName: IconName;
  onClick: () => void;
};

const defaultRegisterLeadingAction = () => {};

const RoomDetailMobileHeaderLeadingActionContext = createContext<
  (action: RoomDetailMobileHeaderLeadingAction | null) => void
>(defaultRegisterLeadingAction);

export function RoomDetailMobileHeaderLeadingActionProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: (action: RoomDetailMobileHeaderLeadingAction | null) => void;
}) {
  return (
    <RoomDetailMobileHeaderLeadingActionContext.Provider value={value}>
      {children}
    </RoomDetailMobileHeaderLeadingActionContext.Provider>
  );
}

export function useRegisterRoomDetailMobileHeaderLeadingAction() {
  return useContext(RoomDetailMobileHeaderLeadingActionContext);
}
