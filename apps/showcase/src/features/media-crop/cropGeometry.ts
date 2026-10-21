/** Width:height aspect ratio as a single number (width / height). */
export type AspectRatioValue = number;

export type Size = {
  width: number;
  height: number;
};

export type Point = {
  x: number;
  y: number;
};

/** Crop rectangle in natural image pixel coordinates. */
export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CropFrame = {
  width: number;
  height: number;
  /** Offset of the frame’s top-left within the container. */
  left: number;
  top: number;
};

/**
 * Fit a fixed-aspect crop frame inside a container with uniform padding.
 * Aspect is width/height (e.g. 1 for square, 4 for 4:1 banner).
 */
export function computeCropFrame(
  container: Size,
  aspectRatio: AspectRatioValue,
  padding = 24,
): CropFrame {
  const availableWidth = Math.max(1, container.width - padding * 2);
  const availableHeight = Math.max(1, container.height - padding * 2);

  let width = availableWidth;
  let height = width / aspectRatio;

  if (height > availableHeight) {
    height = availableHeight;
    width = height * aspectRatio;
  }

  return {
    width,
    height,
    left: (container.width - width) / 2,
    top: (container.height - height) / 2,
  };
}

/**
 * Scale that makes the media fully cover the crop frame at zoom = 1
 * (object-fit: cover of the crop rect).
 */
export function computeBaseScale(
  media: Size,
  cropFrame: Pick<CropFrame, 'width' | 'height'>,
): number {
  if (media.width <= 0 || media.height <= 0) {
    return 1;
  }

  return Math.max(
    cropFrame.width / media.width,
    cropFrame.height / media.height,
  );
}

export function computeDisplaySize(
  media: Size,
  baseScale: number,
  zoom: number,
): Size {
  const scale = baseScale * zoom;

  return {
    width: media.width * scale,
    height: media.height * scale,
  };
}

/**
 * Clamp pan so the crop frame stays fully inside the displayed media.
 * Position is the image center relative to the crop-frame center (CSS px).
 */
export function clampPosition(
  position: Point,
  display: Size,
  cropFrame: Pick<CropFrame, 'width' | 'height'>,
): Point {
  const maxX = Math.max(0, (display.width - cropFrame.width) / 2);
  const maxY = Math.max(0, (display.height - cropFrame.height) / 2);

  return {
    x: normalizeZero(Math.min(maxX, Math.max(-maxX, position.x))),
    y: normalizeZero(Math.min(maxY, Math.max(-maxY, position.y))),
  };
}

/**
 * Map viewport crop + pan/zoom into a natural-image-pixel crop rectangle.
 */
export function computeCropRect(
  media: Size,
  cropFrame: Pick<CropFrame, 'width' | 'height'>,
  position: Point,
  baseScale: number,
  zoom: number,
): CropRect {
  const scale = baseScale * zoom;
  const cropWidth = cropFrame.width / scale;
  const cropHeight = cropFrame.height / scale;
  const centerX = media.width / 2 - position.x / scale;
  const centerY = media.height / 2 - position.y / scale;

  const x = clamp(
    centerX - cropWidth / 2,
    0,
    Math.max(0, media.width - cropWidth),
  );
  const y = clamp(
    centerY - cropHeight / 2,
    0,
    Math.max(0, media.height - cropHeight),
  );

  return {
    x,
    y,
    width: Math.min(cropWidth, media.width - x),
    height: Math.min(cropHeight, media.height - y),
  };
}

export function clampZoom(
  zoom: number,
  minZoom: number,
  maxZoom: number,
): number {
  return Math.min(maxZoom, Math.max(minZoom, zoom));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Avoid signed zero from Math.min/max so UI state compares cleanly. */
function normalizeZero(value: number): number {
  return value === 0 ? 0 : value;
}
