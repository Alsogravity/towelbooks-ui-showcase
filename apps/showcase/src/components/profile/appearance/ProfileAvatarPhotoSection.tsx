import { type Avatar } from '@towelbooks/schemas';

import { AvatarPhotoSection } from '../../appearance/AvatarPhotoSection';
import { useI18n } from '../../../i18n';

export interface ProfileAvatarPhotoSectionProps {
  displayName: string;
  previewAvatar: Avatar;
  onSelectFile: (file: File, previewUrl: string) => void;
  onRemove: () => void;
}

export function ProfileAvatarPhotoSection({
  displayName,
  previewAvatar,
  onSelectFile,
  onRemove,
}: ProfileAvatarPhotoSectionProps) {
  const { t } = useI18n();

  return (
    <AvatarPhotoSection
      avatar={previewAvatar}
      name={displayName}
      onSelectFile={onSelectFile}
      onRemove={onRemove}
      chooseLabel={t('settings.profile.edit.avatarPhoto.choose')}
      removeLabel={t('settings.profile.edit.avatarPhoto.remove')}
      errorKeyPrefix="settings.profile.edit.avatarPhoto.error"
    />
  );
}
