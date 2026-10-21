import type { BannerImageUrls } from '@towelbooks/schemas';
import { useRef, useState, type ChangeEvent } from 'react';

import { BannerSurface } from '../../features/banner-presets/BannerSurface';
import {
  BANNER_MEDIA_CROP_PRESET,
  ImageCropDialog,
} from '../../features/media-crop';
import {
  validateBannerFile,
  validateBannerSourceFile,
} from '../../features/profile/bannerUpload';
import { useI18n } from '../../i18n';
import { useToast } from '../feedback';
import { Button } from '../primitives';

export interface BannerPhotoSectionProps {
  presetId: string | null;
  /**
   * Custom banner image available for selection (pending upload or saved).
   * Shown in the upload tab even when a preset is currently active.
   */
  imageUrl: string | null;
  imageUrls?: BannerImageUrls | null;
  /** Whether the custom image is the active banner source. */
  customSelected?: boolean;
  /** Activate the custom image (without uploading again). */
  onSelectCustom?: () => void;
  onSelectFile: (file: File, previewUrl: string) => void;
  onRemove: () => void;
  chooseLabel: string;
  removeLabel: string;
  hint?: string;
  errorKeyPrefix: string;
}

type PendingCrop = {
  sourceUrl: string;
  fileName: string;
};

export function BannerPhotoSection({
  presetId,
  imageUrl,
  imageUrls = null,
  customSelected = false,
  onSelectCustom,
  onSelectFile,
  onRemove,
  chooseLabel,
  removeLabel,
  hint,
  errorKeyPrefix,
}: BannerPhotoSectionProps) {
  const { t } = useI18n();
  const { pushToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingCrop, setPendingCrop] = useState<PendingCrop | null>(null);

  const hasCustomBanner = Boolean(imageUrl);
  const canSelectCustom =
    hasCustomBanner && typeof onSelectCustom === 'function';

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file) {
      return;
    }

    const validationError = await validateBannerSourceFile(file);

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
    const validationError = await validateBannerFile(file);

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

  const preview = (
    <BannerSurface
      className="rounded-xl"
      imageUrl={imageUrl}
      imageUrls={imageUrls}
      presetId={presetId}
      testId="banner-photo-preview"
    />
  );

  return (
    <div className="flex flex-col gap-4">
      {canSelectCustom ? (
        <button
          type="button"
          role="radio"
          aria-checked={customSelected}
          aria-label={t('banner.picker.customOption')}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();

            if (!customSelected) {
              onSelectCustom();
            }
          }}
          className={[
            'block w-full cursor-pointer overflow-hidden rounded-xl border text-left transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brick',
            customSelected
              ? 'border-brick bg-brick-soft/25 shadow-2'
              : 'border-rule bg-paper-2/60',
          ].join(' ')}
        >
          <div className="aspect-[4/1] w-full overflow-hidden">{preview}</div>
          <p className="px-3 py-2 text-sm font-medium text-ink">
            {t('banner.picker.customOption')}
          </p>
        </button>
      ) : (
        preview
      )}

      {hint ? (
        <p className="app-text-metadata text-center text-ink-2">{hint}</p>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFileChange}
        />
        {hasCustomBanner ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove()}
          >
            {removeLabel}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          {chooseLabel}
        </Button>
      </div>

      {pendingCrop ? (
        <ImageCropDialog
          imageUrl={pendingCrop.sourceUrl}
          sourceFileName={pendingCrop.fileName}
          preset={BANNER_MEDIA_CROP_PRESET}
          onCancel={closeCrop}
          onConfirm={(file, previewUrl) => {
            void handleCropConfirm(file, previewUrl);
          }}
        />
      ) : null}
    </div>
  );
}
