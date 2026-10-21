import { type Avatar } from '@towelbooks/schemas';
import { useRef, useState, type ChangeEvent } from 'react';

import {
  AVATAR_MEDIA_CROP_PRESET,
  ImageCropDialog,
} from '../../features/media-crop';
import {
  validateAvatarFile,
  validateAvatarSourceFile,
} from '../../features/profile/avatarUpload';
import { useI18n } from '../../i18n';
import { useToast } from '../feedback';
import { Avatar as AvatarPrimitive, Button } from '../primitives';

export interface AvatarPhotoSectionProps {
  avatar: Avatar;
  name: string;
  onSelectFile: (file: File, previewUrl: string) => void;
  onRemove: () => void;
  chooseLabel: string;
  removeLabel: string;
  disabled?: boolean;
  errorKeyPrefix: string;
}

type PendingCrop = {
  sourceUrl: string;
  fileName: string;
};

export function AvatarPhotoSection({
  avatar,
  name,
  onSelectFile,
  onRemove,
  chooseLabel,
  removeLabel,
  disabled,
  errorKeyPrefix,
}: AvatarPhotoSectionProps) {
  const { t } = useI18n();
  const { pushToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingCrop, setPendingCrop] = useState<PendingCrop | null>(null);

  const hasPhoto = avatar.type === 'image' && avatar.imageUrl;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file) {
      return;
    }

    const validationError = await validateAvatarSourceFile(file);

    if (validationError) {
      pushToast({
        title: t(`${errorKeyPrefix}.${validationError}`),
        variant: 'error',
      });
      return;
    }

    setPendingCrop({
      sourceUrl: URL.createObjectURL(file),
      fileName: file.name,
    });
  };

  const closeCrop = () => {
    setPendingCrop((current) => {
      if (current) {
        URL.revokeObjectURL(current.sourceUrl);
      }

      return null;
    });
  };

  const handleCropConfirm = async (file: File, previewUrl: string) => {
    const validationError = await validateAvatarFile(file);

    if (validationError) {
      URL.revokeObjectURL(previewUrl);
      pushToast({
        title: t(`${errorKeyPrefix}.${validationError}`),
        variant: 'error',
      });
      closeCrop();
      return;
    }

    closeCrop();
    onSelectFile(file, previewUrl);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <AvatarPrimitive
        initial={avatar.initial}
        background={avatar.background}
        foreground={avatar.foreground}
        imageUrl={avatar.imageUrl}
        imageAlt={name}
        size="xl"
      />

      <div className="flex flex-wrap items-center justify-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label={chooseLabel}
          disabled={disabled}
          onChange={handleFileChange}
        />
        {hasPhoto ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onRemove()}
          >
            {removeLabel}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          {chooseLabel}
        </Button>
      </div>

      {pendingCrop ? (
        <ImageCropDialog
          imageUrl={pendingCrop.sourceUrl}
          sourceFileName={pendingCrop.fileName}
          preset={AVATAR_MEDIA_CROP_PRESET}
          onCancel={closeCrop}
          onConfirm={(file, previewUrl) => {
            void handleCropConfirm(file, previewUrl);
          }}
        />
      ) : null}
    </div>
  );
}
