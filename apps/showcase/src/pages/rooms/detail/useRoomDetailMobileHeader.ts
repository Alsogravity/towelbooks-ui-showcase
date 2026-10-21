import { useEffect } from 'react';

import { useRegisterRoomDetailMobileHeaderLeadingAction } from '../../../features/rooms/detail/RoomDetailMobileHeaderLeadingActionContext';

type UseRoomDetailMobileHeaderOptions = {
  hasMemberRoomAccess: boolean;
  leaveActionLabel: string;
  onLeaveOpen: () => void;
};

export function useRoomDetailMobileHeader({
  hasMemberRoomAccess,
  leaveActionLabel,
  onLeaveOpen,
}: UseRoomDetailMobileHeaderOptions) {
  const registerRoomDetailLeadingAction =
    useRegisterRoomDetailMobileHeaderLeadingAction();

  useEffect(() => {
    if (!hasMemberRoomAccess) {
      registerRoomDetailLeadingAction(null);
      return;
    }

    registerRoomDetailLeadingAction({
      ariaLabel: leaveActionLabel,
      iconName: 'log-out',
      onClick: onLeaveOpen,
    });

    return () => registerRoomDetailLeadingAction(null);
  }, [
    hasMemberRoomAccess,
    leaveActionLabel,
    onLeaveOpen,
    registerRoomDetailLeadingAction,
  ]);
}
