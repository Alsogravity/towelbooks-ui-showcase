import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import {
  ROOM_DESCRIPTION_MAX_LENGTH,
  ROOM_NAME_MAX_LENGTH,
  type Library,
} from '@towelbooks/schemas';
import { useId } from 'react';
import { useForm } from 'react-hook-form';

import { useToast } from '../../../components/feedback';
import { ResponsiveOverlayShell } from '../../../components/overlay';
import {
  Button,
  DialogActions,
  FormField,
  Input,
  Textarea,
} from '../../../components/primitives';
import {
  createApiProblemToast,
  applyApiValidationErrors,
} from '../../../features/errors';
import {
  createLibraryEditFormSchema,
  type LibraryEditFormValues,
} from '../../../features/libraries/libraryCopy';
import {
  invalidateLibrarySurface,
  libraryQueryKey,
} from '../../../features/libraries/queryInvalidation';
import { useI18n } from '../../../i18n';
import { useIsBelowSmViewport } from '../../../layouts/app/shellViewport';
import { sdk } from '../../../lib/sdk';

const FORM_ID = 'edit-library-form';

type EditLibraryOverlayProps = {
  getReturnFocusElement?: () => HTMLElement | null;
  library: Library;
  onClose: () => void;
};

function toLibraryFormValues(library: {
  description: string | null;
  name: string;
}): LibraryEditFormValues {
  return {
    name: library.name,
    description: library.description ?? '',
  };
}

export function EditLibraryOverlay({
  getReturnFocusElement,
  library,
  onClose,
}: EditLibraryOverlayProps) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { pushToast } = useToast();
  const isBelowSmViewport = useIsBelowSmViewport();
  const schema = createLibraryEditFormSchema(t);
  const nameFieldId = useId();
  const descriptionFieldId = useId();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LibraryEditFormValues>({
    resolver: zodResolver(schema),
    values: toLibraryFormValues(library),
  });

  const onSubmit = async (data: LibraryEditFormValues) => {
    try {
      const updated = await sdk.libraries.update(library.id, {
        name: data.name,
        description: data.description || null,
      });
      queryClient.setQueryData(libraryQueryKey(library.id), updated);
      await invalidateLibrarySurface(queryClient, library.id);
      onClose();
    } catch (error: unknown) {
      if (applyApiValidationErrors(error, setError) > 0) {
        return;
      }

      pushToast(
        createApiProblemToast(error, {
          fallbackKey: 'libraries.edit.error.submit',
          t,
        }),
      );
    }
  };

  if (library.type === 'room') {
    return (
      <ResponsiveOverlayShell
        closeLabel={t('common.close')}
        dialogSize="sm"
        getReturnFocusElement={getReturnFocusElement}
        onClose={onClose}
        title={t('libraries.edit.roomBlocked.title')}
      >
        <p className="app-text-body text-ink-2">
          {t('libraries.edit.roomBlocked.body')}
        </p>
      </ResponsiveOverlayShell>
    );
  }

  const actions = (
    <>
      <Button
        type="button"
        variant={isBelowSmViewport ? 'secondary' : 'ghost'}
        onClick={onClose}
      >
        {t('libraries.edit.cancel')}
      </Button>
      <Button
        form={FORM_ID}
        type="submit"
        disabled={isSubmitting}
        isLoading={isSubmitting}
        loadingLabel={t('libraries.edit.submitting')}
      >
        {t('libraries.edit.submit')}
      </Button>
    </>
  );

  const footer = isBelowSmViewport ? (
    actions
  ) : (
    <DialogActions stackOnMobile>{actions}</DialogActions>
  );

  return (
    <ResponsiveOverlayShell
      closeLabel={t('common.close')}
      dialogSize="md"
      footer={footer}
      getReturnFocusElement={getReturnFocusElement}
      onClose={onClose}
      title={t('libraries.edit.title')}
    >
      <form
        id={FORM_ID}
        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
        className="flex flex-col gap-5"
      >
        <FormField
          label={t('libraries.form.labels.name')}
          htmlFor={nameFieldId}
          hideLabel
          error={errors.name?.message}
        >
          <Input
            id={nameFieldId}
            placeholder={t('libraries.form.labels.name')}
            maxLength={ROOM_NAME_MAX_LENGTH}
            floatingLabel
            className="app-text-body"
            {...register('name')}
          />
        </FormField>

        <FormField
          label={t('libraries.form.labels.description')}
          htmlFor={descriptionFieldId}
          hideLabel
          error={errors.description?.message}
        >
          <Textarea
            id={descriptionFieldId}
            placeholder={t('libraries.form.labels.description')}
            maxLength={ROOM_DESCRIPTION_MAX_LENGTH}
            rows={3}
            floatingLabel
            className="app-text-body"
            {...register('description')}
          />
        </FormField>
      </form>
    </ResponsiveOverlayShell>
  );
}
