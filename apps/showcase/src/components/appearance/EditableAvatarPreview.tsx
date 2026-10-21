import { type Avatar as AvatarShape } from '@towelbooks/schemas';
import { useState } from 'react';

import { AppearanceEditIconButton } from './AppearanceEditIconButton';
import { AvatarEditSheet } from './AvatarEditSheet';
import { Avatar } from '../primitives';

export type EditableAvatarPreviewProps = {
  avatar: AvatarShape;
  name: string;
  editAriaLabel: string;
  onSelectFile: (file: File, previewUrl: string) => void;
  onRemove: () => void;
  dialogTitle?: string;
  dialogCloseLabel?: string;
  chooseLabel?: string;
  disabled?: boolean;
  removeLabel?: string;
  errorKeyPrefix?: string;
};

export function EditableAvatarPreview({
  avatar,
  name,
  editAriaLabel,
  onSelectFile,
  onRemove,
  dialogTitle,
  dialogCloseLabel,
  chooseLabel,
  disabled,
  removeLabel,
  errorKeyPrefix,
}: EditableAvatarPreviewProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative shrink-0 w-fit h-fit">
        <Avatar
          background={avatar.background}
          foreground={avatar.foreground}
          imageAlt=""
          imageUrl={avatar.imageUrl}
          initial={avatar.initial}
          size="xl"
          className="border-4 border-paper"
        />
        <AppearanceEditIconButton
          ariaLabel={editAriaLabel}
          disabled={disabled}
          onClick={() => setIsSheetOpen(true)}
          className="absolute right-[16%] top-[16%] z-20 -translate-y-1/2 translate-x-1/2"
        />
      </div>

      {isSheetOpen ? (
        <AvatarEditSheet
          previewAvatar={avatar}
          displayName={name}
          disabled={disabled}
          onSelectFile={(file: File, previewUrl: string) => {
            onSelectFile(file, previewUrl);
            setIsSheetOpen(false);
          }}
          onRemove={() => {
            onRemove();
            setIsSheetOpen(false);
          }}
          onClose={() => setIsSheetOpen(false)}
          title={dialogTitle}
          closeLabel={dialogCloseLabel}
          chooseLabel={chooseLabel}
          removeLabel={removeLabel}
          errorKeyPrefix={errorKeyPrefix}
        />
      ) : null}
    </div>
  );
}
