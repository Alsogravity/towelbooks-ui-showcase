import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type LibraryItem,
  type UpdateLibraryItemRequest,
} from '@towelbooks/schemas';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { useToast } from '../../components/feedback';
import {
  invalidateLibrarySurface,
  libraryItemQueryKey,
} from './queryInvalidation';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';
import { createApiProblemToast } from '../errors';

type LibraryItemDetailDraft = {
  note: string;
};

function createDraftState(item: LibraryItem): LibraryItemDetailDraft {
  return {
    note: item.personalNote ?? '',
  };
}

function serializeNote(note: string): UpdateLibraryItemRequest {
  return {
    personalNote: note.trim() || null,
  };
}

export function useLibraryItemDetailForm(item: LibraryItem, libraryId: string) {
  const { locale, t } = useI18n();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const baselineDraft = useMemo(() => createDraftState(item), [item]);
  const [draft, setDraft] = useState(baselineDraft);

  const updateMutation = useMutation({
    mutationFn: (updates: UpdateLibraryItemRequest) =>
      sdk.libraries.updateItem(libraryId, item.id, updates),
    onSuccess: async (updatedItem) => {
      setDraft(createDraftState(updatedItem));
      await invalidateLibrarySurface(queryClient, libraryId);
      await queryClient.invalidateQueries({
        exact: true,
        queryKey: libraryItemQueryKey(libraryId, item.id, locale, 'owner'),
      });
      pushToast({
        title: t('myLibrary.items.update.success'),
        variant: 'success',
      });
    },
    onError: (error) => {
      pushToast(
        createApiProblemToast(error, {
          fallbackKey: 'myLibrary.items.update.error',
          t,
        }),
      );
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => sdk.libraries.removeItem(libraryId, item.id),
    onSuccess: async () => {
      await invalidateLibrarySurface(queryClient, libraryId);
      navigate(`/libraries/${libraryId}`);
    },
    onError: (error) => {
      pushToast(
        createApiProblemToast(error, {
          fallbackKey: 'myLibrary.items.remove.error',
          t,
        }),
      );
    },
  });

  return {
    draft,
    handleRemove() {
      removeMutation.mutate();
    },
    saveNote(note: string) {
      return updateMutation.mutateAsync(serializeNote(note));
    },
    isRemoving: removeMutation.isPending,
    isSaving: updateMutation.isPending,
  };
}
