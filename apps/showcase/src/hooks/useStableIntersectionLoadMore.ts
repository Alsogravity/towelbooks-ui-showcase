import { useEffect, useRef } from 'react';

import type { RefObject } from 'react';

type UseStableIntersectionLoadMoreOptions = {
  /** Blocks triggering load-more (e.g. a fetch-next-page error). Defaults to false. */
  blocked?: boolean;
  /** When false the observer is created but never triggers. Defaults to true. */
  enabled?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  loadMore: () => void;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  rootMargin?: string;
  rootRef?: RefObject<HTMLElement | null>;
};

/**
 * Load-more-on-intersection for infinite lists.
 *
 * The observer is created once per sentinel element (deps are the ref objects,
 * not data), so appending pages never tears down and re-creates it. Recreating
 * the observer on every page append is what let the sentinel — still within the
 * root margin after each append — report "intersecting" again immediately and
 * cascade through every page in a burst. Live data flows through a ref that the
 * observer reads on each event, so a page is only fetched on a real intersection
 * change while the sentinel is actually visible and more pages remain.
 */
export function useStableIntersectionLoadMore(
  options: UseStableIntersectionLoadMoreOptions,
) {
  const {
    blocked = false,
    enabled = true,
    hasNextPage,
    isFetchingNextPage,
    loadMore,
    loadMoreRef,
    rootMargin = '240px 0px',
    rootRef,
  } = options;
  const stateRef = useRef({
    blocked,
    enabled,
    hasNextPage,
    isFetchingNextPage,
    loadMore,
  });

  useEffect(() => {
    stateRef.current = {
      blocked,
      enabled,
      hasNextPage,
      isFetchingNextPage,
      loadMore,
    };
  });

  useEffect(() => {
    if (
      !hasNextPage ||
      typeof IntersectionObserver === 'undefined' ||
      loadMoreRef.current === null
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const state = stateRef.current;

        if (
          entries[0]?.isIntersecting &&
          state.enabled &&
          state.hasNextPage &&
          !state.isFetchingNextPage &&
          !state.blocked
        ) {
          state.loadMore();
        }
      },
      {
        root: rootRef?.current ?? null,
        rootMargin,
      },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, loadMoreRef, rootMargin, rootRef]);
}
