import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type CatalogItem,
  type LibraryItemOwnershipFormat,
  type MyLibraryItemLookupResponse,
  type ReactionSummaryResponse,
} from '@towelbooks/schemas';
import { useRef, useState } from 'react';

import { handleApiProblem } from '../../../features/errors';
import { catalogWorkDetailQueryKey } from '../../../features/catalog/queryKeys';
import { libraryLiveQueryOptions } from '../../../features/libraries/liveQueryOptions';
import { invalidateLibrarySurface } from '../../../features/libraries/queryInvalidation';
import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';

export interface CatalogWorkDetailPageState {
  item: CatalogItem | undefined;
  itemError: unknown;
  refetchItem: () => Promise<unknown>;
  isInLibrary: boolean;
  isAddToLibraryPending: boolean;
  isLibraryLookupError: boolean;
  isLibraryLookupLoading: boolean;
  libraryId: string | null;
  libraryActionErrorMessage: string | null;
  isLikeDisabled: boolean;
  isLikePending: boolean;
  isLiked: boolean;
  likeErrorMessage: string | null;
  onLikeToggle: () => void;
  onAddToLibrary: (formats: LibraryItemOwnershipFormat[]) => void;
}

function catalogWorkReactionSummaryQueryKey(catalogWorkId: string) {
  return ['catalog', 'works', catalogWorkId, 'reaction-summary'] as const;
}

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

export function useCatalogWorkDetailPageState(
  catalogWorkId: string | undefined,
): CatalogWorkDetailPageState {
  const queryClient = useQueryClient();
  const { locale, t } = useI18n();
  const isLikeMutationInFlightRef = useRef(false);
  const [reactionActionError, setReactionActionError] = useState<string | null>(
    null,
  );
  const [libraryActionError, setLibraryActionError] = useState<string | null>(
    null,
  );
  const reactionSummaryQueryKey = catalogWorkReactionSummaryQueryKey(
    catalogWorkId ?? '',
  );

  const {
    data: item,
    error: itemError,
    refetch: refetchItem,
  } = useQuery({
    enabled: Boolean(catalogWorkId),
    queryKey: catalogWorkDetailQueryKey(catalogWorkId ?? '', locale),
    queryFn: () => sdk.catalog.get(catalogWorkId!),
  });

  const libraryLookupQueryKey = myLibraryItemLookupQueryKey(
    catalogWorkId ?? '',
    locale,
  );

  const {
    data: reactionSummary,
    error: reactionSummaryError,
    isLoading: isLoadingReactionSummary,
  } = useQuery({
    enabled: Boolean(catalogWorkId),
    queryKey: reactionSummaryQueryKey,
    queryFn: () =>
      sdk.reactions.summary({
        targetId: catalogWorkId!,
        targetType: 'catalog_work',
      }),
    retry: false,
  });

  const {
    data: libraryLookup,
    error: libraryLookupError,
    isLoading: isLoadingLibraryLookup,
  } = useQuery({
    enabled: Boolean(catalogWorkId),
    queryKey: libraryLookupQueryKey,
    queryFn: () =>
      sdk.libraries.lookupMyLibraryItem({ catalogWorkId: catalogWorkId! }),
    ...libraryLiveQueryOptions,
    retry: false,
  });
  const [libraryLookupOverride, setLibraryLookupOverride] = useState<
    MyLibraryItemLookupResponse | undefined
  >(undefined);
  const effectiveLibraryLookup = libraryLookupOverride ?? libraryLookup;

  const toggleLikeMutation = useMutation({
    mutationFn: async (
      viewerReaction: ReactionSummaryResponse['viewerReaction'],
    ) => {
      if (!catalogWorkId) {
        throw new Error('A catalog work id is required to toggle a reaction.');
      }

      if (viewerReaction === 'like') {
        return sdk.reactions.delete({
          targetId: catalogWorkId,
          targetType: 'catalog_work',
        });
      }

      return sdk.reactions.create({
        reactionType: 'like',
        targetId: catalogWorkId,
        targetType: 'catalog_work',
      });
    },
    onMutate: () => {
      setReactionActionError(null);
    },
    onSuccess: (updatedSummary) => {
      queryClient.setQueryData(reactionSummaryQueryKey, updatedSummary);
      setReactionActionError(null);
    },
    onError: () => {
      setReactionActionError(t('catalog.workDetail.error.toggleLike'));
    },
    onSettled: () => {
      isLikeMutationInFlightRef.current = false;
    },
  });

  const addToLibraryMutation = useMutation({
    mutationFn: async (formats: LibraryItemOwnershipFormat[]) => {
      if (!catalogWorkId) {
        throw new Error('A catalog work id is required to add this work.');
      }

      const libraryId = effectiveLibraryLookup?.libraryId;

      if (!libraryId) {
        throw new Error('A library id is required to add this work.');
      }

      if (formats.length === 0) {
        throw new Error('At least one ownership format is required.');
      }

      const addedItem = await sdk.libraries.addItem(libraryId, {
        ownerships: formats.map((format) => ({ format })),
        catalogWorkId,
      });

      return {
        item: addedItem,
        libraryId,
      };
    },
    onMutate: () => {
      setLibraryActionError(null);
    },
    onSuccess: async ({ item: addedItem, libraryId }) => {
      queryClient.setQueryData<MyLibraryItemLookupResponse>(
        libraryLookupQueryKey,
        {
          item: addedItem,
          libraryId,
        },
      );
      setLibraryLookupOverride({
        item: addedItem,
        libraryId,
      });
      setLibraryActionError(null);
      await queryClient.invalidateQueries({
        exact: true,
        queryKey: libraryLookupQueryKey,
      });
      await invalidateLibrarySurface(queryClient, libraryId);
    },
    onError: (error) => {
      setLibraryActionError(
        handleApiProblem(error, {
          fallbackKey: 'catalog.workDetail.error.addToLibrary',
          messageKeys: {
            CONFLICT: 'catalog.workDetail.error.alreadyInLibrary',
          },
          t,
        }).message,
      );
      void queryClient.invalidateQueries({
        exact: true,
        queryKey: libraryLookupQueryKey,
      });
    },
  });

  return {
    item,
    itemError,
    refetchItem,
    isInLibrary: Boolean(effectiveLibraryLookup?.item),
    isAddToLibraryPending: addToLibraryMutation.isPending,
    isLibraryLookupError: Boolean(libraryLookupError),
    isLibraryLookupLoading: isLoadingLibraryLookup,
    libraryId: effectiveLibraryLookup?.libraryId ?? null,
    libraryActionErrorMessage:
      libraryActionError ??
      (libraryLookupError
        ? t('catalog.workDetail.error.loadLibraryStatus')
        : null),
    isLikeDisabled: Boolean(reactionSummaryError) || isLoadingReactionSummary,
    isLikePending: toggleLikeMutation.isPending,
    isLiked: reactionSummary?.viewerReaction === 'like',
    likeErrorMessage:
      reactionActionError ??
      (reactionSummaryError ? t('catalog.workDetail.error.loadLikes') : null),
    onLikeToggle: () => {
      if (isLikeMutationInFlightRef.current) {
        return;
      }

      isLikeMutationInFlightRef.current = true;
      toggleLikeMutation.mutate(reactionSummary?.viewerReaction ?? null);
    },
    onAddToLibrary: (formats) => addToLibraryMutation.mutate(formats),
  };
}
