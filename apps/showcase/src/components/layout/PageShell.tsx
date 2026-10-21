import type { ReactNode } from 'react';

type PageShellBackground = 'muted' | 'paper' | 'transparent';

interface PageShellProps {
  background?: PageShellBackground;
  children: ReactNode;
  className?: string;
  minHeight?: boolean;
}

const backgroundClasses: Record<PageShellBackground, string> = {
  muted: 'bg-paper-2',
  paper: 'bg-paper',
  transparent: '',
};

export function PageShell({
  background = 'transparent',
  children,
  className,
  minHeight = false,
}: PageShellProps) {
  return (
    <div
      className={[
        'w-full',
        backgroundClasses[background],
        minHeight
          ? 'min-h-[var(--page-shell-min-height,100dvh)] transition-[min-height] duration-300 ease-in-out motion-reduce:transition-none'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
