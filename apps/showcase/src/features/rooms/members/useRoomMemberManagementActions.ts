import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';

import type { RoomMember, RoomMemberManagementDetail } from '../types';

type UseRoomMemberManagementActionsOptions = {
  memberId: string;
  onMemberRemoved?: () => void;
  onOwnershipTransferred?: () => void;
  roomId: string;
};

export function useRoomMemberManagementActions({
  memberId,
  onMemberRemoved,
  onOwnershipTransferred,
  roomId,
}: UseRoomMemberManagementActionsOptions) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const managementQueryKey = [
    'rooms',
    roomId,
    'members',
    memberId,
    'management',
  ];

  const syncManagementDetail = (detail: RoomMemberManagementDetail) => {
    queryClient.setQueryData(managementQueryKey, detail);
  };

  const invalidateManagementQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['rooms', roomId] }),
      queryClient.invalidateQueries({
        queryKey: ['rooms', roomId, 'overview'],
      }),
      queryClient.invalidateQueries({ queryKey: ['rooms', roomId, 'members'] }),
      queryClient.invalidateQueries({ queryKey: managementQueryKey }),
    ]);
  };

  const updateRoleMutation = useMutation({
    mutationFn: (input: { role: RoomMember['role'] }) =>
      sdk.rooms.updateMemberRole(roomId, memberId, {
        role: input.role,
      }),
    onSuccess: async (detail) => {
      setError(null);
      syncManagementDetail(detail);
      await invalidateManagementQueries();
    },
    onError: () => setError(t('rooms.members.management.role.error')),
  });

  const setManualAccessMutation = useMutation({
    mutationFn: (input: { expiresAt: string | null }) =>
      sdk.rooms.setMemberManualAccess(roomId, memberId, {
        expiresAt: input.expiresAt,
      }),
    onSuccess: async (detail) => {
      setError(null);
      syncManagementDetail(detail);
      await invalidateManagementQueries();
    },
    onError: () => setError(t('rooms.members.access.error.setManualAccess')),
  });

  const restoreManualAccessMutation = useMutation({
    mutationFn: (input: { expiresAt: string | null }) =>
      sdk.rooms.restoreMemberManualAccess(roomId, memberId, {
        expiresAt: input.expiresAt,
      }),
    onSuccess: async (detail) => {
      setError(null);
      syncManagementDetail(detail);
      await invalidateManagementQueries();
    },
    onError: () =>
      setError(t('rooms.members.access.error.restoreManualAccess')),
  });

  const revokeManualAccessMutation = useMutation({
    mutationFn: () => sdk.rooms.revokeMemberManualAccess(roomId, memberId, {}),
    onSuccess: async (detail) => {
      setError(null);
      syncManagementDetail(detail);
      await invalidateManagementQueries();
    },
    onError: () => setError(t('rooms.members.access.error.revokeManualAccess')),
  });

  const suspendMemberMutation = useMutation({
    mutationFn: () => sdk.rooms.suspendMember(roomId, memberId, {}),
    onSuccess: async (detail) => {
      setError(null);
      syncManagementDetail(detail);
      await invalidateManagementQueries();
    },
    onError: () => setError(t('rooms.members.suspend.error')),
  });

  const unsuspendMemberMutation = useMutation({
    mutationFn: () => sdk.rooms.unsuspendMember(roomId, memberId, {}),
    onSuccess: async (detail) => {
      setError(null);
      syncManagementDetail(detail);
      await invalidateManagementQueries();
    },
    onError: () => setError(t('rooms.members.unsuspend.error')),
  });

  const revokeInviteAccessMutation = useMutation({
    mutationFn: () => sdk.rooms.revokeMemberInviteAccess(roomId, memberId, {}),
    onSuccess: async (detail) => {
      setError(null);
      syncManagementDetail(detail);
      await invalidateManagementQueries();
    },
    onError: () => setError(t('rooms.members.access.error.revokeInviteAccess')),
  });

  const restoreInviteAccessMutation = useMutation({
    mutationFn: () => sdk.rooms.restoreMemberInviteAccess(roomId, memberId, {}),
    onSuccess: async (detail) => {
      setError(null);
      syncManagementDetail(detail);
      await invalidateManagementQueries();
    },
    onError: () =>
      setError(t('rooms.members.access.error.restoreInviteAccess')),
  });

  const removeMemberMutation = useMutation({
    mutationFn: () => sdk.rooms.removeMember(roomId, memberId, {}),
    onSuccess: async () => {
      setError(null);
      await invalidateManagementQueries();
      onMemberRemoved?.();
    },
    onError: () => setError(t('rooms.members.remove.error')),
  });

  const transferOwnershipMutation = useMutation({
    mutationFn: () => sdk.rooms.transferOwnership(roomId, memberId),
    onSuccess: async (detail) => {
      setError(null);
      syncManagementDetail(detail);
      await invalidateManagementQueries();
      onOwnershipTransferred?.();
    },
    onError: () => setError(t('rooms.members.management.ownership.error')),
  });

  return {
    clearError: () => setError(null),
    error,
    removeMemberMutation,
    restoreInviteAccessMutation,
    restoreManualAccessMutation,
    revokeInviteAccessMutation,
    revokeManualAccessMutation,
    setManualAccessMutation,
    suspendMemberMutation,
    transferOwnershipMutation,
    unsuspendMemberMutation,
    updateRoleMutation,
  };
}
