import { useRef, useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
} from '../../components/primitives';
import { useI18n } from '../../i18n';
import { exportCroppedImage } from './exportCroppedImage';
import {
  ImageCropViewport,
  type ImageCropViewportHandle,
} from './ImageCropViewport';
import {
  MEDIA_CROP_MAX_ZOOM,
  MEDIA_CROP_MIN_ZOOM,
  type MediaCropPreset,
} from './mediaCropPresets';

export type ImageCropDialogProps = {
  imageUrl: string;
  sourceFileName: string;
  preset: MediaCropPreset;
  onConfirm: (file: File, previewUrl: string) => void;
  onCancel: () => void;
};

export function ImageCropDialog({
  imageUrl,
  sourceFileName,
  preset,
  onConfirm,
  onCancel,
}: ImageCropDialogProps) {
  const { t } = useI18n();
  const viewportRef = useRef<ImageCropViewportHandle>(null);

  const [zoom, setZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const titleKey =
    preset.kind === 'avatar'
      ? 'mediaCrop.avatar.title'
      : 'mediaCrop.banner.title';
  const hintKey =
    preset.kind === 'avatar'
      ? 'mediaCrop.avatar.hint'
      : 'mediaCrop.banner.hint';

  const handleConfirm = async () => {
    const crop = viewportRef.current?.getCropRect() ?? null;

    if (!crop) {
      return;
    }

    if (
      crop.width + 0.5 < preset.minCropWidth ||
      crop.height + 0.5 < preset.minCropHeight
    ) {
      setExportError(t('mediaCrop.error.cropTooSmall'));
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      const image = await loadImage(imageUrl);
      const { file, previewUrl } = await exportCroppedImage(image, crop, {
        ...preset,
        fileName: buildOutputFileName(sourceFileName, preset.fileName),
      });
      onConfirm(file, previewUrl);
    } catch {
      setExportError(t('mediaCrop.error.exportFailed'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog
      title={t(titleKey)}
      closeButtonLabel={t('mediaCrop.close')}
      showCloseButton
      onClose={onCancel}
      initialFocus="panel"
      overlayClassName="app-dialog-overlay fixed inset-0 z-[60] flex items-center justify-center p-4 bg-night/70 backdrop-blur-[2px]"
      panelClassName="app-dialog-panel relative flex max-h-[min(720px,calc(100dvh-2rem))] w-[min(520px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-paper-3 bg-paper shadow-2xl outline-none"
    >
      {({ close }) => (
        <>
          <DialogBody
            disableDefaultSpacing
            className="flex min-h-0 flex-1 flex-col"
          >
            <ImageCropViewport
              key={imageUrl}
              ref={viewportRef}
              imageUrl={imageUrl}
              preset={preset}
              zoom={zoom}
              onZoomChange={setZoom}
              disabled={isExporting}
              aria-label={t('mediaCrop.viewportLabel')}
            />

            <div className="flex flex-col gap-3 px-6 py-4">
              <p className="app-text-metadata text-ink-2">{t(hintKey)}</p>

              <label className="flex flex-col gap-2">
                <span className="app-text-metadata text-ink-2">
                  {t('mediaCrop.zoom')}
                </span>
                <input
                  type="range"
                  min={MEDIA_CROP_MIN_ZOOM}
                  max={MEDIA_CROP_MAX_ZOOM}
                  step={0.01}
                  value={zoom}
                  disabled={isExporting}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  aria-valuemin={MEDIA_CROP_MIN_ZOOM}
                  aria-valuemax={MEDIA_CROP_MAX_ZOOM}
                  aria-valuenow={Number(zoom.toFixed(2))}
                  className="w-full accent-[var(--brick)]"
                />
              </label>

              {exportError ? (
                <p className="app-text-metadata text-brick" role="alert">
                  {exportError}
                </p>
              ) : null}
            </div>
          </DialogBody>

          <DialogActions>
            <Button
              type="button"
              variant="ghost"
              disabled={isExporting}
              onClick={() => close()}
            >
              {t('mediaCrop.cancel')}
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={isExporting}
              onClick={() => {
                void handleConfirm();
              }}
            >
              {isExporting ? t('mediaCrop.confirming') : t('mediaCrop.confirm')}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image for crop.'));
    image.src = url;
  });
}

function buildOutputFileName(sourceName: string, fallback: string): string {
  const base = sourceName.replace(/\.[^.]+$/, '').trim();

  if (!base) {
    return fallback;
  }

  return `${base}-crop.jpg`;
}
