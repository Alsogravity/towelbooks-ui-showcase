import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../auth/AuthContext';
import { sdk } from '../../lib/sdk';

export const adminMeQueryKey = ['admin', 'me'] as const;

export function useSystemAdminStatus() {
  const { isAuthenticated } = useAuth();
  const query = useQuery({
    enabled: isAuthenticated,
    queryKey: adminMeQueryKey,
    queryFn: () => sdk.admin.getMe(),
    retry: false,
  });

  return {
    error: query.error,
    isLoading: isAuthenticated && query.isPending,
    isSystemAdmin:
      isAuthenticated && query.data?.operator.isSystemAdmin === true,
    refetch: query.refetch,
  };
}
