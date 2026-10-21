/**
 * Library surface query defaults for the MVP.
 *
 * No polling: mutations invalidate the library surface, and focus refetch
 * covers the common “switched tabs and came back” case without a 10s timer.
 */
export const libraryLiveQueryOptions = {
  refetchOnWindowFocus: true,
  staleTime: 30_000,
} as const;
