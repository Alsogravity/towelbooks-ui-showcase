import type { ReactNode } from 'react';

type RoomDiscoverEmptyStateLayoutProps = {
  children: ReactNode;
};

export function RoomDiscoverEmptyStateLayout({
  children,
}: RoomDiscoverEmptyStateLayoutProps) {
  return (
    <div className="flex min-h-[320px] flex-1 items-center justify-center">
      {children}
    </div>
  );
}
