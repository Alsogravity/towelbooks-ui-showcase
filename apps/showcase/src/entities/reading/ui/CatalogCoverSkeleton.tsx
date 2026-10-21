import { CATALOG_COVER_ASPECT_CLASS } from './catalogCoverLayout';

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

type CatalogCoverSkeletonProps = {
  className?: string;
};

export function CatalogCoverSkeleton({ className }: CatalogCoverSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={classNames(
        CATALOG_COVER_ASPECT_CLASS,
        'app-shimmer w-full',
        className,
      )}
    />
  );
}
