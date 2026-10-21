import { forwardRef, type ReactNode } from 'react';

export type PageContainerSize = 'narrow' | 'comfortable' | 'default' | 'wide';
type PageContainerPadding = 'default' | 'none';
type PageContainerGutters = 'default' | 'none';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  gutters?: PageContainerGutters;
  padding?: PageContainerPadding;
  size?: PageContainerSize;
}

const gutterClasses: Record<PageContainerGutters, string> = {
  default: 'px-4 sm:px-6',
  none: '',
};

// Compact/mobile pages still need breathing room inside the fixed-header offset.
const topPaddingClasses: Record<PageContainerPadding, string> = {
  default: 'pt-4 lg:pt-12',
  none: '',
};

const bottomPaddingClasses: Record<PageContainerPadding, string> = {
  default: 'pb-6 sm:pb-12',
  none: '',
};

const sizeClasses: Record<PageContainerSize, string> = {
  narrow: 'max-w-2xl',
  comfortable: 'max-w-4xl',
  default: 'max-w-5xl',
  wide: 'max-w-6xl',
};

export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  function PageContainer(
    {
      children,
      className,
      gutters = 'default',
      padding = 'default',
      size = 'default',
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={[
          'mx-auto w-full',
          sizeClasses[size],
          gutterClasses[gutters],
          topPaddingClasses[padding],
          bottomPaddingClasses[padding],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    );
  },
);
