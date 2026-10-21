import type { ReactNode } from 'react';

interface ProfilePageSurfaceProps {
  children: ReactNode;
}

export function ProfilePageSurface({ children }: ProfilePageSurfaceProps) {
  return (
    <div className="mx-auto flex w-full max-w-full flex-1 flex-col gap-6 bg-paper pb-6 pt-0 sm:max-w-[38rem] sm:pb-8">
      {children}
    </div>
  );
}
