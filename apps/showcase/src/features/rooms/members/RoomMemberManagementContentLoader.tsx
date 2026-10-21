import { useQuery } from '@tanstack/react-query';

import { sdk } from '../../../lib/sdk';

import { RoomMemberManagementContent } from './RoomMemberManagementContent';

import type { RoomMember } from '../types';

type RoomMemberManagementContentLoaderProps = {
  member: RoomMember;
  onClose: () => void;
  onOwnershipTransferred?: () => void;
  onViewAccess?: () => void;
  onViewManagementHistory?: () => void;
  roomId: string;
};

export function RoomMemberManagementContentLoader({
  member,
  onClose,
  onOwnershipTransferred,
  onViewAccess,
  onViewManagementHistory,
  roomId,
}: RoomMemberManagementContentLoaderProps) {
  const detailsQuery = useQuery({
    queryKey: ['rooms', roomId, 'members', member.id, 'management'],
    queryFn: () => sdk.rooms.getMemberManagementDetail(roomId, member.id),
  });

  return (
    <RoomMemberManagementContent
      detail={detailsQuery.data}
      error={detailsQuery.error}
      initialAction="manage"
      isLoading={detailsQuery.isLoading}
      member={member}
      onClose={onClose}
      onOwnershipTransferred={onOwnershipTransferred}
      onRetry={() => void detailsQuery.refetch()}
      onViewAccess={onViewAccess}
      onViewManagementHistory={onViewManagementHistory}
      roomId={roomId}
    />
  );
}
