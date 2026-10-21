import type { ReactNode } from 'react';

type PageStateLayoutOffset = 'none' | 'slight';
type PageStateLayoutMinHeight = 'full' | 'md' | 'sm';

interface PageStateLayoutProps {
  children: ReactNode;
  className?: string;
  minHeight?: PageStateLayoutMinHeight;
  offset?: PageStateLayoutOffset;
}

const minHeightClasses: Record<PageStateLayoutMinHeight, string> = {
  full: 'min-h-full flex-1',
  md: 'min-h-[400px]',
  sm: 'min-h-[280px]',
};

const offsetClasses: Record<PageStateLayoutOffset, string> = {
  none: '',
  slight: '-translate-y-8 sm:-translate-y-12',
};

export function PageStateLayout({
  children,
  className,
  minHeight = 'md',
  offset = 'none',
}: PageStateLayoutProps) {
  return (
    <div
      className={[
        'flex w-full items-center justify-center text-center',
        minHeightClasses[minHeight],
        offsetClasses[offset],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
