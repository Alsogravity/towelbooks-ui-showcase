import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';

import { removeRatingFromListCache, setViewerRatingCache } from './cache';
import {
  invalidateCatalogRatingSurface,
  catalogWorkRatingsQueryKey,
  RATINGS_PAGE_SIZE,
  viewerRatingQueryKey,
} from './queries';
import { useStableIntersectionLoadMore } from '../../hooks/useStableIntersectionLoadMore';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';
import { useAuth } from '../auth/AuthContext';
import { handleApiProblem } from '../errors/handleApiProblem';
import { invalidateLibraryRatingSurface } from '../libraries/queryInvalidation';

export function useCatalogRatingsPanel(
  catalogWorkId: string,
  {
    enabled = true,
    includeCommunity = true,
  }: { enabled?: boolean; includeCommunity?: boolean } = {},
) {
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { formatDate, locale, t } = useI18n();
  const [draftRating, setDraftRating] = useState(0);
  const [draftNote, setDraftBody] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const reviewsQuery = useInfiniteQuery({
    enabled: includeCommunity,
    initialPageParam: 1,
    queryKey: catalogWorkRatingsQueryKey(catalogWorkId),
    queryFn: ({ pageParam }) =>
      sdk.ratings.listForCatalogWork(catalogWorkId, {
        page: pageParam,
        pageSize: RATINGS_PAGE_SIZE,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce(
        (total, page) => total + page.items.length,
        0,
      );

      if (loadedCount >= lastPage.total) {
        return undefined;
      }

      return lastPage.page + 1;
    },
  });
  const viewerReviewQuery = useQuery({
    enabled: enabled && isAuthenticated,
    queryKey: viewerRatingQueryKey(catalogWorkId),
    queryFn: () => sdk.ratings.getViewerForCatalogWork(catalogWorkId),
  });

  const viewerReview = viewerReviewQuery.data?.item ?? null;
  const {
    error: reviewsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isCommunityLoading,
    refetch: refetchReviews,
  } = reviewsQuery;
  const isReviewsLoading = includeCommunity && isCommunityLoading;
  const publicReviews = useMemo(
    () => reviewsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [reviewsQuery.data],
  );
  const otherPublicReviews = useMemo(
    () => publicReviews.filter((review) => review.id !== viewerReview?.id),
    [publicReviews, viewerReview?.id],
  );
  const shouldShowReviewForm = !viewerReview || isEditing;

  useStableIntersectionLoadMore({
    hasNextPage,
    isFetchingNextPage,
    loadMore: () => void fetchNextPage(),
    loadMoreRef,
    rootMargin: '320px 0px',
  });

  const upsertMutation = useMutation({
    mutationFn: async () => {
      if (draftRating < 1 || draftRating > 5) {
        throw new Error('A rating between 1 and 5 is required.');
      }

      const trimmedNote = draftNote.trim();

      if (viewerReview) {
        return sdk.ratings.update(viewerReview.id, {
          note: trimmedNote.length > 0 ? trimmedNote : null,
          rating: draftRating,
        });
      }

      return sdk.ratings.create({
        catalogWorkId,
        note: trimmedNote.length > 0 ? trimmedNote : undefined,
        rating: draftRating,
      });
    },
    onError: (error) => {
      if (
        error instanceof Error &&
        error.message === 'A rating between 1 and 5 is required.'
      ) {
        setFormError(t('catalog.workDetail.ratings.form.ratingRequired'));
        return;
      }

      setFormError(
        handleApiProblem(error, {
          fallback: 'Unable to save your rating right now.',
          fallbackKey: 'catalog.workDetail.ratings.form.error',
          t,
        }).message,
      );
    },
    onSuccess: async (rating) => {
      setViewerRatingCache(queryClient, catalogWorkId, rating);
      setIsEditing(false);
      setFormError(null);
      await invalidateLibraryRatingSurface(queryClient);
      await invalidateCatalogRatingSurface(queryClient, catalogWorkId, locale);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!viewerReview) {
        throw new Error('A rating is required before deletion.');
      }

      return sdk.ratings.delete(viewerReview.id);
    },
    onError: (error) => {
      setFormError(
        handleApiProblem(error, {
          fallback: 'Unable to delete your rating right now.',
          fallbackKey: 'catalog.workDetail.ratings.deleteError',
          t,
        }).message,
      );
    },
    onSuccess: async () => {
      if (viewerReview) {
        removeRatingFromListCache(queryClient, catalogWorkId, viewerReview.id);
      }
      setViewerRatingCache(queryClient, catalogWorkId, null);
      setIsEditing(false);
      setIsDeleteDialogOpen(false);
      setDraftRating(0);
      setDraftBody('');
      setFormError(null);
      await invalidateLibraryRatingSurface(queryClient);
      await invalidateCatalogRatingSurface(queryClient, catalogWorkId, locale);
    },
  });

  function closeForm() {
    if (!viewerReview) {
      return;
    }

    setDraftRating(viewerReview.rating);
    setDraftBody(viewerReview.note ?? '');
    setFormError(null);
    setIsEditing(false);
  }

  function startEditing() {
    if (!viewerReview) {
      return;
    }

    setDraftRating(viewerReview.rating);
    setDraftBody(viewerReview.note ?? '');
    setFormError(null);
    setIsEditing(true);
  }

  return {
    draftNote,
    draftRating,
    fetchNextPage,
    formatDate,
    formError,
    hasNextPage,
    isAuthenticated,
    isAuthLoading,
    isDeleteDialogOpen,
    isDeletingRating: deleteMutation.isPending,
    isEditing,
    isFetchingNextPage,
    isReviewsLoading,
    isSavingRating: upsertMutation.isPending,
    isViewerRatingLoading: viewerReviewQuery.isLoading,
    loadMoreRef,
    otherPublicReviews,
    reviewsError,
    setDraftBody: (value: string) => {
      setDraftBody(value);
      setFormError(null);
    },
    setDraftRating: (rating: number) => {
      setDraftRating(rating);
      setFormError(null);
    },
    shouldShowReviewForm,
    t,
    viewerReview,
    viewerReviewError: viewerReviewQuery.isError,
    closeDeleteDialog: () => setIsDeleteDialogOpen(false),
    closeForm,
    confirmDelete: () => deleteMutation.mutate(),
    dismissFormError: () => setFormError(null),
    openDeleteDialog: () => setIsDeleteDialogOpen(true),
    retryReviews: () => void refetchReviews(),
    startEditing,
    submitReview: () => upsertMutation.mutate(),
  };
}
