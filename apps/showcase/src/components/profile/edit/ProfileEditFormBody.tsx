import {
  type Avatar,
  type BannerImageUrls,
  BIO_MAX_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  USERNAME_MAX_LENGTH,
  type BannerPresetId,
} from '@towelbooks/schemas';
import type { BasicEmojiOption } from '@towelbooks/ui';
import type { FormEventHandler, ReactNode, RefObject } from 'react';

import { AvatarEditSheet } from '../../appearance/AvatarEditSheet';
import {
  AppearanceEditSheet,
  type AppearanceSection,
} from '../../appearance/AppearanceEditSheet';
import type { BannerActiveSource } from '../../../features/banner-presets';
import { ProfileEditAppearancePreview } from '../appearance/ProfileEditAppearancePreview';
import { useI18n } from '../../../i18n';
import {
  Button,
  EmojiInsertBar,
  FormField,
  InfoTooltipButton,
  Input,
  Textarea,
} from '../../primitives';
import { Switch } from '@towelbooks/ui';
import {
  FORM_ID,
  type CloseProfileEditForm,
  type ProfileEditField,
} from './profileEditFormShared';

type FieldErrors = Partial<Record<ProfileEditField, string>>;

export interface ProfileEditFormBodyProps {
  appearanceSheet: AppearanceSection | null;
  bannerPresetDraft: BannerPresetId;
  /** Banner shown on the profile preview (respects active source). */
  bannerImageUrl: string | null;
  bannerImageUrls?: BannerImageUrls | null;
  /**
   * Custom banner available for selection in the picker (even when a preset is
   * active for display).
   */
  bannerAvailableImageUrl: string | null;
  bannerAvailableImageUrls?: BannerImageUrls | null;
  bannerActiveSource: BannerActiveSource;
  bioDraft: string;
  bioRef: RefObject<HTMLTextAreaElement | null>;
  canSave: boolean;
  close: CloseProfileEditForm;
  dialogBodyRef: RefObject<HTMLDivElement | null>;
  displayNameDraft: string;
  displayNamePlaceholder: string;
  fieldErrors: FieldErrors;
  getEmojiLabel: (emoji: BasicEmojiOption) => string;
  isSaving: boolean;
  linksSection?: ReactNode;
  readingCategoriesSection: ReactNode;
  previewAvatar: Avatar;
  previewDisplayName: string;
  visibilityChecked: boolean;
  visibilityDisabled: boolean;
  onVisibilityChange: (checked: boolean) => void;
  usernameDraft: string;
  onAvatarRemove: () => void;
  onAvatarSelect: (file: File, previewUrl: string) => void;
  onBannerPresetChange: (nextValue: BannerPresetId) => void;
  onBannerRemove: () => void;
  onBannerSelect: (file: File, previewUrl: string) => void;
  onBannerSelectCustom: () => void;
  onBioChange: (value: string) => void;
  onCloseAppearanceSheet: () => void;
  onDisplayNameChange: (value: string) => void;
  onOpenAppearanceSheet: (section: AppearanceSection) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onUsernameChange: (value: string) => void;
}

export function ProfileEditFormBody({
  appearanceSheet,
  bannerPresetDraft,
  bannerImageUrl,
  bannerImageUrls = null,
  bannerAvailableImageUrl,
  bannerAvailableImageUrls = null,
  bannerActiveSource,
  bioDraft,
  bioRef,
  canSave,
  close,
  dialogBodyRef,
  displayNameDraft,
  displayNamePlaceholder,
  fieldErrors,
  getEmojiLabel,
  isSaving,
  linksSection,
  readingCategoriesSection,
  onVisibilityChange,
  previewAvatar,
  previewDisplayName,
  usernameDraft,
  visibilityChecked,
  visibilityDisabled,
  onAvatarRemove,
  onAvatarSelect,
  onBannerPresetChange,
  onBannerRemove,
  onBannerSelect,
  onBannerSelectCustom,
  onBioChange,
  onCloseAppearanceSheet,
  onDisplayNameChange,
  onOpenAppearanceSheet,
  onSubmit,
  onUsernameChange,
}: ProfileEditFormBodyProps) {
  const { t } = useI18n();

  return (
    <>
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <ProfileEditAppearancePreview
          avatar={previewAvatar}
          bannerPresetId={bannerPresetDraft}
          bannerImageUrl={bannerImageUrl}
          bannerImageUrls={bannerImageUrls}
          displayName={previewDisplayName}
          onEditAvatar={() => onOpenAppearanceSheet('avatar')}
          onEditBanner={() => onOpenAppearanceSheet('banner')}
        />
        <form
          id={FORM_ID}
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div
            ref={dialogBodyRef}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto py-3 gap-3"
          >
            <FormField
              label={t('settings.profile.displayName')}
              htmlFor="profile-edit-display-name"
              hideLabel
              error={fieldErrors.displayName}
            >
              <Input
                id="profile-edit-display-name"
                maxLength={DISPLAY_NAME_MAX_LENGTH}
                onChange={(event) => onDisplayNameChange(event.target.value)}
                floatingLabel
                floatingLabelText={t('settings.profile.displayName')}
                placeholder={displayNamePlaceholder}
                type="text"
                value={displayNameDraft}
                className="app-text-body"
              />
            </FormField>

            <FormField
              label={t('settings.profile.edit.username')}
              htmlFor="profile-edit-username"
              hideLabel
              error={fieldErrors.username}
            >
              <Input
                id="profile-edit-username"
                maxLength={USERNAME_MAX_LENGTH}
                onChange={(event) => onUsernameChange(event.target.value)}
                floatingLabel
                placeholder={t('settings.profile.edit.username')}
                type="text"
                value={usernameDraft}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="app-text-body"
              />
            </FormField>

            <FormField
              label={t('settings.profile.edit.bio')}
              htmlFor="profile-edit-bio"
              hideLabel
              error={fieldErrors.bio}
            >
              <Textarea
                id="profile-edit-bio"
                ref={bioRef}
                maxLength={BIO_MAX_LENGTH}
                onChange={(event) => onBioChange(event.target.value)}
                controlAccessory={
                  <EmojiInsertBar
                    ariaLabel={t('settings.profile.edit.emojiInsert')}
                    getEmojiLabel={getEmojiLabel}
                    menuLabel={t('settings.profile.edit.emojiMenu')}
                    disabled={isSaving}
                    maxLength={BIO_MAX_LENGTH}
                    onValueChange={onBioChange}
                    targetRef={bioRef}
                    value={bioDraft}
                  />
                }
                floatingLabel
                placeholder={t('settings.profile.edit.bio')}
                rows={3}
                value={bioDraft}
                className="app-text-body resize-none"
              />
            </FormField>

            {readingCategoriesSection}

            <FormField
              label={t('settings.privacy.profileVisibility.label')}
              htmlFor="profile-edit-profileVisibility"
              hideLabel
            >
              <div className="flex items-center justify-between">
                <span className="flex min-w-0 items-center">
                  <span className="app-text-label">
                    {t('settings.privacy.profileVisibility.label')}
                  </span>
                  <InfoTooltipButton
                    ariaLabel={t(
                      'settings.privacy.profileVisibility.infoAriaLabel',
                    )}
                    content={t(
                      'settings.privacy.profileVisibility.description',
                    )}
                    placement="bottom-start"
                    tooltipId="profile-edit-visibility-info-tooltip"
                  />
                </span>
                <Switch
                  id="profile-edit-profileVisibility"
                  checked={visibilityChecked}
                  disabled={visibilityDisabled}
                  onCheckedChange={onVisibilityChange}
                />
              </div>
            </FormField>

            <FormField
              label={t('externalLinks.editor.title', { fallback: 'Links' })}
              hideLabel
            >
              {linksSection}
            </FormField>
          </div>
          <div className={'flex flex-wrap justify-end gap-2'}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="profile-edit-form__action-button h-[38px]"
              onClick={() => close()}
            >
              {t('settings.profile.edit.cancel')}
            </Button>
            <Button
              type="submit"
              size="sm"
              className="profile-edit-form__save-button h-[38px] px-8"
              disabled={!canSave}
              isLoading={isSaving}
              loadingLabel={t('settings.profile.edit.saving')}
            >
              {t('settings.profile.edit.save')}
            </Button>
          </div>
        </form>
      </div>
      {appearanceSheet === 'avatar' ? (
        <AvatarEditSheet
          previewAvatar={previewAvatar}
          displayName={previewDisplayName}
          onSelectFile={onAvatarSelect}
          onRemove={onAvatarRemove}
          onClose={onCloseAppearanceSheet}
        />
      ) : null}
      {appearanceSheet === 'banner' ? (
        <AppearanceEditSheet
          section="banner"
          bannerPresetId={bannerPresetDraft}
          bannerImageUrl={bannerAvailableImageUrl}
          bannerImageUrls={bannerAvailableImageUrls}
          bannerActiveSource={bannerActiveSource}
          onBannerPresetChange={onBannerPresetChange}
          onBannerSelectCustom={onBannerSelectCustom}
          onBannerSelectFile={onBannerSelect}
          onBannerRemove={onBannerRemove}
          onClose={onCloseAppearanceSheet}
        />
      ) : null}
    </>
  );
}
