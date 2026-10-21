import {
  ErrorCode,
  LIBRARY_ITEM_READING_NOTE_CONTENT_MAX_LENGTH,
  LIBRARY_ITEM_READING_NOTE_PAGE_MAX,
  LIBRARY_ITEM_READING_NOTES_DEFAULT_PAGE_SIZE,
  LIBRARY_ITEM_READING_NOTES_MAX_COUNT,
  type LibraryItemReadingNote,
  type LibraryItemReadingSession,
} from '@towelbooks/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { useToast } from '../../../../components/feedback';
import { ResponsiveOverlayShell } from '../../../../components/overlay';
import {
  Button,
  DialogActions,
  FormField,
  InlineConfirm,
  Input,
  Pagination,
  Textarea,
} from '../../../../components/primitives';
import { createApiProblemToast } from '../../../../features/errors';
import {
  invalidateLibraryItemReadingNotesSurface,
  libraryItemReadingNotesQueryKey,
} from '../../../../features/libraries/queryInvalidation';
import { useI18n } from '../../../../i18n';
import { useIsBelowSmViewport } from '../../../../layouts/app/shellViewport';
import { sdk } from '../../../../lib/sdk';
import { LibrarySection } from '../../ui/LibrarySection';

const NOTE_PAGE_SIZE = LIBRARY_ITEM_READING_NOTES_DEFAULT_PAGE_SIZE;

type NoteDraft = {
  content: string;
  pageEnd: string;
  pageStart: string;
};

type NoteFormErrors = Partial<Record<keyof NoteDraft | 'form', string>>;

type ReadingNoteEditorState =
  | {
      getReturnFocusElement: () => HTMLElement | null;
      mode: 'create';
    }
  | {
      getReturnFocusElement: () => HTMLElement | null;
      mode: 'edit';
      noteId: string;
    };

function createNoteDraft(note?: LibraryItemReadingNote | null): NoteDraft {
  return {
    content: note?.content ?? '',
    pageEnd: note?.pageEnd?.toString() ?? '',
    pageStart: note?.pageStart?.toString() ?? '',
  };
}

function parsePage(value: string, maximum: number): number | null | 'invalid' {
  if (!value.trim()) {
    return null;
  }

  const page = Number(value);
  if (!Number.isInteger(page) || page < 1 || page > maximum) {
    return 'invalid';
  }

  return page;
}

function validateNoteDraft(
  draft: NoteDraft,
  pageMaximum: number,
  t: ReturnType<typeof useI18n>['t'],
): NoteFormErrors {
  const errors: NoteFormErrors = {};
  const content = draft.content.trim();
  const pageStart = parsePage(draft.pageStart, pageMaximum);
  const pageEnd = parsePage(draft.pageEnd, pageMaximum);

  if (content.length === 0) {
    errors.content = t('myLibrary.items.notes.validation.contentRequired');
  } else if (content.length > LIBRARY_ITEM_READING_NOTE_CONTENT_MAX_LENGTH) {
    errors.content = t('myLibrary.items.notes.validation.contentMax');
  }
  if (pageStart === 'invalid') {
    errors.pageStart = t('myLibrary.items.notes.validation.page', {
      values: { maximum: pageMaximum },
    });
  }
  if (pageEnd === 'invalid') {
    errors.pageEnd = t('myLibrary.items.notes.validation.page', {
      values: { maximum: pageMaximum },
    });
  }
  if (pageEnd !== null && pageEnd !== 'invalid' && pageStart === null) {
    errors.pageStart = t('myLibrary.items.notes.validation.endRequiresStart');
  }
  if (
    typeof pageStart === 'number' &&
    typeof pageEnd === 'number' &&
    pageEnd < pageStart
  ) {
    errors.pageEnd = t('myLibrary.items.notes.validation.endBeforeStart');
  }

  return errors;
}

function serializeNoteDraft(draft: NoteDraft) {
  const pageStart = draft.pageStart.trim() ? Number(draft.pageStart) : null;
  const pageEnd = draft.pageEnd.trim() ? Number(draft.pageEnd) : null;

  return {
    content: draft.content.trim(),
    pageEnd,
    pageStart,
  };
}

function ReadingNoteEditor({
  initialNote,
  formId,
  onSubmit,
  pageMaximum,
}: {
  initialNote?: LibraryItemReadingNote | null;
  formId: string;
  onSubmit: (draft: NoteDraft) => Promise<unknown>;
  pageMaximum: number;
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(() => createNoteDraft(initialNote));
  const [errors, setErrors] = useState<NoteFormErrors>({});
  const prefix = initialNote?.id ?? 'new-reading-note';

  const updateDraft = <K extends keyof NoteDraft>(
    key: K,
    value: NoteDraft[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
  };

  return (
    <form
      className="space-y-5"
      id={formId}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const nextErrors = validateNoteDraft(draft, pageMaximum, t);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
          return;
        }

        void onSubmit(draft).catch(() => {
          setErrors({ form: t('myLibrary.items.notes.error.save') });
        });
      }}
    >
      <FormField
        error={errors.content}
        htmlFor={`${prefix}-content`}
        hint={t('myLibrary.items.notes.contentHint')}
        label={t('myLibrary.items.notes.contentLabel')}
      >
        <Textarea
          id={`${prefix}-content`}
          maxLength={LIBRARY_ITEM_READING_NOTE_CONTENT_MAX_LENGTH}
          rows={4}
          value={draft.content}
          onChange={(event) => updateDraft('content', event.target.value)}
        />
        <p className="app-text-caption mt-1 text-right text-ink-3">
          {draft.content.trim().length}/
          {LIBRARY_ITEM_READING_NOTE_CONTENT_MAX_LENGTH}
        </p>
      </FormField>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          error={errors.pageStart}
          htmlFor={`${prefix}-page-start`}
          hint={t('myLibrary.items.notes.pageHint', {
            values: { maximum: pageMaximum },
          })}
          label={t('myLibrary.items.notes.pageStartLabel')}
        >
          <Input
            id={`${prefix}-page-start`}
            max={pageMaximum}
            min={1}
            type="number"
            value={draft.pageStart}
            onChange={(event) => updateDraft('pageStart', event.target.value)}
          />
        </FormField>
        <FormField
          error={errors.pageEnd}
          htmlFor={`${prefix}-page-end`}
          hint={t('myLibrary.items.notes.pageRangeHint')}
          label={t('myLibrary.items.notes.pageEndLabel')}
        >
          <Input
            id={`${prefix}-page-end`}
            max={pageMaximum}
            min={1}
            type="number"
            value={draft.pageEnd}
            onChange={(event) => updateDraft('pageEnd', event.target.value)}
          />
        </FormField>
      </div>

      {errors.form ? (
        <p className="vui-form-field__error" role="alert">
          {errors.form}
        </p>
      ) : null}
    </form>
  );
}

function ReadingNoteRow({
  isEditing,
  isDeleting,
  note,
  onDelete,
  onEdit,
}: {
  isEditing: boolean;
  isDeleting: boolean;
  note: LibraryItemReadingNote;
  onDelete: () => void;
  onEdit: (getReturnFocusElement: () => HTMLElement | null) => void;
}) {
  const { formatDateTime, t } = useI18n();
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const pageContext =
    note.pageStart === null
      ? null
      : note.pageEnd === null
        ? t('myLibrary.items.notes.pageOne', {
            values: { page: note.pageStart },
          })
        : t('myLibrary.items.notes.pageRange', {
            values: { start: note.pageStart, end: note.pageEnd },
          });
  const noteSummary =
    note.content.length > 60 ? `${note.content.slice(0, 57)}…` : note.content;

  return (
    <li className="border-b border-rule/30 py-5 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="app-text-body whitespace-pre-wrap text-ink">
            {note.content}
          </p>
          <p className="app-text-metadata text-ink-3">
            {pageContext ? `${pageContext} · ` : ''}
            {t('myLibrary.items.notes.updated', {
              values: { date: formatDateTime(new Date(note.updatedAt)) },
            })}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            aria-expanded={isEditing}
            aria-label={t('myLibrary.items.notes.editAria', {
              values: { summary: noteSummary },
            })}
            ref={editButtonRef}
            size="sm"
            variant="tertiary"
            onClick={() => onEdit(() => editButtonRef.current)}
          >
            {t('myLibrary.items.notes.edit')}
          </Button>
          <InlineConfirm
            cancelLabel={t('myLibrary.items.notes.deleteCancel')}
            confirmLabel={t('myLibrary.items.notes.deleteConfirm')}
            isLoading={isDeleting}
            message={t('myLibrary.items.notes.deletePrompt')}
            onConfirm={onDelete}
            trigger={
              <Button
                aria-label={t('myLibrary.items.notes.deleteAria', {
                  values: { summary: noteSummary },
                })}
                size="sm"
                variant="ghost"
              >
                {t('myLibrary.items.notes.delete')}
              </Button>
            }
            confirmVariant="danger"
          />
        </div>
      </div>
    </li>
  );
}

function ReadingNoteEditorOverlay({
  editor,
  initialNote,
  isSaving,
  onClose,
  onSubmit,
  pageMaximum,
}: {
  editor: ReadingNoteEditorState;
  initialNote: LibraryItemReadingNote | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (draft: NoteDraft) => Promise<unknown>;
  pageMaximum: number;
}) {
  const { t } = useI18n();
  const isBelowSmViewport = useIsBelowSmViewport();
  const formId = initialNote
    ? `reading-note-edit-${initialNote.id}`
    : 'reading-note-create';
  const fieldIdPrefix = initialNote?.id ?? 'new-reading-note';
  const actions = (
    <>
      <Button
        type="button"
        variant={isBelowSmViewport ? 'secondary' : 'tertiary'}
        onClick={onClose}
      >
        {t('common.cancel')}
      </Button>
      <Button
        form={formId}
        isLoading={isSaving}
        loadingLabel={t('myLibrary.items.notes.saving')}
        type="submit"
      >
        {initialNote
          ? t('myLibrary.items.notes.save')
          : t('myLibrary.items.notes.create')}
      </Button>
    </>
  );

  return (
    <ResponsiveOverlayShell
      closeLabel={t('common.close')}
      dialogSize="md"
      footer={
        isBelowSmViewport ? (
          actions
        ) : (
          <DialogActions stackOnMobile>{actions}</DialogActions>
        )
      }
      getReturnFocusElement={editor.getReturnFocusElement}
      onClose={onClose}
      onOpenAutoFocus={() => {
        document.getElementById(`${fieldIdPrefix}-content`)?.focus();
      }}
      title={t(
        initialNote
          ? 'myLibrary.items.notes.editTitle'
          : 'myLibrary.items.notes.createTitle',
      )}
    >
      <ReadingNoteEditor
        formId={formId}
        initialNote={initialNote}
        onSubmit={async (draft) => {
          await onSubmit(draft);
          onClose();
        }}
        pageMaximum={pageMaximum}
      />
    </ResponsiveOverlayShell>
  );
}

export function LibraryItemReadingNotesSection({
  libraryId,
  libraryItemId,
  session,
}: {
  libraryId: string;
  libraryItemId: string;
  session: LibraryItemReadingSession;
}) {
  const { t } = useI18n();
  const isBelowSm = useIsBelowSmViewport();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [noteEditor, setNoteEditor] = useState<ReadingNoteEditorState | null>(
    null,
  );
  const createNoteButtonRef = useRef<HTMLButtonElement>(null);
  const pageMaximum = Math.max(
    1,
    Math.min(
      LIBRARY_ITEM_READING_NOTE_PAGE_MAX,
      session.totalPages ?? LIBRARY_ITEM_READING_NOTE_PAGE_MAX,
    ),
  );
  const notesQuery = useQuery({
    queryKey: [
      ...libraryItemReadingNotesQueryKey(libraryId, libraryItemId, session.id),
      { page, pageSize: NOTE_PAGE_SIZE },
    ],
    queryFn: () =>
      sdk.libraries.listItemReadingNotes(libraryId, libraryItemId, session.id, {
        page,
        pageSize: NOTE_PAGE_SIZE,
      }),
    retry: false,
  });
  const notes = notesQuery.data?.items ?? [];
  const total = notesQuery.data?.total ?? 0;
  const totalPages = Math.ceil(total / NOTE_PAGE_SIZE);
  const effectivePage = Math.min(page, Math.max(totalPages, 1));
  const showError = (error: unknown) => {
    pushToast(
      createApiProblemToast(error, {
        fallbackKey: 'myLibrary.items.notes.error.save',
        messageKeys: {
          [ErrorCode.READING_NOTE_LIMIT_REACHED]:
            'myLibrary.items.notes.limitReached',
        },
        t,
      }),
    );
  };
  const refresh = () =>
    invalidateLibraryItemReadingNotesSurface(
      queryClient,
      libraryId,
      libraryItemId,
      session.id,
    );
  const createMutation = useMutation({
    mutationFn: (draft: NoteDraft) =>
      sdk.libraries.createItemReadingNote(
        libraryId,
        libraryItemId,
        session.id,
        serializeNoteDraft(draft),
      ),
    onError: showError,
    onSuccess: refresh,
  });
  const updateMutation = useMutation({
    mutationFn: ({ draft, noteId }: { draft: NoteDraft; noteId: string }) =>
      sdk.libraries.updateItemReadingNote(
        libraryId,
        libraryItemId,
        session.id,
        noteId,
        serializeNoteDraft(draft),
      ),
    onError: showError,
    onSuccess: refresh,
  });
  const deleteMutation = useMutation({
    mutationFn: (noteId: string) =>
      sdk.libraries.removeItemReadingNote(
        libraryId,
        libraryItemId,
        session.id,
        noteId,
      ),
    onError: showError,
    onSuccess: async () => {
      if (
        page > 1 &&
        notes.length === 1 &&
        total - 1 <= (page - 1) * NOTE_PAGE_SIZE
      ) {
        setPage(page - 1);
      }
      await refresh();
    },
  });
  const atNoteLimit = total >= LIBRARY_ITEM_READING_NOTES_MAX_COUNT;
  const selectedNoteForEditor =
    noteEditor?.mode === 'edit'
      ? (notes.find((note) => note.id === noteEditor.noteId) ?? null)
      : null;
  const openCreateNoteEditor = () => {
    setNoteEditor({
      getReturnFocusElement: () => createNoteButtonRef.current,
      mode: 'create',
    });
  };

  return (
    <>
      <LibrarySection
        actions={
          isBelowSm ? (
            <Button
              aria-expanded={noteEditor?.mode === 'create'}
              aria-label={t('myLibrary.items.notes.create')}
              className="shrink-0"
              disabled={atNoteLimit || createMutation.isPending}
              icon="plus"
              ref={createNoteButtonRef}
              size="sm"
              variant="icon"
              onClick={openCreateNoteEditor}
            />
          ) : (
            <Button
              aria-expanded={noteEditor?.mode === 'create'}
              disabled={atNoteLimit || createMutation.isPending}
              prependIcon="plus"
              ref={createNoteButtonRef}
              size="md"
              variant="secondary"
              onClick={openCreateNoteEditor}
            >
              {t('myLibrary.items.notes.create')}
            </Button>
          )
        }
        description={t('myLibrary.items.notes.description')}
        icon="message-square-quote"
        title={t('myLibrary.items.notes.title')}
      >
        {atNoteLimit ? (
          <p className="app-text-supporting-copy mb-5 text-ink-3" role="status">
            {t('myLibrary.items.notes.limitReached', {
              values: { count: LIBRARY_ITEM_READING_NOTES_MAX_COUNT },
            })}
          </p>
        ) : null}

        {notesQuery.isLoading ? (
          <p aria-live="polite" className="app-text-supporting-copy text-ink-3">
            {t('myLibrary.items.notes.loading')}
          </p>
        ) : notesQuery.isError ? (
          <div className="space-y-3">
            <p className="app-text-supporting-copy text-ink-3">
              {t('myLibrary.items.notes.error.load')}
            </p>
            <Button
              size="sm"
              variant="tertiary"
              onClick={() => void notesQuery.refetch()}
            >
              {t('myLibrary.items.retry')}
            </Button>
          </div>
        ) : notes.length === 0 ? (
          <p className="app-text-supporting-copy text-ink-3">
            {t('myLibrary.items.notes.empty')}
          </p>
        ) : (
          <>
            {notes.length > 0 ? (
              <ol>
                {notes.map((note) => (
                  <ReadingNoteRow
                    isEditing={
                      noteEditor?.mode === 'edit' &&
                      noteEditor.noteId === note.id
                    }
                    isDeleting={
                      deleteMutation.isPending &&
                      deleteMutation.variables === note.id
                    }
                    key={note.id}
                    note={note}
                    onDelete={() => deleteMutation.mutate(note.id)}
                    onEdit={(getReturnFocusElement) =>
                      setNoteEditor({
                        getReturnFocusElement,
                        mode: 'edit',
                        noteId: note.id,
                      })
                    }
                  />
                ))}
              </ol>
            ) : null}
            {totalPages > 1 ? (
              <Pagination
                className="mt-6"
                currentPageLabel={(currentPage) =>
                  t('myLibrary.items.notes.pagination.currentPage', {
                    values: { page: currentPage },
                  })
                }
                navLabel={t('myLibrary.items.notes.pagination.nav')}
                nextLabel={t('myLibrary.items.notes.pagination.next')}
                onPageChange={setPage}
                page={effectivePage}
                pageLabel={(nextPage) =>
                  t('myLibrary.items.notes.pagination.page', {
                    values: { page: nextPage },
                  })
                }
                previousLabel={t('myLibrary.items.notes.pagination.previous')}
                totalPages={totalPages}
              />
            ) : null}
          </>
        )}
      </LibrarySection>

      {noteEditor && (noteEditor.mode === 'create' || selectedNoteForEditor) ? (
        <ReadingNoteEditorOverlay
          editor={noteEditor}
          initialNote={selectedNoteForEditor}
          isSaving={
            noteEditor.mode === 'create'
              ? createMutation.isPending
              : updateMutation.isPending
          }
          onClose={() => setNoteEditor(null)}
          onSubmit={(draft) =>
            noteEditor.mode === 'create'
              ? createMutation.mutateAsync(draft)
              : updateMutation.mutateAsync({
                  draft,
                  noteId: noteEditor.noteId,
                })
          }
          pageMaximum={pageMaximum}
        />
      ) : null}
    </>
  );
}
