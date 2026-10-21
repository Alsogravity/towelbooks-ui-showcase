import { useQuery } from '@tanstack/react-query';

import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';
import { homeCatalogQueryKey } from '../../../features/catalog/queryKeys';

import type { ContinueCatalogWork } from '../content';

import type { CatalogSearchCandidate } from '@towelbooks/schemas';

type DashboardCatalogSection = {
  items: ContinueCatalogWork[];
  isError: boolean;
  isLoading: boolean;
  onRetry: () => void;
};

function mapCatalogCandidate(
  item: CatalogSearchCandidate,
): ContinueCatalogWork {
  return {
    author: item.contributors[0] ?? null,
    coverThumbnailUrl: item.display.coverThumbnailUrl,
    coverUrl: item.display.coverUrl,
    coverGeometry: item.display.coverGeometry ?? null,
    href: `/catalog/${item.catalogWorkId}`,
    theme: 0,
    title: item.display.title,
  };
}

export function useDashboardCatalog(): {
  forYou: DashboardCatalogSection;
  discover: DashboardCatalogSection;
} {
  const { locale } = useI18n();

  const query = useQuery({
    queryFn: () => sdk.users.me.getHome(),
    queryKey: homeCatalogQueryKey(locale),
    staleTime: 120_000,
  });

  return {
    forYou: {
      items: (query.data?.forYou ?? []).map(mapCatalogCandidate),
      isError: query.isError,
      isLoading: query.isLoading,
      onRetry: () => void query.refetch(),
    },
    discover: {
      items: (query.data?.discover ?? []).map(mapCatalogCandidate),
      isError: query.isError,
      isLoading: query.isLoading,
      onRetry: () => void query.refetch(),
    },
  };
}
