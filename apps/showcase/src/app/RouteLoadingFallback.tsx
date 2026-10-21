import { LoadingState } from '../components/feedback';

export type RouteLoadingFallbackVariant = 'fullscreen' | 'shell';

type RouteLoadingFallbackProps = {
  variant?: RouteLoadingFallbackVariant;
};

/**
 * Accessible, localized fallback while a lazy route chunk loads.
 * `shell` keeps the app/auth chrome mounted; `fullscreen` is for standalone routes.
 */
export function RouteLoadingFallback({
  variant = 'fullscreen',
}: RouteLoadingFallbackProps) {
  if (variant === 'shell') {
    return (
      <div className="flex h-full min-h-[24rem] flex-1 items-center justify-center px-4 py-8">
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <LoadingState />
    </div>
  );
}
