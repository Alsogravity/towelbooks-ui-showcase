import { useQuery } from '@tanstack/react-query';
import { type ContinueReadingResponse } from '@towelbooks/schemas';

import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';

export type ContinueReadingQueryResult = {
  data: ContinueReadingResponse | null;
  isLoading: boolean;
  isError: boolean;
};

export function useContinueReading(): ContinueReadingQueryResult {
  const { locale } = useI18n();
  const query = useQuery({
    queryFn: () => sdk.users.me.getContinueReading(),
    queryKey: ['users', 'me', 'continue-reading', locale],
    staleTime: 60_000,
  });

  return {
    data: query.data ?? null,
    isError: query.isError,
    isLoading: query.isLoading,
  };
}
