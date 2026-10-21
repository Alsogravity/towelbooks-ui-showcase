import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { Alert, Button, ButtonLink } from '../../../../components/primitives';
import { handleApiProblem } from '../../../../features/errors';
import { libraryLiveQueryOptions } from '../../../../features/libraries/liveQueryOptions';
import {
  libraryItemsQueryKey,
  libraryQueryKey,
} from '../../../../features/libraries/queryInvalidation';
import { useI18n } from '../../../../i18n';
import { sdk } from '../../../../lib/sdk';

import type { MyLibraryItemLookupResponse, Reading } from '@towelbooks/schemas';

type ActionErrorState = {
  lookupIdentity: string;
  message: string;
};

function myLibraryItemLookupQueryKey(catalogWorkId: string, locale: string) {
  return [
    'libraries',
    'my-library',
    'items',
    'lookup',
    catalogWorkId,
    locale,
  ] as const;
}

export function ReadingLibraryAction({ reading }: { reading: Reading }) {
  const { locale, t } = useI18n();
  const queryClient = useQueryClient();
  const catalogWorkId = reading.catalogWorkId;
  const lookupIdentity = catalogWorkId;
  const lookupQueryKey = myLibraryItemLookupQueryKey(catalogWorkId, locale);

  const [actionError, setActionError] = useState<ActionErrorState | null>(null);

  const {
    data: lookupData,
    error: lookupError,
    isLoading,
  } = useQuery({
    queryKey: lookupQueryKey,
    queryFn: () => sdk.libraries.lookupMyLibraryItem({ catalogWorkId }),
    ...libraryLiveQueryOptions,
    retry: false,
  });
  const lookup = lookupData;

  const addToLibraryMutation = useMutation({
    mutationFn: async () => {
      const libraryId = lookup?.libraryId;

      if (!libraryId) {
        throw new Error('A library id is required to add this reading.');
      }

      const item = await sdk.libraries.addItem(libraryId, {
        catalogWorkId,
      });

      return { item, libraryId };
    },
    onMutate: () => {
      setActionError(null);
    },
    onSuccess: async ({ item, libraryId }) => {
      const next: MyLibraryItemLookupResponse = { item, libraryId };
      queryClient.setQueryData<MyLibraryItemLookupResponse>(
        lookupQueryKey,
        next,
      );
      await Promise.all([
        queryClient.invalidateQueries({
          exact: true,
          queryKey: libraryQueryKey(libraryId),
        }),
        queryClient.invalidateQueries({
          exact: true,
          queryKey: libraryItemsQueryKey(libraryId),
        }),
      ]);
    },
    onError: (error) => {
      setActionError({
        lookupIdentity,
        message: handleApiProblem(error, {
          fallbackKey: 'rooms.reading.library.error.add',
          messageKeys: {
            CONFLICT: 'rooms.reading.library.error.duplicate',
          },
          t,
        }).message,
      });
      void queryClient.invalidateQueries({
        exact: true,
        queryKey: lookupQueryKey,
      });
    },
  });

  if (isLoading) {
    return (
      <div
        aria-hidden="true"
        className="h-9 w-44 animate-pulse rounded-full bg-vellum"
      />
    );
  }

  const item = lookup?.item ?? null;

  if (item && lookup) {
    const isReading = item.readingSummary.statusCounts.reading > 0;

    return (
      <ButtonLink
        to={`/libraries/${lookup.libraryId}/items/${item.id}`}
        variant="primary"
        size="sm"
      >
        {isReading
          ? t('rooms.reading.library.continue')
          : t('rooms.reading.library.open')}
      </ButtonLink>
    );
  }

  const errorMessage =
    (actionError?.lookupIdentity === lookupIdentity
      ? actionError.message
      : null) ?? (lookupError ? t('rooms.reading.library.error.status') : null);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="primary"
        size="sm"
        disabled={addToLibraryMutation.isPending || Boolean(lookupError)}
        onClick={() => addToLibraryMutation.mutate()}
      >
        {addToLibraryMutation.isPending
          ? t('rooms.reading.library.adding')
          : t('rooms.reading.library.add')}
      </Button>
      {errorMessage ? <Alert variant="warning">{errorMessage}</Alert> : null}
    </div>
  );
}
