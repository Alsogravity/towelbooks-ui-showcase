import { type HTMLAttributes } from 'react';

import { classNames } from '../className';

export type TagVariant =
  'default' | 'gilt' | 'paused' | 'private' | 'reading' | 'role';

const dottedVariants = new Set<TagVariant>([
  'gilt',
  'paused',
  'private',
  'reading',
]);

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  withDot?: boolean;
}

export function Tag({
  children,
  className = '',
  variant = 'default',
  withDot,
  ...props
}: TagProps) {
  const shouldShowDot = withDot ?? dottedVariants.has(variant);

  return (
    <span
      className={classNames('vui-tag', `vui-tag--${variant}`, className)}
      {...props}
    >
      {shouldShowDot && (
        <span
          aria-hidden="true"
          className={classNames('vui-tag__dot', `vui-tag__dot--${variant}`)}
        />
      )}
      {children}
    </span>
  );
}
