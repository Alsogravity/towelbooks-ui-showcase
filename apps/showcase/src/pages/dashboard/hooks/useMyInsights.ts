import { useQuery } from '@tanstack/react-query';
import { type MyInsightsResponse } from '@towelbooks/schemas';

import { sdk } from '../../../lib/sdk';

export type MyInsightsQueryResult = {
  data: MyInsightsResponse | null;
  isLoading: boolean;
  isError: boolean;
};

export function useMyInsights(): MyInsightsQueryResult {
  const query = useQuery({
    queryFn: () => sdk.users.me.getInsights(),
    queryKey: ['users', 'me', 'insights'],
    staleTime: 60_000,
  });

  return {
    data: query.data ?? null,
    isError: query.isError,
    isLoading: query.isLoading,
  };
}
