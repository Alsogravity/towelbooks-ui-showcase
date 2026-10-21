import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type MyLibraryItemLookupResponse } from '@towelbooks/schemas';

import { useToast } from '../../../components/feedback';
import { Button } from '../../../components/primitives';
import { type CatalogWorkPickerResult } from '../../../features/catalog/CatalogWorkPicker';
import { createApiProblemToast } from '../../../features/errors';
import { libraryLiveQueryOptions } from '../../../features/libraries/liveQueryOptions';
import { invalidateLibrarySurface } from '../../../features/libraries/queryInvalidation';
import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';

export type CatalogLibraryCandidateActionProps = {
  libraryId: string;
} & CatalogWorkPickerResult;

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

export function CatalogLibraryCandidateAction({
  libraryId,
  catalogWorkId,
}: CatalogLibraryCandidateActionProps) {
  const { locale, t } = useI18n();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const lookupQueryKey = myLibraryItemLookupQueryKey(catalogWorkId, locale);

  const {
    data: lookup,
    error: lookupError,
    isLoading: isLookupLoading,
  } = useQuery({
    queryKey: lookupQueryKey,
    queryFn: () => sdk.libraries.lookupMyLibraryItem({ catalogWorkId }),
    ...libraryLiveQueryOptions,
    retry: false,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const item = await sdk.libraries.addItem(libraryId, {
        catalogWorkId,
      });

      return { item, libraryId };
    },
    onSuccess: async ({ item, libraryId: resolvedLibraryId }) => {
      queryClient.setQueryData<MyLibraryItemLookupResponse>(lookupQueryKey, {
        item,
        libraryId: resolvedLibraryId,
      });
      await invalidateLibrarySurface(queryClient, resolvedLibraryId);
    },
    onError: (error) => {
      pushToast(
        createApiProblemToast(error, {
          fallbackKey: 'myLibrary.search.error.add',
          messageKeys: { CONFLICT: 'myLibrary.search.error.duplicate' },
          t,
        }),
      );
      void queryClient.invalidateQueries({
        exact: true,
        queryKey: lookupQueryKey,
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async () => {
      const resolvedLibraryId = lookup?.libraryId ?? libraryId;
      const libraryItemId = lookup?.item?.id;

      if (!resolvedLibraryId || !libraryItemId) {
        throw new Error('A library item is required to remove this book.');
      }

      await sdk.libraries.removeItem(resolvedLibraryId, libraryItemId);
      return { libraryId: resolvedLibraryId };
    },
    onSuccess: async ({ libraryId: resolvedLibraryId }) => {
      queryClient.setQueryData<MyLibraryItemLookupResponse>(lookupQueryKey, {
        item: null,
        libraryId: resolvedLibraryId,
      });
      await invalidateLibrarySurface(queryClient, resolvedLibraryId);
    },
    onError: (error) => {
      pushToast(
        createApiProblemToast(error, {
          fallbackKey: 'myLibrary.items.remove.error',
          t,
        }),
      );
      void queryClient.invalidateQueries({
        exact: true,
        queryKey: lookupQueryKey,
      });
    },
  });

  const isInLibrary = Boolean(lookup?.item);
  const isActionPending = addMutation.isPending || removeMutation.isPending;

  return (
    <>
      {isLookupLoading ? (
        <div
          aria-hidden="true"
          className="h-8 w-full max-w-40 animate-pulse rounded-full bg-paper-2"
        />
      ) : (
        <Button
          size="sm"
          variant={isInLibrary ? 'danger' : 'secondary'}
          isLoading={isActionPending}
          loadingLabel={
            isInLibrary
              ? t('myLibrary.search.removing')
              : t('myLibrary.search.adding')
          }
          disabled={Boolean(lookupError)}
          onClick={() => {
            if (isInLibrary) {
              removeMutation.mutate();
              return;
            }

            addMutation.mutate();
          }}
        >
          {isInLibrary
            ? t('myLibrary.search.remove')
            : t('myLibrary.search.add')}
        </Button>
      )}
    </>
  );
}
