import { buildAvatar, deriveAvatarForeground } from '@towelbooks/schemas';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { RoomDetail } from '../../../features/rooms/types';

export type AvatarSelection =
  | {
      file: File;
      kind: 'pending-upload';
      previewUrl: string;
    }
  | {
      kind: 'pending-remove';
    };

export function useRoomSettingsAvatarDraft(room?: RoomDetail) {
  const [avatarBackgroundDraftState, setAvatarBackgroundDraftState] = useState<{
    roomId: string | null;
    value: string | null;
  }>({
    roomId: null,
    value: null,
  });
  const [avatarSelection, setAvatarSelection] =
    useState<AvatarSelection | null>(null);

  const avatarBackgroundDraft =
    room && avatarBackgroundDraftState.roomId === room.id
      ? avatarBackgroundDraftState.value
      : null;
  const setAvatarBackgroundDraft = useCallback(
    (value: string | null) => {
      setAvatarBackgroundDraftState({ roomId: room?.id ?? null, value });
    },
    [room?.id],
  );

  const resolvedAvatarBackground =
    avatarBackgroundDraft ?? room?.avatar.background ?? '';
  const hasAvatarBackgroundChanged =
    room !== undefined &&
    avatarBackgroundDraft !== null &&
    avatarBackgroundDraft !== room.avatar.background;
  const baseHasAvatarImage = Boolean(room?.avatar.imageUrl);

  useEffect(() => {
    if (avatarSelection?.kind !== 'pending-upload') {
      return;
    }

    const { previewUrl } = avatarSelection;

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [avatarSelection]);

  const previewAvatar = useMemo(() => {
    if (!room) {
      return null;
    }

    const previewAvatarImageUrl =
      avatarSelection?.kind === 'pending-upload'
        ? avatarSelection.previewUrl
        : avatarSelection?.kind === 'pending-remove'
          ? null
          : room.avatar.imageUrl;

    return buildAvatar({
      avatarBackground: resolvedAvatarBackground,
      avatarForeground: deriveAvatarForeground(resolvedAvatarBackground),
      avatarImageUrl: previewAvatarImageUrl,
      displayName: room.name,
      username: room.slug,
    });
  }, [avatarSelection, room, resolvedAvatarBackground]);

  const handleAvatarSelect = useCallback((file: File, previewUrl: string) => {
    setAvatarSelection({ file, kind: 'pending-upload', previewUrl });
  }, []);

  const resetAvatarDrafts = useCallback(() => {
    setAvatarSelection(null);
    setAvatarBackgroundDraftState({ roomId: null, value: null });
  }, []);

  const handleAvatarRemove = useCallback(() => {
    if (!baseHasAvatarImage && avatarSelection?.kind !== 'pending-upload') {
      setAvatarSelection(null);
      return;
    }

    setAvatarSelection(baseHasAvatarImage ? { kind: 'pending-remove' } : null);
  }, [avatarSelection, baseHasAvatarImage]);

  return {
    avatarBackgroundDraft,
    avatarSelection,
    hasAvatarBackgroundChanged,
    handleAvatarRemove,
    handleAvatarSelect,
    previewAvatar,
    resetAvatarDrafts,
    resolvedAvatarBackground,
    setAvatarBackgroundDraft,
  };
}
