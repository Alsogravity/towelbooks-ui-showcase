'use client';

import {
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';

import { classNames } from '../className';

export type AvatarSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  background?: string;
  foreground?: string;
  initial: string;
  imageUrl?: string | null;
  imageUrls?: {
    '128': string;
    '256': string;
  } | null;
  imageAlt?: string;
  size?: AvatarSize;
}

const SIZE_PIXELS: Record<AvatarSize, number> = {
  xs: 20,
  sm: 28,
  md: 36,
  lg: 44,
  xl: 88,
};

export function Avatar({
  background = '#581810',
  className = '',
  foreground = '#FCEEE9',
  imageAlt,
  imageUrl,
  imageUrls,
  initial,
  size = 'md',
  style,
  ...props
}: AvatarProps) {
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const previousImageUrlRef = useRef(imageUrl);

  if (imageUrl !== previousImageUrlRef.current) {
    previousImageUrlRef.current = imageUrl;
    if (imageLoadFailed) {
      setImageLoadFailed(false);
    }
  }

  const resolvedImageUrl = imageUrl ?? imageUrls?.['128'] ?? null;
  const renderedInitial = initial.slice(0, 1).toUpperCase();
  const shouldRenderImage =
    typeof resolvedImageUrl === 'string' &&
    resolvedImageUrl.length > 0 &&
    !imageLoadFailed;
  const imageSrcSet = imageUrls
    ? `${imageUrls['128']} 128w, ${imageUrls['256']} 256w`
    : undefined;
  const appearanceStyle: CSSProperties = shouldRenderImage
    ? (style ?? {})
    : {
        backgroundColor: background,
        color: foreground,
        ...style,
      };

  return (
    <span
      className={classNames(
        'vui-avatar',
        `vui-avatar--${size}`,
        shouldRenderImage ? 'vui-avatar--image' : null,
        className,
      )}
      style={appearanceStyle}
      {...props}
    >
      {shouldRenderImage ? (
        <img
          alt={imageAlt ?? ''}
          aria-hidden={imageAlt ? undefined : true}
          className="vui-avatar__image"
          decoding="async"
          height={SIZE_PIXELS[size]}
          loading="lazy"
          onError={() => setImageLoadFailed(true)}
          sizes={`${SIZE_PIXELS[size]}px`}
          src={resolvedImageUrl ?? undefined}
          srcSet={imageSrcSet}
          width={SIZE_PIXELS[size]}
        />
      ) : (
        renderedInitial
      )}
    </span>
  );
}
