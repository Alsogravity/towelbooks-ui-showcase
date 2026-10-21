import { LIBRARY_ITEM_PERSONAL_NOTE_MAX_LENGTH } from '@towelbooks/schemas';
import { useId, useRef, useState, type FormEvent } from 'react';

import {
  AnchoredBottomSheet,
  AppearanceSheetShell,
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  FormField,
  Textarea,
} from '../../../../components/primitives';
import { useIsBelowSmViewport } from '../../../../layouts/app/shellViewport';
import { useI18n } from '../../../../i18n';

interface LibraryItemPersonalNoteEditorProps {
  initialNote: string;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (note: string) => Promise<unknown>;
}

export function LibraryItemPersonalNoteEditor({
  initialNote,
  isSaving,
  onClose,
  onSubmit,
}: LibraryItemPersonalNoteEditorProps) {
  const { t } = useI18n();
  const isBelowSmViewport = useIsBelowSmViewport();
  const [note, setNote] = useState(initialNote);
  const formId = 'library-item-personal-note-form';
  const titleId = useId();
  const hostRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  const renderFields = () => (
    <FormField
      htmlFor="library-item-personal-note"
      label={t('myLibrary.items.personalNote.label')}
    >
      <Textarea
        id="library-item-personal-note"
        disabled={isSaving}
        maxLength={LIBRARY_ITEM_PERSONAL_NOTE_MAX_LENGTH}
        placeholder={t('myLibrary.items.personalNote.placeholder')}
        rows={6}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
    </FormField>
  );

  const renderMobileFields = () => (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <label
        className="app-text-label text-ink"
        htmlFor="library-item-personal-note"
      >
        {t('myLibrary.items.personalNote.label')}
      </label>
      <div className="h-full min-h-0 flex-1">
        <Textarea
          id="library-item-personal-note"
          className="h-full min-h-0 resize-none"
          controlClassName="flex !h-full min-h-0 !flex-1"
          disabled={isSaving}
          maxLength={LIBRARY_ITEM_PERSONAL_NOTE_MAX_LENGTH}
          placeholder={t('myLibrary.items.personalNote.placeholder')}
          rows={6}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          wrapperClassName="flex !h-full min-h-0 !flex-1"
        />
      </div>
    </div>
  );

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
    close: () => void,
  ) => {
    event.preventDefault();

    try {
      await onSubmit(note);
      close();
    } catch {
      // The mutation owns the localized error toast; keep the editor open.
    }
  };

  if (isBelowSmViewport) {
    return (
      <AnchoredBottomSheet
        fallbackPeekHeight="0"
        hostRef={hostRef}
        overlayScope="viewport"
        panelClassName="!h-[80dvh] !min-h-[80dvh]"
        titleId={titleId}
        onClose={onClose}
      >
        {({ close }) => (
          <AppearanceSheetShell
            bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden p-0"
            closeLabel={t('common.close')}
            onClose={() => {
              if (!isSaving) {
                close();
              }
            }}
            title={t('myLibrary.items.personalNote.editTitle')}
            titleId={titleId}
          >
            <form
              id={formId}
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={(event) => void handleSubmit(event, close)}
            >
              <div className="flex min-h-0 flex-1 flex-col px-5 py-5">
                {renderMobileFields()}
              </div>
              <div className="flex shrink-0 justify-end gap-3 border-t border-rule/20 px-5 py-4">
                <Button
                  disabled={isSaving}
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (!isSaving) {
                      close();
                    }
                  }}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  isLoading={isSaving}
                  loadingLabel={t('myLibrary.items.personalNote.saving')}
                  type="submit"
                >
                  {t('myLibrary.items.personalNote.save')}
                </Button>
              </div>
            </form>
          </AppearanceSheetShell>
        )}
      </AnchoredBottomSheet>
    );
  }

  return (
    <Dialog
      closeButtonLabel={t('common.close')}
      onClose={handleClose}
      showCloseButton
      size="md"
      title={t('myLibrary.items.personalNote.editTitle')}
    >
      {({ close }) => (
        <>
          <DialogBody>
            <form
              id={formId}
              className="flex flex-col gap-5"
              onSubmit={(event) => void handleSubmit(event, close)}
            >
              {renderFields()}
            </form>
          </DialogBody>
          <DialogActions>
            <Button
              disabled={isSaving}
              type="button"
              variant="tertiary"
              onClick={() => close()}
            >
              {t('common.cancel')}
            </Button>
            <Button
              form={formId}
              isLoading={isSaving}
              loadingLabel={t('myLibrary.items.personalNote.saving')}
              type="submit"
            >
              {t('myLibrary.items.personalNote.save')}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
