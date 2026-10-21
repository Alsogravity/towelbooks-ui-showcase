import { PageContainer, type PageContainerSize } from './PageContainer';
import { PageShell } from './PageShell';
import { PageStateLayout } from './PageStateLayout';

import type { ReactNode } from 'react';

type PageStateShellBackground = 'muted' | 'paper' | 'transparent';
type PageStateShellOffset = 'none' | 'slight';

interface PageStateShellProps {
  background?: PageStateShellBackground;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  containerSize?: PageContainerSize;
  stateClassName?: string;
  offset?: PageStateShellOffset;
}

export function PageStateShell({
  background = 'paper',
  children,
  className,
  containerClassName,
  containerSize = 'wide',
  offset = 'none',
  stateClassName,
}: PageStateShellProps) {
  return (
    <PageShell
      background={background}
      minHeight
      className={['flex flex-col', className].filter(Boolean).join(' ')}
    >
      <PageContainer
        size={containerSize}
        className={['flex flex-1', containerClassName]
          .filter(Boolean)
          .join(' ')}
      >
        <PageStateLayout
          minHeight="full"
          offset={offset}
          className={stateClassName}
        >
          {children}
        </PageStateLayout>
      </PageContainer>
    </PageShell>
  );
}
