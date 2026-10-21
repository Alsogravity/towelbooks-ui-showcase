import { Suspense, type ReactNode } from 'react';

import {
  RouteLoadingFallback,
  type RouteLoadingFallbackVariant,
} from './RouteLoadingFallback';

type LazyRouteProps = {
  children: ReactNode;
  variant?: RouteLoadingFallbackVariant;
};

/** Suspense boundary for lazy page elements outside an in-shell layout. */
export function LazyRoute({
  children,
  variant = 'fullscreen',
}: LazyRouteProps) {
  return (
    <Suspense fallback={<RouteLoadingFallback variant={variant} />}>
      {children}
    </Suspense>
  );
}
