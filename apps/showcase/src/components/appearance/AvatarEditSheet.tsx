import { type Avatar } from '@towelbooks/schemas';

import { AppearanceEditSheet } from './AppearanceEditSheet';

export type AvatarEditSheetProps = {
  previewAvatar: Avatar;
  displayName: string;
  disabled?: boolean;
  onSelectFile: (file: File, previewUrl: string) => void;
  onRemove: () => void;
  onClose: () => void;
  title?: string;
  closeLabel?: string;
  chooseLabel?: string;
  removeLabel?: string;
  errorKeyPrefix?: string;
};

export function AvatarEditSheet({
  previewAvatar,
  displayName,
  disabled,
  onSelectFile,
  onRemove,
  onClose,
  title,
  closeLabel,
  chooseLabel,
  removeLabel,
  errorKeyPrefix,
}: AvatarEditSheetProps) {
  return (
    <AppearanceEditSheet
      section="avatar"
      previewAvatar={previewAvatar}
      displayName={displayName}
      disabled={disabled}
      onSelectFile={onSelectFile}
      onRemove={onRemove}
      onClose={onClose}
      title={title}
      closeLabel={closeLabel}
      avatarPhotoChooseLabel={chooseLabel}
      avatarPhotoRemoveLabel={removeLabel}
      avatarPhotoErrorKeyPrefix={errorKeyPrefix}
    />
  );
}
