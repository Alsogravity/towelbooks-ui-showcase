import {
  COLLECTION_ITEM_NOTE_MAX_LENGTH,
  type CollectionItem,
  type WishlistPriority,
} from '@towelbooks/schemas';
import { useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  FormSelectField,
  FormTextareaField,
} from '../../components/primitives';
import { useI18n } from '../../i18n';

type CollectionItemEditDialogProps = {
  errorMessage?: string | null;
  getReturnFocusElement?: () => HTMLElement | null;
  isPending: boolean;
  item: CollectionItem;
  onClose: () => void;
  onSubmit: (values: {
    note: string | null;
    priority: WishlistPriority;
  }) => void;
};

export function CollectionItemEditDialog({
  errorMessage,
  getReturnFocusElement,
  isPending,
  item,
  onClose,
  onSubmit,
}: CollectionItemEditDialogProps) {
  const { t } = useI18n();
  const [note, setNote] = useState(item.note ?? '');
  const [priority, setPriority] = useState<WishlistPriority>(
    item.priority ?? 'medium',
  );

  return (
    <Dialog
      closeButtonDisabled={isPending}
      closeOnBackdrop={!isPending}
      closeOnEscape={!isPending}
      getReturnFocusElement={getReturnFocusElement}
      onClose={onClose}
      showCloseButton
      size="md"
      title={t('collections.detail.editItemTitle')}
      closeButtonLabel={t('common.close')}
    >
      {({ close }) => (
        <>
          <DialogBody>
            {errorMessage ? (
              <p className="app-text-supporting-copy text-brick" role="alert">
                {errorMessage}
              </p>
            ) : null}
            <p className="app-text-body m-0 text-ink-2">
              {item.catalogEdition
                ? t('collections.detail.edition', {
                    values: { title: item.catalogEdition.title },
                  })
                : t('collections.detail.noEdition')}
            </p>
            <FormSelectField
              id="collection-item-priority"
              label={t('collections.detail.priorityLabel')}
              onChange={(event) =>
                setPriority(event.currentTarget.value as WishlistPriority)
              }
              value={priority}
            >
              <option value="low">
                {t('collections.detail.priority.low')}
              </option>
              <option value="medium">
                {t('collections.detail.priority.medium')}
              </option>
              <option value="high">
                {t('collections.detail.priority.high')}
              </option>
            </FormSelectField>
            <FormTextareaField
              id="collection-item-note"
              label={t('collections.detail.noteLabel')}
              maxLength={COLLECTION_ITEM_NOTE_MAX_LENGTH}
              onChange={(event) => setNote(event.currentTarget.value)}
              placeholder={t('collections.detail.notePlaceholder')}
              rows={5}
              value={note}
            />
          </DialogBody>
          <DialogActions stackOnMobile>
            <Button
              disabled={isPending}
              onClick={() => close()}
              type="button"
              variant="ghost"
            >
              {t('common.cancel')}
            </Button>
            <Button
              disabled={isPending}
              isLoading={isPending}
              loadingLabel={t('collections.detail.itemSaving')}
              onClick={() =>
                onSubmit({
                  note: note.trim().length > 0 ? note.trim() : null,
                  priority,
                })
              }
              type="button"
            >
              {t('collections.detail.saveItem')}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
