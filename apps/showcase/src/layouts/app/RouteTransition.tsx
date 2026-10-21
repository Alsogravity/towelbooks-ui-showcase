import type { ReactNode } from 'react';

interface RouteTransitionProps {
  children: ReactNode;
  fillHeight?: boolean;
  routeKey: string;
}

export function RouteTransition({
  children,
  fillHeight = true,
  routeKey,
}: RouteTransitionProps) {
  return (
    <div
      key={routeKey}
      className={[
        'app-route-content page-content-enter flex flex-1 flex-col',
        fillHeight ? 'min-h-full' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
