import type { ReactNode } from 'react';

type SplitPageLayoutAsidePosition = 'left' | 'right';
type SplitPageLayoutAsideWidth = 'default' | 'narrow' | 'wide';

interface SplitPageLayoutProps {
  aside?: ReactNode;
  asideClassName?: string;
  asidePosition?: SplitPageLayoutAsidePosition;
  asideWidth?: SplitPageLayoutAsideWidth;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  divider?: boolean;
  stickyAside?: boolean;
  stickyAsideOffsetClassName?: string;
}

const leftAsideWidthClasses: Record<SplitPageLayoutAsideWidth, string> = {
  default: 'lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]',
  narrow: 'lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]',
  wide: 'lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]',
};

const rightAsideWidthClasses: Record<SplitPageLayoutAsideWidth, string> = {
  default: 'lg:grid-cols-[minmax(0,1fr)_minmax(0,240px)]',
  narrow: 'lg:grid-cols-[minmax(0,1fr)_minmax(0,220px)]',
  wide: 'lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]',
};

export function SplitPageLayout({
  aside,
  asideClassName,
  asidePosition = 'left',
  asideWidth = 'default',
  children,
  className,
  contentClassName,
  divider = false,
  stickyAside = false,
  stickyAsideOffsetClassName,
}: SplitPageLayoutProps) {
  if (!aside) {
    return (
      <div
        className={['min-w-0', contentClassName, className]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    );
  }

  const asideContent = stickyAside ? (
    <div
      className={[
        'lg:sticky lg:self-start',
        stickyAsideOffsetClassName ?? 'lg:top-6',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {aside}
    </div>
  ) : (
    aside
  );

  const asideClasses = [
    'min-w-0',
    asidePosition === 'right' && divider
      ? 'lg:border-l lg:border-rule lg:pl-10'
      : '',
    asideClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const contentClasses = [
    'min-w-0',
    asidePosition === 'left' && divider
      ? 'lg:border-l lg:border-rule lg:pl-10'
      : '',
    contentClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={[
        'grid flex-1 gap-8 lg:items-stretch lg:gap-10 xl:gap-12',
        asidePosition === 'left'
          ? leftAsideWidthClasses[asideWidth]
          : rightAsideWidthClasses[asideWidth],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {asidePosition === 'left' ? (
        <>
          <div className={asideClasses}>{asideContent}</div>
          <div className={contentClasses}>{children}</div>
        </>
      ) : (
        <>
          <div className={contentClasses}>{children}</div>
          <div className={asideClasses}>{asideContent}</div>
        </>
      )}
    </div>
  );
}
