import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import {
  ROOM_MAX_MEMBERS_DEFAULT,
  type BannerPresetId,
  type ExternalLinkInput,
  type Room,
} from '@towelbooks/schemas';
import { useMemo, useState } from 'react';
import { useController, useForm, useWatch } from 'react-hook-form';

import type { AppearanceSection } from '../../../components/appearance/AppearanceEditSheet';

import { useRoomSettingsContext } from './roomSettingsContext';
import { RoomSettingsDetailsForm } from './RoomSettingsDetailsForm';
import { useRoomSettingsAvatarDraft } from './useRoomSettingsAvatarDraft';
import { useRoomSettingsBannerDraft } from './useRoomSettingsBannerDraft';
import { useRoomUpdateMutation } from './useRoomSettingsMutations';
import { useToast } from '../../../components/feedback';
import {
  areExternalLinkInputsEqual,
  ExternalLinksEditor,
  toExternalLinkInputs,
} from '../../../features/external-links';
import {
  createUpdateRoomSchema,
  type UpdateRoomForm,
  type UpdateRoomFormInput,
} from '../../../features/rooms/roomCopy';
import { useI18n } from '../../../i18n';
import { SettingsSectionPageHeader } from '../../settings/ui/SettingsSectionPageHeader';
import { canReviewRoomJoinRequests } from '../../../features/rooms/join/canReviewRoomJoinRequests';
import { RoomJoinRequestsSection } from '../../../features/rooms/join/RoomJoinRequestsSection';
import { RoomSettingsModeratorPermissionsSection } from './RoomSettingsModeratorPermissionsSection';
import { sdk } from '../../../lib/sdk';

export function RoomSettingsGeneralPage() {
  const { room, roomId } = useRoomSettingsContext();
  const { locale, t } = useI18n();
  const { pushToast } = useToast();
  const schema = createUpdateRoomSchema(t);
  const taxonomyQuery = useQuery({
    queryKey: ['catalog', 'taxonomy', 'active', locale],
    queryFn: () => sdk.catalog.listTaxonomyCategories(),
    staleTime: 5 * 60 * 1000,
  });
  const [serverError, setServerError] = useState<string | null>(null);
  const [linksError, setLinksError] = useState<string | null>(null);
  const [linksDraft, setLinksDraft] = useState<ExternalLinkInput[]>(() =>
    toExternalLinkInputs(room.links),
  );
  const [linksBaseline, setLinksBaseline] = useState<ExternalLinkInput[]>(() =>
    toExternalLinkInputs(room.links),
  );

  const formValues: UpdateRoomFormInput = {
    name: room.name,
    description: room.description ?? '',
    bannerPresetId: room.bannerPresetId,
    visibility: room.visibility,
    joinPolicy: room.joinPolicy,
    categoryIds: room.categories.map((category) => category.id),
    maxMembers: room.maxMembers ?? ROOM_MAX_MEMBERS_DEFAULT,
  };

  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<UpdateRoomFormInput, undefined, UpdateRoomForm>({
    resolver: zodResolver(schema),
    defaultValues: formValues,
    mode: 'onChange',
  });
  const { field: categoryField } = useController({
    control,
    name: 'categoryIds',
  });

  const categoryOptions = useMemo(() => {
    const options = new Map(
      (taxonomyQuery.data?.categories ?? []).map((category) => [
        category.id,
        category,
      ]),
    );

    for (const category of room.categories) {
      if (!options.has(category.id)) {
        options.set(category.id, { ...category, parentSlug: null });
      }
    }

    return [...options.values()];
  }, [room.categories, taxonomyQuery.data]);

  const watchedBannerPresetId = useWatch({
    control,
    name: 'bannerPresetId',
  }) as BannerPresetId | undefined;
  const visibilityValue = (useWatch({
    control,
    name: 'visibility',
  }) ?? room.visibility) as UpdateRoomForm['visibility'];
  const joinPolicyValue = (useWatch({
    control,
    name: 'joinPolicy',
  }) ?? room.joinPolicy) as UpdateRoomForm['joinPolicy'];
  const bannerPresetId = watchedBannerPresetId ?? room.bannerPresetId;
  const descriptionValue = useWatch({ control, name: 'description' }) ?? '';

  const hasBannerPresetChanged = bannerPresetId !== room.bannerPresetId;
  const hasVisibilityChanged = visibilityValue !== room.visibility;
  const hasJoinPolicyChanged = joinPolicyValue !== room.joinPolicy;
  const hasCategoriesChanged = !haveSameIds(
    categoryField.value,
    room.categories.map((category) => category.id),
  );
  const hasLinksChanged = useMemo(
    () => !areExternalLinkInputsEqual(linksDraft, linksBaseline),
    [linksBaseline, linksDraft],
  );
  const {
    avatarBackgroundDraft,
    avatarSelection,
    hasAvatarBackgroundChanged,
    handleAvatarSelect,
    previewAvatar,
    resetAvatarDrafts,
  } = useRoomSettingsAvatarDraft(room);
  const {
    availableBannerImageUrl,
    availableBannerImageUrls,
    bannerActiveSource,
    bannerSelection,
    handleBannerActivatePreset,
    handleBannerRemove,
    handleBannerSelect,
    handleBannerSelectCustom,
    previewBannerImageUrl,
    previewBannerImageUrls,
    resetBannerDraft,
  } = useRoomSettingsBannerDraft(room);

  const [appearanceSheet, setAppearanceSheet] =
    useState<AppearanceSection | null>(null);

  const { onSubmit, updateMutation } = useRoomUpdateMutation({
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
    onUpdated: (updated: Room) => {
      resetAvatarDrafts();
      resetBannerDraft();
      reset({
        name: updated.name,
        description: updated.description ?? '',
        bannerPresetId: updated.bannerPresetId,
        visibility: updated.visibility,
        joinPolicy: updated.joinPolicy,
        categoryIds: updated.categories.map((category) => category.id),
        maxMembers: updated.maxMembers ?? ROOM_MAX_MEMBERS_DEFAULT,
      });
      setLinksBaseline(linksDraft);
      setLinksError(null);
      pushToast({
        variant: 'success',
        title: t('rooms.settings.general.saved'),
      });
    },
    onLinksError: () => {
      setLinksError(
        t('errors.unexpected.body', {
          fallback: 'Something went wrong. Try again.',
        }),
      );
    },
    setError,
    setServerError,
    t,
  });

  const canReviewJoinRequests = canReviewRoomJoinRequests(room.viewer);

  return (
    <div className="space-y-8">
      <SettingsSectionPageHeader
        title={t('rooms.settings.general.title')}
        description={t('rooms.settings.general.description')}
      />

      <RoomSettingsDetailsForm
        appearanceSheet={appearanceSheet}
        bannerPresetId={bannerPresetId}
        bannerImageUrl={previewBannerImageUrl}
        bannerImageUrls={previewBannerImageUrls}
        bannerAvailableImageUrl={availableBannerImageUrl}
        bannerAvailableImageUrls={availableBannerImageUrls}
        bannerActiveSource={bannerActiveSource}
        roomId={roomId}
        roomName={room.name}
        categoryError={errors.categoryIds?.message}
        categoryIds={categoryField.value}
        categoryOptions={categoryOptions}
        categoryOptionsError={taxonomyQuery.isError}
        categoryOptionsLoading={taxonomyQuery.isLoading}
        descriptionValue={descriptionValue}
        visibilityValue={visibilityValue}
        joinPolicyValue={joinPolicyValue}
        errors={errors}
        hasPendingAvatarChange={
          avatarSelection !== null || hasAvatarBackgroundChanged
        }
        hasPendingBannerChange={bannerSelection !== null}
        hasPendingLinksChange={hasLinksChanged}
        handleSubmit={handleSubmit}
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        isUpdatePending={updateMutation.isPending}
        linksSection={
          <ExternalLinksEditor
            initialLinks={room.links}
            serverError={linksError}
            onChange={(links) => {
              setLinksDraft(links);
              setLinksError(null);
            }}
          />
        }
        onAvatarSelectFile={handleAvatarSelect}
        onCategoryIdsChange={(categoryIds) =>
          categoryField.onChange(categoryIds)
        }
        onBannerPresetChange={(nextValue) => {
          setValue('bannerPresetId', nextValue, { shouldDirty: true });
          handleBannerActivatePreset();
          setAppearanceSheet(null);
        }}
        onBannerRemove={handleBannerRemove}
        onBannerSelectCustom={handleBannerSelectCustom}
        onBannerSelectFile={handleBannerSelect}
        onEditBanner={() => setAppearanceSheet('banner')}
        onCloseAppearanceSheet={() => setAppearanceSheet(null)}
        onRetryCategoryOptions={() => void taxonomyQuery.refetch()}
        onVisibilityChange={(nextValue) => {
          setValue('visibility', nextValue, { shouldDirty: true });
          if (nextValue === 'private') {
            setValue('joinPolicy', 'invite_only', { shouldDirty: true });
          }
        }}
        onJoinPolicyChange={(nextValue) => {
          setValue('joinPolicy', nextValue, { shouldDirty: true });
        }}
        onSubmit={async (data) => {
          setLinksError(null);
          await onSubmit(data);
        }}
        previewAvatar={previewAvatar ?? room.avatar}
        register={register}
        setValue={setValue}
        serverError={serverError}
      />

      {room.visibility === 'public' && room.joinPolicy === 'request_to_join' ? (
        <RoomSettingsModeratorPermissionsSection roomId={roomId} />
      ) : null}

      {canReviewJoinRequests && room.joinPolicy === 'request_to_join' ? (
        <section className="space-y-4">
          <SettingsSectionPageHeader
            title={t('rooms.joinRequests.title')}
            description={t('rooms.joinRequests.description')}
          />
          <RoomJoinRequestsSection roomId={roomId} />
        </section>
      ) : null}
    </div>
  );
}

function haveSameIds(left: readonly string[], right: readonly string[]) {
  if (left.length !== right.length) {
    return false;
  }

  const rightIds = new Set(right);
  return left.every((id) => rightIds.has(id));
}
