import type { CropRect } from './cropGeometry';
import type { MediaCropPreset } from './mediaCropPresets';

export type ExportCroppedImageResult = {
  file: File;
  previewUrl: string;
};

/**
 * Draw the natural-pixel crop into a canvas at the preset output size and
 * produce a JPEG `File` plus object URL for local preview.
 */
export async function exportCroppedImage(
  image: CanvasImageSource & { width?: number; height?: number },
  crop: CropRect,
  preset: MediaCropPreset,
): Promise<ExportCroppedImageResult> {
  if (crop.width <= 0 || crop.height <= 0) {
    throw new Error('Crop region is empty.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = preset.outputWidth;
  canvas.height = preset.outputHeight;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas 2D context is unavailable.');
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    preset.outputWidth,
    preset.outputHeight,
  );

  const blob = await canvasToBlob(canvas, preset.mimeType, preset.quality);
  const file = new File([blob], preset.fileName, { type: preset.mimeType });
  const previewUrl = URL.createObjectURL(blob);

  return { file, previewUrl };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to encode cropped image.'));
          return;
        }

        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}
