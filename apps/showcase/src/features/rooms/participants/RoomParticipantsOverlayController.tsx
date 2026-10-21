import { RoomParticipantsOverlay } from './RoomParticipantsOverlay';

type RoomParticipantsOverlayControllerProps = {
  canManageRoomOperations: boolean;
  canReviewJoinRequests: boolean;
  getReturnFocusElement: () => HTMLElement | null;
  onClose: () => void;
  roomId: string;
};

export function RoomParticipantsOverlayController({
  canManageRoomOperations,
  canReviewJoinRequests,
  getReturnFocusElement,
  onClose,
  roomId,
}: RoomParticipantsOverlayControllerProps) {
  return (
    <RoomParticipantsOverlay
      canManage={canManageRoomOperations}
      canReviewJoinRequests={canReviewJoinRequests}
      getReturnFocusElement={getReturnFocusElement}
      onClose={onClose}
      roomId={roomId}
    />
  );
}
