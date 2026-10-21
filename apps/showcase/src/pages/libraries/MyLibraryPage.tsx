import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { LibraryDetailScreen } from './LibraryDetailScreen';
import { ErrorState, LoadingState } from '../../components/feedback';
import { PageStateShell } from '../../components/layout';
import { Button } from '../../components/primitives';
import { useAuth } from '../../features/auth/AuthContext';
import { libraryLiveQueryOptions } from '../../features/libraries/liveQueryOptions';
import {
  libraryQueryKey,
  MY_LIBRARY_QUERY_KEY,
} from '../../features/libraries/queryInvalidation';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';

export function MyLibraryPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const knownLibraryId = user?.defaultLibraryId ?? null;

  // When auth already carries defaultLibraryId, skip the serial getMyLibrary
  // gate and let LibraryDetailScreen fetch library + items in parallel.
  const libraryQuery = useQuery({
    enabled: knownLibraryId === null,
    queryKey: MY_LIBRARY_QUERY_KEY,
    queryFn: () => sdk.libraries.getMyLibrary(),
    ...libraryLiveQueryOptions,
  });
  const library = libraryQuery.data;
  const libraryId = knownLibraryId ?? library?.id ?? null;

  useEffect(() => {
    if (library) {
      queryClient.setQueryData(libraryQueryKey(library.id), library);
    }
  }, [library, queryClient]);

  if (knownLibraryId === null && libraryQuery.isLoading) {
    return (
      <PageStateShell>
        <LoadingState label={{ key: 'myLibrary.loading' }} />
      </PageStateShell>
    );
  }

  if (knownLibraryId === null && (libraryQuery.isError || !libraryId)) {
    return (
      <PageStateShell>
        <ErrorState
          title={{ key: 'libraries.error.title' }}
          body={{ key: 'libraries.error.body' }}
          action={
            <Button
              variant="secondary"
              onClick={() => void libraryQuery.refetch()}
            >
              {t('myLibrary.items.retry')}
            </Button>
          }
        />
      </PageStateShell>
    );
  }

  if (!libraryId) {
    return (
      <PageStateShell>
        <ErrorState
          title={{ key: 'libraries.error.title' }}
          body={{ key: 'libraries.error.body' }}
        />
      </PageStateShell>
    );
  }

  return (
    <LibraryDetailScreen
      libraryId={libraryId}
      initialLibrary={library ?? null}
      isOwnLibrary
    />
  );
}
