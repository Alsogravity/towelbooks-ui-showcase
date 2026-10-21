import {
  type Avatar,
  type BannerImageUrls,
  type BannerPresetId,
  type CatalogTaxonomyCategoryOption,
  ROOM_DESCRIPTION_MAX_LENGTH,
  ROOM_MAX_MEMBERS_ABSOLUTE_MAX,
  ROOM_NAME_MAX_LENGTH,
} from '@towelbooks/schemas';
import {
  useCallback,
  useMemo,
  useRef,
  type ChangeEvent,
  type ReactNode,
} from 'react';

import {
  AppearanceEditSheet,
  type AppearanceSection,
} from '../../../components/appearance/AppearanceEditSheet';
import { AppearancePreview } from '../../../components/appearance/AppearancePreview';
import type { BannerActiveSource } from '../../../features/banner-presets';
import {
  Alert,
  Button,
  ButtonLink,
  EmojiInsertBar,
  FormField,
  FormSection,
  Input,
  Textarea,
} from '../../../components/primitives';
// TODO: Reintroduce after avatar color picker is restored (MVP uses only initial color)
// import { AvatarColorPicker } from '../../../components/profile/appearance/AvatarColorPicker';
import { validateAvatarFile } from '../../../features/profile/avatarUpload';
import {
  type UpdateRoomForm,
  type UpdateRoomFormInput,
} from '../../../features/rooms/roomCopy';
import { RoomVisibilityField } from '../../../features/rooms/ui/RoomVisibilityField';
import { RoomJoinPolicyField } from '../../../features/rooms/ui/RoomJoinPolicyField';
import { RoomCategoriesField } from '../../../features/rooms/ui/RoomCategoriesField';
import { useToast } from '../../../components/feedback';
import { createBasicEmojiLabelGetter } from '../../../i18n/emojiLabels';
import { useI18n } from '../../../i18n';

import type {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';

export function RoomSettingsDetailsForm({
  roomId,
  roomName,
  categoryError,
  categoryIds,
  categoryOptions,
  categoryOptionsError,
  categoryOptionsLoading,
  descriptionValue,
  visibilityValue,
  joinPolicyValue,
  errors,
  hasPendingAvatarChange,
  hasPendingBannerChange = false,
  hasPendingLinksChange = false,
  appearanceSheet,
  handleSubmit,
  isDirty,
  isSubmitting,
  isUpdatePending,
  onAvatarSelectFile,
  onCategoryIdsChange,
  onSubmit,
  onBannerPresetChange,
  onBannerRemove,
  onBannerSelectCustom,
  onBannerSelectFile,
  onEditBanner,
  onCloseAppearanceSheet,
  onRetryCategoryOptions,
  onVisibilityChange,
  onJoinPolicyChange,
  previewAvatar,
  register,
  setValue,
  bannerPresetId,
  bannerImageUrl,
  bannerImageUrls = null,
  bannerAvailableImageUrl,
  bannerAvailableImageUrls = null,
  bannerActiveSource,
  linksSection,
  serverError,
}: {
  roomId: string;
  bannerPresetId: BannerPresetId;
  bannerImageUrl: string | null;
  bannerImageUrls?: BannerImageUrls | null;
  bannerAvailableImageUrl: string | null;
  bannerAvailableImageUrls?: BannerImageUrls | null;
  bannerActiveSource: BannerActiveSource;
  roomName: string;
  categoryError?: string;
  categoryIds: string[];
  categoryOptions: CatalogTaxonomyCategoryOption[];
  categoryOptionsError: boolean;
  categoryOptionsLoading: boolean;
  descriptionValue: string;
  visibilityValue: UpdateRoomForm['visibility'];
  joinPolicyValue: UpdateRoomForm['joinPolicy'];
  errors: FieldErrors<UpdateRoomFormInput>;
  hasPendingAvatarChange: boolean;
  hasPendingBannerChange?: boolean;
  hasPendingLinksChange?: boolean;
  appearanceSheet: AppearanceSection | null;
  handleSubmit: UseFormHandleSubmit<UpdateRoomFormInput, UpdateRoomForm>;
  isDirty: boolean;
  isSubmitting: boolean;
  isUpdatePending: boolean;
  linksSection?: ReactNode;
  onAvatarSelectFile: (file: File, previewUrl: string) => void;
  onCategoryIdsChange: (categoryIds: string[]) => void;
  onSubmit: (data: UpdateRoomForm) => Promise<void>;
  onBannerPresetChange: (nextValue: BannerPresetId) => void;
  onBannerRemove: () => void;
  onBannerSelectCustom: () => void;
  onBannerSelectFile: (file: File, previewUrl: string) => void;
  onEditBanner: () => void;
  onCloseAppearanceSheet: () => void;
  onRetryCategoryOptions: () => void;
  onVisibilityChange: (nextValue: UpdateRoomForm['visibility']) => void;
  onJoinPolicyChange: (
    nextValue: NonNullable<UpdateRoomForm['joinPolicy']>,
  ) => void;
  previewAvatar: Avatar;
  register: UseFormRegister<UpdateRoomFormInput>;
  setValue: UseFormSetValue<UpdateRoomFormInput>;
  serverError: string | null;
}) {
  const { t } = useI18n();
  const { pushToast } = useToast();
  const getEmojiLabel = useMemo(() => createBasicEmojiLabelGetter(t), [t]);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSaving = isSubmitting || isUpdatePending;

  const handleEditAvatar = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';

      if (!file) {
        return;
      }

      const validationError = await validateAvatarFile(file);

      if (validationError) {
        pushToast({
          title: t(`rooms.settings.avatar.error.${validationError}`),
          variant: 'error',
        });
        return;
      }

      onAvatarSelectFile(file, URL.createObjectURL(file));
    },
    [onAvatarSelectFile, pushToast, t],
  );

  const { ref: descriptionRegisterRef, ...descriptionRegister } =
    register('description');

  const setDescriptionRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      descriptionRegisterRef(node);
      descriptionRef.current = node;
    },
    [descriptionRegisterRef],
  );

  return (
    <>
      {serverError ? <Alert variant="error">{serverError}</Alert> : null}

      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFileChange}
        />
        <AppearancePreview
          avatar={previewAvatar}
          bannerPresetId={bannerPresetId}
          bannerImageUrl={bannerImageUrl}
          bannerImageUrls={bannerImageUrls}
          name={roomName}
          onEditAvatar={handleEditAvatar}
          onEditBanner={onEditBanner}
          editAvatarAriaLabel={t('rooms.settings.avatar.edit')}
          editBannerAriaLabel={t('rooms.settings.banner.edit')}
        />

        <FormSection contentClassName="flex flex-col gap-5">
          <FormField
            error={errors.name?.message}
            hideLabel
            htmlFor="room-settings-name"
            label={t('rooms.settings.labels.name')}
          >
            <Input
              {...register('name')}
              floatingLabel
              id="room-settings-name"
              maxLength={ROOM_NAME_MAX_LENGTH}
              placeholder={t('rooms.settings.labels.name')}
              type="text"
              className="app-text-body"
            />
          </FormField>

          <FormField
            error={errors.description?.message}
            hideLabel
            htmlFor="room-settings-description"
            label={t('rooms.settings.labels.description')}
          >
            <Textarea
              {...descriptionRegister}
              ref={setDescriptionRef}
              floatingLabel
              id="room-settings-description"
              maxLength={ROOM_DESCRIPTION_MAX_LENGTH}
              placeholder={t('rooms.settings.labels.description')}
              value={descriptionValue}
              rows={4}
              className="app-text-body resize-none"
              controlAccessory={
                <EmojiInsertBar
                  ariaLabel={t('rooms.settings.emojiInsert')}
                  getEmojiLabel={getEmojiLabel}
                  menuLabel={t('rooms.settings.emojiMenu')}
                  disabled={isSaving}
                  maxLength={ROOM_DESCRIPTION_MAX_LENGTH}
                  onValueChange={(nextValue) => {
                    setValue('description', nextValue, { shouldDirty: true });
                  }}
                  targetRef={descriptionRef}
                  value={descriptionValue}
                />
              }
            />
          </FormField>
        </FormSection>

        <RoomCategoriesField
          categoryOptions={categoryOptions}
          errorMessage={categoryError}
          isError={categoryOptionsError}
          isLoading={categoryOptionsLoading}
          onChange={onCategoryIdsChange}
          onRetry={onRetryCategoryOptions}
          selectedCategoryIds={categoryIds}
        />

        <FormField
          error={errors.maxMembers?.message}
          hideLabel
          htmlFor="room-settings-max-members"
          label={t('rooms.settings.labels.maxMembers')}
        >
          <Input
            {...register('maxMembers', { valueAsNumber: true })}
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(
                /[^0-9]/g,
                '',
              );
            }}
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            floatingLabel
            id="room-settings-max-members"
            type="number"
            step={1}
            min={1}
            max={ROOM_MAX_MEMBERS_ABSOLUTE_MAX}
            placeholder={t('rooms.settings.labels.maxMembers')}
          />
        </FormField>

        <input type="hidden" {...register('bannerPresetId')} />

        <div className="vui-form-field">
          <input type="hidden" {...register('visibility')} />
          <RoomVisibilityField
            errorMessage={errors.visibility?.message}
            label={t('rooms.settings.labels.visibility')}
            variant="settings"
            visibilityValue={visibilityValue}
            onVisibilityChange={onVisibilityChange}
          />
        </div>

        {visibilityValue === 'public' ? (
          <div className="vui-form-field">
            <input type="hidden" {...register('joinPolicy')} />
            <RoomJoinPolicyField
              errorMessage={errors.joinPolicy?.message}
              joinPolicyValue={joinPolicyValue ?? 'invite_only'}
              label={t('rooms.settings.labels.joinPolicy')}
              onJoinPolicyChange={onJoinPolicyChange}
            />
          </div>
        ) : null}

        {linksSection}

        <div className="mt-2 flex flex-wrap justify-end gap-3">
          <ButtonLink to={`/rooms/${roomId}`} variant="secondary">
            {t('rooms.settings.cancel')}
          </ButtonLink>
          <Button
            disabled={
              !isDirty &&
              !hasPendingAvatarChange &&
              !hasPendingBannerChange &&
              !hasPendingLinksChange
            }
            isLoading={isSaving}
            loadingLabel={t('rooms.settings.submitting')}
            type="submit"
          >
            {t('rooms.settings.submit')}
          </Button>
        </div>
      </form>

      {appearanceSheet === 'banner' ? (
        <AppearanceEditSheet
          section="banner"
          bannerPresetId={bannerPresetId}
          bannerImageUrl={bannerAvailableImageUrl}
          bannerImageUrls={bannerAvailableImageUrls}
          bannerActiveSource={bannerActiveSource}
          onBannerPresetChange={onBannerPresetChange}
          onBannerSelectCustom={onBannerSelectCustom}
          onBannerSelectFile={onBannerSelectFile}
          onBannerRemove={onBannerRemove}
          onClose={onCloseAppearanceSheet}
          title={t('rooms.settings.banner.sheet.title')}
          closeLabel={t('common.close')}
          bannerPhotoChooseLabel={t('rooms.settings.banner.choose')}
          bannerPhotoRemoveLabel={t('rooms.settings.banner.remove')}
          bannerPhotoErrorKeyPrefix="rooms.settings.banner.error"
        />
      ) : null}
    </>
  );
}
