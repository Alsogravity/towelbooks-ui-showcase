import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type AvatarUploadContentType,
  type BannerUploadContentType,
  type ExternalLinkInput,
  type Room,
  type UpdateCommunitySettingsRequest,
  type UpdateRoomRequest,
} from '@towelbooks/schemas';
import { useCallback, useEffect } from 'react';

import { type ConfigurableActivityType } from './roomSettingsActivity';
import {
  type UpdateRoomForm,
  type UpdateRoomFormInput,
} from '../../../features/rooms/roomCopy';
import {
  applyApiValidationErrors,
  handleApiProblem,
} from '../../../features/errors';
import { sdk } from '../../../lib/sdk';

import type { BannerActiveSource } from '../../../features/banner-presets';
import type { RoomDetail } from '../../../features/rooms/types';
import type { AvatarSelection } from './useRoomSettingsAvatarDraft';
import type { BannerSelection } from './useRoomSettingsBannerDraft';
import type { UseFormSetError } from 'react-hook-form';
import type { Dispatch, SetStateAction } from 'react';
import type { useI18n } from '../../../i18n';

interface UseRoomUpdateMutationOptions {
  avatarBackgroundDraft: string | null;
  avatarSelection: AvatarSelection | null;
  bannerActiveSource: BannerActiveSource;
  bannerSelection: BannerSelection | null;
  roomId: string;
  hasAvatarBackgroundChanged: boolean;
  hasBannerPresetChanged: boolean;
  hasCategoriesChanged: boolean;
  hasLinksChanged: boolean;
  hasVisibilityChanged: boolean;
  hasJoinPolicyChanged: boolean;
  linksDraft: ExternalLinkInput[];
  onLinksError: () => void;
  onUpdated: (updated: Room) => void;
  setError: UseFormSetError<UpdateRoomFormInput>;
  setServerError: Dispatch<SetStateAction<string | null>>;
  t: ReturnType<typeof useI18n>['t'];
}

export function useRoomUpdateMutation({
  avatarBackgroundDraft,
  avatarSelection,
  bannerActiveSource,
  bannerSelection,
  roomId,
  hasAvatarBackgroundChanged,
  hasBannerPresetChanged,
  hasCategoriesChanged,
  hasLinksChanged,
  hasVisibilityChanged,
  hasJoinPolicyChanged,
  linksDraft,
  onLinksError,
  onUpdated,
  setError,
  setServerError,
  t,
}: UseRoomUpdateMutationOptions) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateRoomForm) => {
      const body: UpdateRoomRequest = {
        name: data.name,
        description: data.description ?? '',
        maxMembers: data.maxMembers ?? undefined,
      };

      if (hasBannerPresetChanged) {
        body.bannerPresetId = data.bannerPresetId;
      }

      if (hasVisibilityChanged) {
        body.visibility = data.visibility;
      }

      if (hasJoinPolicyChanged && data.joinPolicy) {
        body.joinPolicy = data.joinPolicy;
      }

      if (hasAvatarBackgroundChanged) {
        body.avatarBackground = avatarBackgroundDraft;
      }

      if (hasCategoriesChanged) {
        body.categoryIds = data.categoryIds;
      }

      const updatedRoom = await sdk.rooms.update(roomId, body);

      let nextRoom = updatedRoom;

      if (avatarSelection !== null) {
        const avatarResponse =
          avatarSelection.kind === 'pending-upload'
            ? await sdk.rooms.avatar.upload(roomId, avatarSelection.file, {
                contentType: avatarSelection.file
                  .type as AvatarUploadContentType,
                sizeBytes: avatarSelection.file.size,
              })
            : await sdk.rooms.avatar.clear(roomId);

        nextRoom = {
          ...nextRoom,
          avatar: avatarResponse.avatar,
        };
      }

      if (bannerSelection !== null) {
        // Upload only when custom is still active; remove only when staged via
        // Remove. Picking a preset does not clear a custom image.
        if (
          bannerSelection.kind === 'pending-upload' &&
          bannerActiveSource === 'custom'
        ) {
          const bannerResponse = await sdk.rooms.banner.upload(
            roomId,
            bannerSelection.file,
            {
              contentType: bannerSelection.file.type as BannerUploadContentType,
              sizeBytes: bannerSelection.file.size,
            },
          );

          nextRoom = {
            ...nextRoom,
            bannerImage: bannerResponse.bannerImage,
          };
        } else if (bannerSelection.kind === 'pending-remove') {
          const bannerResponse = await sdk.rooms.banner.clear(roomId);

          nextRoom = {
            ...nextRoom,
            bannerImage: bannerResponse.bannerImage,
          };
        }
      }

      if (hasLinksChanged) {
        const linksResponse = await sdk.rooms.replaceLinks(roomId, {
          links: linksDraft,
        });
        nextRoom = {
          ...nextRoom,
          links: linksResponse.links,
        };
      }

      return nextRoom;
    },
    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ['rooms', roomId],
        (currentRoom: RoomDetail | undefined) =>
          currentRoom
            ? { ...updated, viewer: currentRoom.viewer }
            : currentRoom,
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['rooms', roomId] }),
        queryClient.invalidateQueries({
          queryKey: ['rooms', roomId, 'overview'],
        }),
        queryClient.invalidateQueries({ queryKey: ['rooms', 'list'] }),
        queryClient.invalidateQueries({ queryKey: ['rooms', 'discover'] }),
      ]);
      onUpdated(updated);
    },
  });

  const onSubmit = useCallback(
    async (data: UpdateRoomForm) => {
      setServerError(null);

      try {
        await updateMutation.mutateAsync(data);
      } catch (error: unknown) {
        if (applyApiValidationErrors(error, setError) > 0) {
          return;
        }

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['rooms', roomId] }),
          queryClient.invalidateQueries({
            queryKey: ['rooms', roomId, 'overview'],
          }),
        ]);

        if (hasLinksChanged) {
          onLinksError();
        }

        setServerError(
          handleApiProblem(error, {
            fallbackKey: 'rooms.settings.error.submit',
            t,
          }).message,
        );
      }
    },
    [
      hasLinksChanged,
      onLinksError,
      roomId,
      queryClient,
      setError,
      setServerError,
      t,
      updateMutation,
    ],
  );

  return { onSubmit, updateMutation };
}

export function useRoomActivityPreferencesMutation(roomId: string) {
  const queryClient = useQueryClient();

  const updatePreferencesMutation = useMutation({
    mutationFn: (
      preferences: Array<{
        activityType: ConfigurableActivityType;
        visible: boolean;
      }>,
    ) =>
      sdk.activityEvents.updateRoomPreferences(roomId, {
        preferences,
      }),
    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ['rooms', roomId, 'activity-feed-preferences'],
        updated,
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['rooms', roomId, 'activity-events'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['rooms', roomId, 'activities'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['rooms', roomId, 'activity-feed-preferences'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['dashboard', 'room-activities'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['me', 'room-activities'],
        }),
      ]);
    },
  });

  useEffect(() => {
    if (updatePreferencesMutation.isSuccess) {
      updatePreferencesMutation.reset();
    }
  }, [updatePreferencesMutation]);

  const updatePreferences = useCallback(
    (
      preferences: Array<{
        activityType: ConfigurableActivityType;
        visible: boolean;
      }>,
    ) => updatePreferencesMutation.mutateAsync(preferences),
    [updatePreferencesMutation],
  );

  return { updatePreferences, updatePreferencesMutation };
}

export function useRoomCommunitySettingsMutation(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateCommunitySettingsRequest) =>
      sdk.community.updateSettings(roomId, body),
    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ['rooms', roomId, 'community', 'settings'],
        updated,
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['rooms', roomId, 'community', 'settings'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['rooms', roomId, 'discussions', 'discussions'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['rooms', roomId, 'polls', 'list'],
        }),
      ]);
    },
  });
}
