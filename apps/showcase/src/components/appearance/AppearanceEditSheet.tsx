import { type Avatar, type BannerPresetId } from '@towelbooks/schemas';
import { type ReactNode } from 'react';

// TODO: Reintroduce after avatar color picker is restored (MVP uses only initial color)
// import { AvatarColorPicker } from '../profile/appearance/AvatarColorPicker';
import { AvatarPhotoSection } from './AvatarPhotoSection';
import {
  BannerDialogPicker,
  type BannerActiveSource,
} from '../../features/banner-presets';
import { useI18n } from '../../i18n';
import { Dialog, DialogBody } from '../primitives';

import type { BannerImageUrls } from '@towelbooks/schemas';

export type AppearanceSection = 'avatar' | 'banner';

const appearanceDialogPanelClassName =
  'app-dialog-panel relative flex max-h-[min(680px,calc(100dvh-2rem))] w-[440px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-paper-3 bg-paper shadow-2xl outline-none';

type AppearanceEditSheetBaseProps = {
  onClose: () => void;
  /** Optional override for the sheet title. Falls back to profile i18n keys. */
  title?: string;
  /** Optional override for the close button label. Falls back to profile i18n keys. */
  closeLabel?: string;
};

export type AvatarAppearanceEditSheetProps = AppearanceEditSheetBaseProps & {
  section: 'avatar';
  previewAvatar: Avatar;
  displayName: string;
  disabled?: boolean;
  onSelectFile: (file: File, previewUrl: string) => void;
  onRemove: () => void;
  /** Optional override for the avatar photo section choose label. */
  avatarPhotoChooseLabel?: string;
  /** Optional override for the avatar photo section remove label. */
  avatarPhotoRemoveLabel?: string;
  /** Optional override for the avatar photo section error key prefix. */
  avatarPhotoErrorKeyPrefix?: string;
};

export type BannerAppearanceEditSheetProps = AppearanceEditSheetBaseProps & {
  section: 'banner';
  bannerPresetId: BannerPresetId;
  /**
   * Available custom banner image (saved or pending), even when a preset is
   * active for display. Used as the selectable option in the upload tab.
   */
  bannerImageUrl: string | null;
  bannerImageUrls?: BannerImageUrls | null;
  bannerActiveSource: BannerActiveSource;
  onBannerPresetChange: (presetId: BannerPresetId) => void;
  onBannerSelectCustom: () => void;
  onBannerSelectFile: (file: File, previewUrl: string) => void;
  onBannerRemove: () => void;
  bannerPhotoChooseLabel?: string;
  bannerPhotoRemoveLabel?: string;
  bannerPhotoErrorKeyPrefix?: string;
};

export type AppearanceEditSheetProps =
  AvatarAppearanceEditSheetProps | BannerAppearanceEditSheetProps;

function getSheetCopy(section: AppearanceSection) {
  if (section === 'avatar') {
    return {
      closeKey: 'settings.profile.edit.avatarSheet.close' as const,
      titleKey: 'settings.profile.edit.avatarSheet.title' as const,
    };
  }

  return {
    closeKey: 'settings.profile.edit.bannerSheet.close' as const,
    titleKey: 'settings.profile.edit.bannerSheet.title' as const,
  };
}

export function AppearanceEditSheet(props: AppearanceEditSheetProps) {
  const { t } = useI18n();
  const { closeKey, titleKey } = getSheetCopy(props.section);

  const resolvedTitle = props.title ?? t(titleKey);
  const resolvedCloseLabel = props.closeLabel ?? t(closeKey);
  const isBanner = props.section === 'banner';

  return (
    <Dialog
      closeButtonLabel={resolvedCloseLabel}
      initialFocus="panel"
      onClose={props.onClose}
      panelClassName={appearanceDialogPanelClassName}
      showCloseButton
      title={resolvedTitle}
    >
      {({ close }) => (
        <DialogBody
          className={
            isBanner
              ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
              : undefined
          }
          disableDefaultSpacing={isBanner}
        >
          {renderSheetContent(props, t, close)}
        </DialogBody>
      )}
    </Dialog>
  );
}

type AppearanceFileSelectionHandler = (file: File, previewUrl: string) => void;

/**
 * A confirmed file choice finishes the appearance editor; the owning form
 * still controls when the staged file is persisted.
 */
function closeAfterFileSelection(
  onSelectFile: AppearanceFileSelectionHandler,
  close: (afterClose?: () => void) => void,
): AppearanceFileSelectionHandler {
  return (file, previewUrl) => {
    onSelectFile(file, previewUrl);
    close();
  };
}

function renderSheetContent(
  props: AppearanceEditSheetProps,
  t: (key: string) => string,
  close: (afterClose?: () => void) => void,
): ReactNode {
  if (props.section === 'avatar') {
    return (
      <div className="space-y-5">
        <AvatarPhotoSection
          avatar={props.previewAvatar}
          name={props.displayName}
          disabled={props.disabled}
          onSelectFile={closeAfterFileSelection(props.onSelectFile, close)}
          onRemove={props.onRemove}
          chooseLabel={
            props.avatarPhotoChooseLabel ??
            t('settings.profile.edit.avatarPhoto.choose')
          }
          removeLabel={
            props.avatarPhotoRemoveLabel ??
            t('settings.profile.edit.avatarPhoto.remove')
          }
          errorKeyPrefix={
            props.avatarPhotoErrorKeyPrefix ??
            'settings.profile.edit.avatarPhoto.error'
          }
        />
        {/* TODO: Reintroduce avatar color picker after UX refinement (MVP uses only initial color)
        <AvatarColorPicker
          previewAvatar={props.previewAvatar}
          value={props.avatarBackground}
          onChange={props.onAvatarBackgroundChange}
        />
        */}
      </div>
    );
  }

  return (
    <BannerDialogPicker
      presetId={props.bannerPresetId}
      imageUrl={props.bannerImageUrl}
      imageUrls={props.bannerImageUrls}
      activeSource={props.bannerActiveSource}
      onBannerSelectFile={closeAfterFileSelection(
        props.onBannerSelectFile,
        close,
      )}
      onBannerSelectCustom={props.onBannerSelectCustom}
      onBannerRemove={props.onBannerRemove}
      bannerPhotoChooseLabel={
        props.bannerPhotoChooseLabel ??
        t('settings.profile.edit.bannerPhoto.choose')
      }
      bannerPhotoRemoveLabel={
        props.bannerPhotoRemoveLabel ??
        t('settings.profile.edit.bannerPhoto.remove')
      }
      bannerPhotoErrorKeyPrefix={
        props.bannerPhotoErrorKeyPrefix ??
        'settings.profile.edit.bannerPhoto.error'
      }
      bannerPresetValue={props.bannerPresetId}
      onBannerPresetChange={props.onBannerPresetChange}
      close={close}
    />
  );
}
