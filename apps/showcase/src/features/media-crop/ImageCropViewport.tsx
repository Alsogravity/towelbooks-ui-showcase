import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import {
  clampPosition,
  clampZoom,
  computeBaseScale,
  computeCropFrame,
  computeCropRect,
  computeDisplaySize,
  type CropRect,
  type Point,
  type Size,
} from './cropGeometry';
import {
  MEDIA_CROP_MAX_ZOOM,
  MEDIA_CROP_MIN_ZOOM,
  type MediaCropPreset,
} from './mediaCropPresets';

export type ImageCropViewportHandle = {
  getCropRect: () => CropRect | null;
};

export type ImageCropViewportProps = {
  imageUrl: string;
  preset: MediaCropPreset;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  disabled?: boolean;
  'aria-label'?: string;
};

type ActivePointers = Map<number, Point>;

export const ImageCropViewport = forwardRef<
  ImageCropViewportHandle,
  ImageCropViewportProps
>(function ImageCropViewport(
  {
    imageUrl,
    preset,
    zoom,
    onZoomChange,
    disabled = false,
    'aria-label': ariaLabel,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const pointersRef = useRef<ActivePointers>(new Map());
  const pinchStartRef = useRef<{
    distance: number;
    zoom: number;
  } | null>(null);
  const dragStartRef = useRef<{
    pointerId: number;
    origin: Point;
    position: Point;
  } | null>(null);

  const [containerSize, setContainerSize] = useState<Size>({
    width: 0,
    height: 0,
  });
  const [mediaSize, setMediaSize] = useState<Size | null>(null);
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });

  useLayoutEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const cropFrame =
    containerSize.width > 0 && containerSize.height > 0
      ? computeCropFrame(containerSize, preset.aspectRatio)
      : null;

  const baseScale =
    mediaSize && cropFrame ? computeBaseScale(mediaSize, cropFrame) : 1;
  const display =
    mediaSize && cropFrame
      ? computeDisplaySize(mediaSize, baseScale, zoom)
      : null;

  // Always derive a clamped pan for paint/export — no need to sync back into state.
  const clampedPosition =
    display && cropFrame
      ? clampPosition(position, display, cropFrame)
      : position;

  useImperativeHandle(
    ref,
    () => ({
      getCropRect: () => {
        if (!mediaSize || !cropFrame) {
          return null;
        }

        return computeCropRect(
          mediaSize,
          cropFrame,
          clampedPosition,
          baseScale,
          zoom,
        );
      },
    }),
    [baseScale, clampedPosition, cropFrame, mediaSize, zoom],
  );

  const handleImageLoad = useCallback(() => {
    const image = imageRef.current;

    if (!image) {
      return;
    }

    setMediaSize({
      width: image.naturalWidth,
      height: image.naturalHeight,
    });
    setPosition({ x: 0, y: 0 });
  }, []);

  const applyZoomAt = useCallback(
    (nextZoom: number) => {
      onZoomChange(
        clampZoom(nextZoom, MEDIA_CROP_MIN_ZOOM, MEDIA_CROP_MAX_ZOOM),
      );
    },
    [onZoomChange],
  );

  // Non-passive wheel so we can prevent page scroll while zooming.
  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      if (disabled) {
        return;
      }

      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.12 : 0.12;
      applyZoomAt(zoom + delta);
    };

    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, [applyZoomAt, disabled, zoom]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || !mediaSize) {
      return;
    }

    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size === 1) {
      dragStartRef.current = {
        pointerId: event.pointerId,
        origin: { x: event.clientX, y: event.clientY },
        position: clampedPosition,
      };
      pinchStartRef.current = null;
    } else if (pointersRef.current.size === 2) {
      dragStartRef.current = null;
      const points = [...pointersRef.current.values()];
      pinchStartRef.current = {
        distance: distanceBetween(points[0]!, points[1]!),
        zoom,
      };
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || !pointersRef.current.has(event.pointerId)) {
      return;
    }

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size === 2 && pinchStartRef.current) {
      const points = [...pointersRef.current.values()];
      const distance = distanceBetween(points[0]!, points[1]!);
      const ratio = distance / Math.max(1, pinchStartRef.current.distance);
      applyZoomAt(pinchStartRef.current.zoom * ratio);
      return;
    }

    const drag = dragStartRef.current;

    if (!drag || drag.pointerId !== event.pointerId || !display || !cropFrame) {
      return;
    }

    const next = clampPosition(
      {
        x: drag.position.x + (event.clientX - drag.origin.x),
        y: drag.position.y + (event.clientY - drag.origin.y),
      },
      display,
      cropFrame,
    );
    setPosition(next);
  };

  const endPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointersRef.current.has(event.pointerId)) {
      pointersRef.current.delete(event.pointerId);
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (pointersRef.current.size < 2) {
      pinchStartRef.current = null;
    }

    if (pointersRef.current.size === 0) {
      dragStartRef.current = null;
    } else if (pointersRef.current.size === 1) {
      const [pointerId, point] = [...pointersRef.current.entries()][0]!;
      dragStartRef.current = {
        pointerId,
        origin: point,
        position: clampedPosition,
      };
    }
  };

  const maskClassName =
    preset.shape === 'circle' ? 'rounded-full' : 'rounded-lg';

  return (
    <div
      ref={containerRef}
      className="relative h-[min(360px,50dvh)] w-full touch-none select-none overflow-hidden bg-night/90"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      role="application"
      aria-label={ariaLabel}
    >
      {display && cropFrame && mediaSize ? (
        <img
          ref={imageRef}
          src={imageUrl}
          alt=""
          draggable={false}
          onLoad={handleImageLoad}
          className="pointer-events-none absolute max-w-none"
          style={{
            width: display.width,
            height: display.height,
            left:
              cropFrame.left +
              cropFrame.width / 2 -
              display.width / 2 +
              clampedPosition.x,
            top:
              cropFrame.top +
              cropFrame.height / 2 -
              display.height / 2 +
              clampedPosition.y,
          }}
        />
      ) : (
        <img
          ref={imageRef}
          src={imageUrl}
          alt=""
          draggable={false}
          onLoad={handleImageLoad}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-0"
        />
      )}

      {cropFrame ? (
        <>
          {/* Dim outside the crop using a large box-shadow on the frame. */}
          <div
            aria-hidden
            className={`pointer-events-none absolute box-border border-2 border-[var(--brick)] ${maskClassName}`}
            style={{
              left: cropFrame.left,
              top: cropFrame.top,
              width: cropFrame.width,
              height: cropFrame.height,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
            }}
          />
        </>
      ) : null}
    </div>
  );
});

function distanceBetween(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;

  return Math.hypot(dx, dy);
}
