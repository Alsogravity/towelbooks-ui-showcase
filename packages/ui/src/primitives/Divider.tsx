import { classNames } from '../className';

export type DividerVariant = 'bookend' | 'double' | 'fleuron' | 'hairline';

export interface DividerProps {
  className?: string;
  ornamental?: boolean;
  variant?: DividerVariant;
}

const ornamentByVariant = {
  bookend: {
    className: 'vui-divider__mark vui-divider__mark--bookend',
    src: '/assets/brand/bookend-star.svg',
  },
  fleuron: {
    className: 'vui-divider__mark vui-divider__mark--fleuron',
    src: '/assets/brand/divider-fleuron.svg',
  },
} as const;

export function Divider({
  className = '',
  ornamental = false,
  variant = 'hairline',
}: DividerProps) {
  const resolvedVariant = ornamental ? 'fleuron' : variant;

  if (resolvedVariant === 'hairline' || resolvedVariant === 'double') {
    return (
      <hr
        className={classNames(
          'vui-divider',
          `vui-divider--${resolvedVariant}`,
          className,
        )}
      />
    );
  }

  const ornament = ornamentByVariant[resolvedVariant];

  return (
    <div
      aria-orientation="horizontal"
      role="separator"
      className={classNames(
        'vui-divider',
        'vui-divider--ornamental',
        className,
      )}
    >
      <span aria-hidden="true" className="vui-divider__rule" />
      <img
        src={ornament.src}
        alt=""
        aria-hidden="true"
        className={ornament.className}
      />
      <span aria-hidden="true" className="vui-divider__rule" />
    </div>
  );
}
