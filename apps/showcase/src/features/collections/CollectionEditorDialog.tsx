import {
  COLLECTION_DESCRIPTION_MAX_LENGTH,
  COLLECTION_NAME_MAX_LENGTH,
  type Collection,
  type CollectionAccentKey,
  type CollectionIconKey,
  type CreateCollectionRequest,
  type UpdateCollectionRequest,
} from '@towelbooks/schemas';
import { useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  FormTextField,
  FormTextareaField,
} from '../../components/primitives';
import { useI18n } from '../../i18n';
import { CollectionPresentationPicker } from './CollectionPresentationPicker';

export type EditableCollection = Pick<
  Collection,
  'accentKey' | 'description' | 'iconKey' | 'id' | 'name'
>;

export type CollectionEditorValues =
  CreateCollectionRequest | UpdateCollectionRequest;

type CollectionEditorDialogProps = {
  collection: EditableCollection | null;
  errorMessage?: string | null;
  getReturnFocusElement?: () => HTMLElement | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (values: CollectionEditorValues) => void;
};

export function CollectionEditorDialog({
  collection,
  errorMessage,
  getReturnFocusElement,
  isPending,
  onClose,
  onSubmit,
}: CollectionEditorDialogProps) {
  const { t } = useI18n();
  const isEditing = collection !== null;
  const [name, setName] = useState(collection?.name ?? '');
  const [description, setDescription] = useState(collection?.description ?? '');
  const [iconKey, setIconKey] = useState<CollectionIconKey>(
    collection?.iconKey ?? 'books',
  );
  const [accentKey, setAccentKey] = useState<CollectionAccentKey>(
    collection?.accentKey ?? 'neutral',
  );
  const [nameError, setNameError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const nextNameError =
      trimmedName.length === 0
        ? t('collections.form.nameRequired')
        : trimmedName.length > COLLECTION_NAME_MAX_LENGTH
          ? t('collections.form.nameMax')
          : null;
    const nextDescriptionError =
      trimmedDescription.length > COLLECTION_DESCRIPTION_MAX_LENGTH
        ? t('collections.form.descriptionMax')
        : null;

    setNameError(nextNameError);
    setDescriptionError(nextDescriptionError);
    if (nextNameError || nextDescriptionError) {
      return;
    }

    onSubmit({
      accentKey,
      description: trimmedDescription.length > 0 ? trimmedDescription : null,
      iconKey,
      name: trimmedName,
    });
  };

  return (
    <Dialog
      closeButtonDisabled={isPending}
      closeOnBackdrop={!isPending}
      closeOnEscape={!isPending}
      getReturnFocusElement={getReturnFocusElement}
      onClose={onClose}
      showCloseButton
      size="lg"
      title={
        isEditing
          ? t('collections.form.editTitle')
          : t('collections.form.createTitle')
      }
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
            <div className="space-y-4">
              <FormTextField
                autoComplete="off"
                error={nameError ?? undefined}
                id="collection-name"
                label={t('collections.form.name')}
                maxLength={COLLECTION_NAME_MAX_LENGTH}
                onChange={(event) => {
                  setName(event.currentTarget.value);
                  if (nameError) setNameError(null);
                }}
                placeholder={t('collections.form.namePlaceholder')}
                value={name}
              />
              <FormTextareaField
                error={descriptionError ?? undefined}
                id="collection-description"
                label={t('collections.form.description')}
                maxLength={COLLECTION_DESCRIPTION_MAX_LENGTH}
                onChange={(event) => {
                  setDescription(event.currentTarget.value);
                  if (descriptionError) setDescriptionError(null);
                }}
                placeholder={t('collections.form.descriptionPlaceholder')}
                rows={3}
                value={description}
              />
            </div>
            <CollectionPresentationPicker
              accentKey={accentKey}
              iconKey={iconKey}
              onAccentChange={setAccentKey}
              onIconChange={setIconKey}
            />
          </DialogBody>
          <DialogActions stackOnMobile>
            <Button
              disabled={isPending}
              onClick={() => close()}
              type="button"
              variant="ghost"
            >
              {t('collections.form.cancel')}
            </Button>
            <Button
              disabled={isPending}
              isLoading={isPending}
              loadingLabel={t('collections.form.saving')}
              onClick={handleSubmit}
              type="button"
            >
              {isEditing
                ? t('collections.form.save')
                : t('collections.form.create')}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
