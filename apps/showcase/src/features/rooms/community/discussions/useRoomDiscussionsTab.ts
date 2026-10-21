import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { sdk } from '../../../../lib/sdk';

import {
  getRoomActivityEventsKey,
  getViewerRoomActivityEventsKey,
  getDiscussionKey,
  getDiscussionListKey,
} from './discussionQueryKeys';

import type {
  RoomDiscussionsViewProps,
  DeleteTarget,
  DiscussionModerationAction,
} from './discussionTypes';

export function useRoomDiscussionsTab({
  roomId,
  communitySettings,
  discussions: discussionsData,
  isLoadingDiscussions,
  selectedDiscussionId,
  onSelectDiscussion,
}: RoomDiscussionsViewProps) {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createBody, setCreateBody] = useState('');
  const [discussionTitleDraft, setDiscussionTitleDraft] = useState('');
  const [discussionBodyDraft, setDiscussionBodyDraft] = useState('');
  const [isEditDiscussionDialogOpen, setIsEditDiscussionDialogOpen] =
    useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const discussions = useMemo(
    () => discussionsData?.items ?? [],
    [discussionsData?.items],
  );
  const selectedDiscussionFromList =
    discussions.find((discussion) => discussion.id === selectedDiscussionId) ??
    null;

  const discussionQuery = useQuery({
    queryKey: selectedDiscussionId
      ? getDiscussionKey(roomId, selectedDiscussionId)
      : [],
    queryFn: () => sdk.discussions.getDiscussion(roomId, selectedDiscussionId!),
    enabled: Boolean(selectedDiscussionId),
    initialData: selectedDiscussionFromList ?? undefined,
  });

  const selectedDiscussion = discussionQuery.data ?? selectedDiscussionFromList;

  const refreshDiscussion = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getDiscussionListKey(roomId),
      }),
      selectedDiscussionId
        ? queryClient.invalidateQueries({
            queryKey: getDiscussionKey(roomId, selectedDiscussionId),
          })
        : Promise.resolve(),
      queryClient.invalidateQueries({
        queryKey: getRoomActivityEventsKey(roomId),
      }),
    ]);
  };

  const createDiscussionMutation = useMutation({
    mutationFn: () =>
      sdk.discussions.createDiscussion(roomId, {
        body: createBody.trim(),
        title: createTitle.trim(),
      }),
    onSuccess: async (createdDiscussion) => {
      setCreateTitle('');
      setCreateBody('');
      setIsCreateDialogOpen(false);
      onSelectDiscussion(createdDiscussion.id);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getDiscussionListKey(roomId),
        }),
        queryClient.invalidateQueries({
          queryKey: getRoomActivityEventsKey(roomId),
        }),
        queryClient.invalidateQueries({
          queryKey: getViewerRoomActivityEventsKey(),
        }),
      ]);
    },
  });

  const updateDiscussionMutation = useMutation({
    mutationFn: () =>
      sdk.discussions.updateDiscussion(roomId, selectedDiscussionId!, {
        body: discussionBodyDraft.trim(),
        title: discussionTitleDraft.trim(),
      }),
    onSuccess: async () => {
      setIsEditDiscussionDialogOpen(false);
      await refreshDiscussion();
    },
  });

  const moderateDiscussionMutation = useMutation({
    mutationFn: async (action: DiscussionModerationAction) => {
      if (!selectedDiscussionId) {
        throw new Error('Missing discussion id.');
      }

      switch (action) {
        case 'pin':
          return sdk.discussions.pinDiscussion(roomId, selectedDiscussionId);
        case 'unpin':
          return sdk.discussions.unpinDiscussion(roomId, selectedDiscussionId);
        case 'lock':
          return sdk.discussions.lockDiscussion(roomId, selectedDiscussionId);
        case 'unlock':
          return sdk.discussions.unlockDiscussion(roomId, selectedDiscussionId);
      }
    },
    onSuccess: refreshDiscussion,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteTarget) {
        throw new Error('Missing discussion target.');
      }

      return sdk.discussions.deleteDiscussion(roomId, deleteTarget.id);
    },
    onSuccess: async () => {
      setDeleteTarget(null);
      onSelectDiscussion(null);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getDiscussionListKey(roomId),
        }),
        queryClient.invalidateQueries({
          queryKey: getRoomActivityEventsKey(roomId),
        }),
        queryClient.invalidateQueries({
          queryKey: getViewerRoomActivityEventsKey(),
        }),
      ]);
    },
  });

  const combinedMutationError = useMemo(
    () =>
      createDiscussionMutation.error ??
      updateDiscussionMutation.error ??
      moderateDiscussionMutation.error ??
      deleteMutation.error,
    [
      createDiscussionMutation.error,
      deleteMutation.error,
      moderateDiscussionMutation.error,
      updateDiscussionMutation.error,
    ],
  );

  const openEditDiscussionDialog = () => {
    if (!selectedDiscussion) {
      return;
    }

    setDiscussionTitleDraft(selectedDiscussion.title);
    setDiscussionBodyDraft(selectedDiscussion.body);
    setIsEditDiscussionDialogOpen(true);
  };

  return {
    combinedMutationError,
    createBody,
    createDiscussionMutation,
    createTitle,
    deleteMutation,
    deleteTarget,
    discussionBodyDraft,
    discussionQuery,
    discussions,
    communitySettings,
    discussionTitleDraft,
    isCreateDialogOpen,
    isEditDiscussionDialogOpen,
    isLoadingDiscussions,
    moderateDiscussionMutation,
    onInteractionChange: refreshDiscussion,
    onSelectDiscussion,
    openEditDiscussionDialog,
    selectedDiscussion,
    setCreateBody,
    setCreateTitle,
    setDeleteTarget,
    setDiscussionBodyDraft,
    setDiscussionTitleDraft,
    setIsCreateDialogOpen,
    setIsEditDiscussionDialogOpen,
    updateDiscussionMutation,
  };
}
