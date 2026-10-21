import { catalogWorkRatingsQueryKey, viewerRatingQueryKey } from './queries';

import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { Rating } from '@towelbooks/schemas';

export type CatalogWorkRatingsPage = {
  items: Rating[];
  page: number;
  pageSize: number;
  total: number;
};

export function setViewerRatingCache(
  queryClient: Pick<QueryClient, 'setQueryData'>,
  catalogWorkId: string,
  rating: Rating | null,
) {
  queryClient.setQueryData(viewerRatingQueryKey(catalogWorkId), {
    item: rating,
  });
}

export function removeRatingFromListCache(
  queryClient: Pick<QueryClient, 'setQueryData'>,
  catalogWorkId: string,
  ratingId: string,
) {
  queryClient.setQueryData<InfiniteData<CatalogWorkRatingsPage>>(
    catalogWorkRatingsQueryKey(catalogWorkId),
    (current) => {
      if (!current) {
        return current;
      }

      const ratingExists = current.pages.some((page) =>
        page.items.some((item) => item.id === ratingId),
      );

      if (!ratingExists) {
        return current;
      }

      return {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          items: page.items.filter((item) => item.id !== ratingId),
          total: Math.max(page.total - 1, 0),
        })),
      };
    },
  );
}
