import { type ComponentProps } from 'react';

import { Button } from './Button';

type LikeButtonProps = {
  'aria-label': string;
  buttonClassName?: string;
  containerClassName?: string;
  count?: number;
  countClassName?: string;
  disabled?: boolean;
  iconSize?: number;
  isLiked: boolean;
  isLoading?: boolean;
  onClick?: ComponentProps<typeof Button>['onClick'];
  variant?: ComponentProps<typeof Button>['variant'];
};

function joinClassNames(
  ...classNames: Array<string | false | null | undefined>
) {
  return classNames.filter(Boolean).join(' ');
}

export function LikeButton({
  'aria-label': ariaLabel,
  buttonClassName,
  containerClassName,
  count,
  countClassName,
  disabled = false,
  iconSize,
  isLiked,
  isLoading = false,
  onClick,
  variant = 'ghost',
}: LikeButtonProps) {
  return (
    <div
      className={joinClassNames(
        'flex items-center gap-1.5',
        containerClassName,
      )}
    >
      <Button
        aria-label={ariaLabel}
        aria-pressed={isLiked}
        className={buttonClassName}
        disabled={disabled}
        icon="heart"
        iconSize={iconSize}
        isLoading={isLoading}
        onClick={onClick}
        variant={variant}
      />
      {typeof count === 'number' && count > 0 ? (
        <span className={countClassName}>{count}</span>
      ) : null}
    </div>
  );
}
