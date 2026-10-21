import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type UpdateRoomRoleCapabilitiesRequest } from '@towelbooks/schemas';

import { sdk } from '../../../lib/sdk';

export function roomRoleCapabilitiesQueryKey(roomId: string) {
  return ['rooms', roomId, 'role-capabilities'] as const;
}

export function useRoomRoleCapabilities(
  roomId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    enabled: options?.enabled ?? true,
    queryFn: () => sdk.rooms.getRoleCapabilities(roomId),
    queryKey: roomRoleCapabilitiesQueryKey(roomId),
  });
}

export function useUpdateRoomRoleCapabilities(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateRoomRoleCapabilitiesRequest) =>
      sdk.rooms.updateRoleCapabilities(roomId, body),
    onSuccess: async (updated) => {
      queryClient.setQueryData(roomRoleCapabilitiesQueryKey(roomId), updated);
      await queryClient.invalidateQueries({
        queryKey: ['rooms', roomId, 'overview'],
      });
    },
  });
}
