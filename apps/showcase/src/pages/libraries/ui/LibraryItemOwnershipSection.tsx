import {
  LIBRARY_ITEM_OWNERSHIPS_MAX_COUNT,
  type LibraryItem,
  type LibraryItemOwnership,
} from '@towelbooks/schemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useToast } from '../../../components/feedback';
import { Button, Card, Icon } from '../../../components/primitives';
import { createApiProblemToast } from '../../../features/errors';
import { invalidateLibraryItemReadingSessionSurface } from '../../../features/libraries/queryInvalidation';
import { useI18n } from '../../../i18n';
import { useIsBelowSmViewport } from '../../../layouts/app/shellViewport';
import { sdk } from '../../../lib/sdk';

import { LibrarySection } from './LibrarySection';
import {
  ownershipConditionLabelKeys,
  ownershipFormatLabelKeys,
  ownershipPlatformLabelKeys,
  ownershipSourceLabelKeys,
} from './libraryPageShared';
import {
  getOwnershipSummaryLabel,
  OwnershipDialog,
  serializeOwnershipDraft,
  type OwnershipDraft,
} from './OwnershipDialog';
import { OwnershipDeleteDialog } from './OwnershipDeleteDialog';

import type { IconName } from '@towelbooks/ui';

type OwnershipEditorState =
  { mode: 'create' } | { mode: 'edit'; ownership: LibraryItemOwnership };

type OwnershipDeleteState = {
  ownership: LibraryItemOwnership;
  returnFocusElement: HTMLElement | null;
};

type OwnershipDetail = {
  icon: IconName;
  label: string;
  value: string;
};

const ownershipFormatIcons: Record<LibraryItemOwnership['format'], IconName> = {
  audiobook: 'book-audio',
  ebook: 'book',
  physical: 'book-text',
};

function OwnershipRow({
  onDelete,
  onEdit,
  ownership,
}: {
  onDelete: (triggerElement: HTMLElement) => void;
  onEdit: () => void;
  ownership: LibraryItemOwnership;
}) {
  const { formatDate, t } = useI18n();
  const isPhysical = ownership.format === 'physical';
  const details: OwnershipDetail[] = [];

  if (ownership.source) {
    details.push({
      icon: 'bookmark',
      label: t('myLibrary.items.ownership.sourceLabel'),
      value: t(ownershipSourceLabelKeys[ownership.source]),
    });
  }

  if (ownership.acquiredAt) {
    details.push({
      icon: 'calendar',
      label: t('myLibrary.items.ownership.acquiredAtLabel'),
      value: formatDate(new Date(`${ownership.acquiredAt}T00:00:00`), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    });
  }

  if (isPhysical && ownership.condition) {
    details.push({
      icon: 'book-check',
      label: t('myLibrary.items.ownership.conditionLabel'),
      value: t(ownershipConditionLabelKeys[ownership.condition]),
    });
  }

  if (!isPhysical && ownership.platform) {
    details.push({
      icon: 'monitor-smartphone',
      label: t('myLibrary.items.ownership.platformLabel'),
      value: t(ownershipPlatformLabelKeys[ownership.platform]),
    });
  }

  const note = ownership.note?.trim() || null;

  return (
    <li>
      <Card className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Icon
              name={ownershipFormatIcons[ownership.format]}
              size={20}
              strokeWidth={1.7}
            />
            <p className="app-text-row-title min-w-0 text-ink">
              {t(ownershipFormatLabelKeys[ownership.format])}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              aria-label={t('myLibrary.items.ownership.editAria', {
                values: { format: getOwnershipSummaryLabel(t, ownership) },
              })}
              icon="pencil-line"
              iconSize={20}
              size="sm"
              variant="ghost"
              onClick={onEdit}
            />
            <Button
              aria-label={t('myLibrary.items.ownership.deleteAria', {
                values: { format: getOwnershipSummaryLabel(t, ownership) },
              })}
              className="text-brick hover:text-brick-2"
              icon="trash-2"
              iconSize={20}
              size="sm"
              variant="ghost"
              onClick={(event) => onDelete(event.currentTarget)}
            />
          </div>
        </div>

        {details.length > 0 ? (
          <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-rule/30 pt-2">
            {details.map(({ icon, label, value }) => (
              <div
                key={label}
                className="inline-flex min-w-0 items-center gap-2 text-ink-2"
              >
                <dt className="sr-only">{label}</dt>
                <dd className="app-text-body-sm inline-flex min-w-0 items-center gap-2">
                  <Icon name={icon} size={16} strokeWidth={1.7} />
                  <span className="truncate">{value}</span>
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {note ? (
          <div className="border-t border-rule/30 pt-2">
            <p className="app-text-body-sm whitespace-pre-wrap text-ink-2">
              <span className="sr-only">
                {t('myLibrary.items.ownership.noteLabel')}
              </span>
              {note}
            </p>
          </div>
        ) : null}
      </Card>
    </li>
  );
}

export function LibraryItemOwnershipSection({
  item,
  libraryId,
}: {
  item: LibraryItem;
  libraryId: string;
}) {
  const { t } = useI18n();
  const isBelowSm = useIsBelowSmViewport();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [editorState, setEditorState] = useState<OwnershipEditorState | null>(
    null,
  );
  const [deleteState, setDeleteState] = useState<OwnershipDeleteState | null>(
    null,
  );

  const refresh = () =>
    invalidateLibraryItemReadingSessionSurface(
      queryClient,
      libraryId,
      item.id,
      'owner',
    );
  const showError = (error: unknown) => {
    pushToast(
      createApiProblemToast(error, {
        fallbackKey: 'myLibrary.items.ownership.error.save',
        t,
      }),
    );
  };

  const createMutation = useMutation({
    mutationFn: (draft: OwnershipDraft) =>
      sdk.libraries.createItemOwnership(
        libraryId,
        item.id,
        serializeOwnershipDraft(draft),
      ),
    onError: showError,
    onSuccess: async () => {
      await refresh();
      pushToast({
        title: t('myLibrary.items.ownership.created'),
        variant: 'success',
      });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({
      draft,
      ownershipId,
    }: {
      draft: OwnershipDraft;
      ownershipId: string;
    }) =>
      sdk.libraries.updateItemOwnership(
        libraryId,
        item.id,
        ownershipId,
        serializeOwnershipDraft(draft),
      ),
    onError: showError,
    onSuccess: refresh,
  });
  const deleteMutation = useMutation({
    mutationFn: (ownershipId: string) =>
      sdk.libraries.removeItemOwnership(libraryId, item.id, ownershipId),
    onError: showError,
    onSuccess: async () => {
      await refresh();
      pushToast({
        message: t('myLibrary.items.ownership.detachedContext'),
        title: t('myLibrary.items.ownership.deleted'),
        variant: 'success',
      });
    },
  });

  const atOwnershipLimit =
    item.ownerships.length >= LIBRARY_ITEM_OWNERSHIPS_MAX_COUNT;

  const handleEditorSubmit = async (draft: OwnershipDraft) => {
    if (!editorState) {
      return;
    }

    if (editorState.mode === 'create') {
      await createMutation.mutateAsync(draft);
    } else {
      await updateMutation.mutateAsync({
        draft,
        ownershipId: editorState.ownership.id,
      });
    }
    setEditorState(null);
  };

  return (
    <LibrarySection
      actions={
        isBelowSm ? (
          <Button
            aria-label={t('myLibrary.items.ownership.create')}
            className="shrink-0"
            disabled={atOwnershipLimit || createMutation.isPending}
            icon="plus"
            size="sm"
            variant="icon"
            onClick={() => setEditorState({ mode: 'create' })}
          />
        ) : (
          <Button
            disabled={atOwnershipLimit || createMutation.isPending}
            prependIcon="plus"
            size="md"
            variant="secondary"
            onClick={() => setEditorState({ mode: 'create' })}
          >
            {t('myLibrary.items.ownership.create')}
          </Button>
        )
      }
      icon="library"
      title={t('myLibrary.items.ownership.sectionTitle')}
    >
      {atOwnershipLimit ? (
        <p className="app-text-supporting-copy mb-5 text-ink-3" role="status">
          {t('myLibrary.items.ownership.limitReached', {
            values: { count: LIBRARY_ITEM_OWNERSHIPS_MAX_COUNT },
          })}
        </p>
      ) : null}

      {item.ownerships.length === 0 ? (
        <p className="app-text-supporting-copy text-ink-3">
          {t('myLibrary.items.ownership.empty')}
        </p>
      ) : (
        <ol className="space-y-4">
          {item.ownerships.map((ownership) => (
            <OwnershipRow
              key={ownership.id}
              onDelete={(triggerElement) =>
                setDeleteState({
                  ownership,
                  returnFocusElement: triggerElement,
                })
              }
              onEdit={() => setEditorState({ mode: 'edit', ownership })}
              ownership={ownership}
            />
          ))}
        </ol>
      )}

      {editorState ? (
        <OwnershipDialog
          initialOwnership={
            editorState.mode === 'edit' ? editorState.ownership : null
          }
          isSaving={
            editorState.mode === 'create'
              ? createMutation.isPending
              : updateMutation.isPending &&
                updateMutation.variables?.ownershipId ===
                  editorState.ownership.id
          }
          onClose={() => setEditorState(null)}
          onSubmit={handleEditorSubmit}
        />
      ) : null}

      {deleteState ? (
        <OwnershipDeleteDialog
          getReturnFocusElement={() => deleteState.returnFocusElement}
          isDeleting={
            deleteMutation.isPending &&
            deleteMutation.variables === deleteState.ownership.id
          }
          onClose={() => setDeleteState(null)}
          onConfirm={() => {
            void deleteMutation
              .mutateAsync(deleteState.ownership.id)
              .then(() => setDeleteState(null))
              .catch(() => undefined);
          }}
          ownership={deleteState.ownership}
        />
      ) : null}
    </LibrarySection>
  );
}
