import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import type { RoomAnnouncement } from '@towelbooks/schemas';
import { sdk } from '../../../../lib/sdk';

export function getAnnouncementsKey(roomId: string) {
  return ['rooms', roomId, 'announcements'] as const;
}

export function useRoomAnnouncementsTabState(roomId: string) {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<RoomAnnouncement | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<RoomAnnouncement | null>(
    null,
  );
  const [titleDraft, setTitleDraft] = useState('');
  const [bodyDraft, setBodyDraft] = useState('');

  const announcementsQuery = useQuery({
    queryKey: getAnnouncementsKey(roomId),
    queryFn: () => sdk.rooms.listAnnouncements(roomId),
  });

  const invalidateAnnouncements = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getAnnouncementsKey(roomId) }),
      queryClient.invalidateQueries({
        queryKey: ['rooms', roomId, 'activity-events'],
      }),
    ]);
  };

  const resetDraft = () => {
    setTitleDraft('');
    setBodyDraft('');
  };

  const createMutation = useMutation({
    mutationFn: () => {
      const title = titleDraft.trim();
      return sdk.rooms.createAnnouncement(roomId, {
        body: bodyDraft.trim(),
        ...(title ? { title } : {}),
      });
    },
    onSuccess: async () => {
      setIsCreateOpen(false);
      resetDraft();
      await invalidateAnnouncements();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      const title = titleDraft.trim();
      return sdk.rooms.updateAnnouncement(roomId, editingAnnouncement!.id, {
        body: bodyDraft.trim(),
        title: title ? title : null,
      });
    },
    onSuccess: async () => {
      setEditingAnnouncement(null);
      resetDraft();
      await invalidateAnnouncements();
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => sdk.rooms.archiveAnnouncement(roomId, archiveTarget!.id),
    onSuccess: async () => {
      setArchiveTarget(null);
      await invalidateAnnouncements();
    },
  });

  const openCreate = () => {
    resetDraft();
    setIsCreateOpen(true);
  };

  const openEdit = (announcement: RoomAnnouncement) => {
    setEditingAnnouncement(announcement);
    setTitleDraft(announcement.title ?? '');
    setBodyDraft(announcement.body);
  };

  return {
    announcements: announcementsQuery.data?.items ?? [],
    announcementsQuery,
    archiveMutation,
    archiveTarget,
    bodyDraft,
    createMutation,
    editingAnnouncement,
    isBodyEmpty: bodyDraft.trim().length === 0,
    isCreateOpen,
    mutationError:
      createMutation.error ?? updateMutation.error ?? archiveMutation.error,
    openCreate,
    openEdit,
    setArchiveTarget,
    setBodyDraft,
    setEditingAnnouncement,
    setIsCreateOpen,
    setTitleDraft,
    titleDraft,
    updateMutation,
  };
}
