import { useMutation, type QueryClient } from '@tanstack/react-query';
import { useCallback, type MutableRefObject } from 'react';
import type { NavigateFunction } from 'react-router';

import {
  buildCatalogReviewsTabHref,
  type CatalogReviewEditorMode,
} from './catalogReviewEditorShared';
import {
  buildCatalogReviewLocationState,
  type CatalogReviewOrigin,
} from './catalogReviewNavigation';
import { invalidateCatalogReviewSurface } from './queries';
import { applyApiValidationErrors, handleApiProblem } from '../errors';

import type { CatalogReview } from '@towelbooks/schemas';
import type { CatalogReviewEditorFormValues } from './catalogReviewEditorCopy';
import type { AppLocale, useI18n } from '../../i18n';
import type { useToast } from '../../components/feedback';
import type { UseFormReset, UseFormSetError } from 'react-hook-form';

interface UseCatalogReviewEditorMutationsOptions {
  currentReflection: CatalogReview | null;
  linkedCatalogWork: { catalogWorkId: string; title: string };
  mode: CatalogReviewEditorMode;
  navigate: NavigateFunction;
  pushToast: ReturnType<typeof useToast>['pushToast'];
  queryClient: QueryClient;
  reset: UseFormReset<CatalogReviewEditorFormValues>;
  sdk: typeof import('../../lib/sdk').sdk;
  setError: UseFormSetError<CatalogReviewEditorFormValues>;
  setServerError: (value: string | null) => void;
  locale: AppLocale;
  t: ReturnType<typeof useI18n>['t'];
  isDirty: boolean;
  allowProgrammaticNavigationRef: MutableRefObject<boolean>;
  origin: CatalogReviewOrigin | null;
}

export function useCatalogReviewEditorMutations({
  allowProgrammaticNavigationRef,
  currentReflection,
  isDirty,
  linkedCatalogWork,
  mode,
  navigate,
  pushToast,
  queryClient,
  reset,
  sdk,
  setError,
  setServerError,
  locale,
  t,
  origin,
}: UseCatalogReviewEditorMutationsOptions) {
  const handleMutationError = useCallback(
    (error: unknown) => {
      if (applyApiValidationErrors(error, setError) > 0) {
        return;
      }

      setServerError(
        handleApiProblem(error, {
          fallbackKey: 'catalog.catalogReviewEditor.error.save',
          t,
        }).message,
      );
    },
    [setError, setServerError, t],
  );

  const saveDraftMutation = useMutation({
    mutationFn: async (values: CatalogReviewEditorFormValues) => {
      if (mode === 'create') {
        return sdk.catalogReviews.create({
          body: values.body,
          catalogWorkId: linkedCatalogWork.catalogWorkId,
          title: values.title,
        });
      }

      return sdk.catalogReviews.update(currentReflection!.id, {
        body: values.body,
        title: values.title,
      });
    },
    onSuccess: async (reflection) => {
      setServerError(null);
      await invalidateCatalogReviewSurface(
        queryClient,
        reflection.catalogWorkId,
        locale,
      );

      if (mode === 'create') {
        allowProgrammaticNavigationRef.current = true;
        navigate(`/catalog-reviews/${encodeURIComponent(reflection.id)}/edit`, {
          replace: true,
          state: buildCatalogReviewLocationState(origin),
        });
        return;
      }

      reset({
        body: reflection.body,
        title: reflection.title,
      });
      pushToast({
        variant: 'success',
        title: t('catalog.catalogReviewEditor.success.draftSaved'),
      });
    },
    onError: (error) => {
      void handleMutationError(error);
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (values: CatalogReviewEditorFormValues) => {
      let reflectionId = currentReflection?.id ?? null;

      if (mode === 'create') {
        const createdReflection = await sdk.catalogReviews.create({
          body: values.body,
          catalogWorkId: linkedCatalogWork.catalogWorkId,
          title: values.title,
        });

        reflectionId = createdReflection.id;
      } else if (currentReflection && isDirty) {
        await sdk.catalogReviews.update(currentReflection.id, {
          body: values.body,
          title: values.title,
        });
      }

      if (!reflectionId) {
        throw new Error('A reflection id is required before publishing.');
      }

      return sdk.catalogReviews.publish(reflectionId);
    },
    onSuccess: async (reflection) => {
      setServerError(null);
      await invalidateCatalogReviewSurface(
        queryClient,
        reflection.catalogWorkId,
        locale,
      );
      allowProgrammaticNavigationRef.current = true;
      navigate(buildCatalogReviewsTabHref(reflection.catalogWorkId), {
        replace: true,
      });
    },
    onError: (error) => {
      if (applyApiValidationErrors(error, setError) > 0) {
        return;
      }

      setServerError(
        handleApiProblem(error, {
          fallbackKey: 'catalog.catalogReviewEditor.error.publish',
          t,
        }).message,
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: CatalogReviewEditorFormValues) => {
      if (!currentReflection) {
        throw new Error('A published reflection is required before updating.');
      }

      return sdk.catalogReviews.update(currentReflection.id, {
        body: values.body,
        title: values.title,
      });
    },
    onSuccess: async (reflection) => {
      setServerError(null);
      await invalidateCatalogReviewSurface(
        queryClient,
        reflection.catalogWorkId,
        locale,
      );
      reset({
        body: reflection.body,
        title: reflection.title,
      });
      pushToast({
        variant: 'success',
        title: t('catalog.catalogReviewEditor.success.updated'),
      });
    },
    onError: (error) => {
      void handleMutationError(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!currentReflection) {
        throw new Error('A reflection is required before deletion.');
      }

      await sdk.catalogReviews.delete(currentReflection.id);

      return currentReflection.catalogWorkId;
    },
    onSuccess: async (catalogWorkId) => {
      setServerError(null);
      await invalidateCatalogReviewSurface(queryClient, catalogWorkId, locale);
      allowProgrammaticNavigationRef.current = true;
      navigate(buildCatalogReviewsTabHref(catalogWorkId), { replace: true });
    },
    onError: (error) => {
      setServerError(
        handleApiProblem(error, {
          fallbackKey: 'catalog.catalogReviewEditor.error.delete',
          t,
        }).message,
      );
    },
  });

  return {
    deleteMutation,
    publishMutation,
    saveDraftMutation,
    updateMutation,
  };
}
