import {
  DISCUSSION_BODY_MAX_LENGTH,
  DISCUSSION_TITLE_MAX_LENGTH,
} from '@towelbooks/schemas';

import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  FormField,
  FormTextareaField,
  Input,
} from '../../../../../components/primitives';
import { useI18n } from '../../../../../i18n';

type EditDiscussionDialogProps = {
  bodyDraft: string;
  isPending: boolean;
  onBodyChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  onTitleChange: (value: string) => void;
  titleDraft: string;
};

export function EditDiscussionDialog({
  bodyDraft,
  isPending,
  onBodyChange,
  onClose,
  onSubmit,
  onTitleChange,
  titleDraft,
}: EditDiscussionDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog
      title={t('rooms.detail.discussions.editDialog.title')}
      onClose={onClose}
      size="sm"
    >
      {({ close }) => (
        <>
          <DialogBody>
            <FormField
              htmlFor="discussion-edit-title"
              label={t('rooms.detail.discussions.editDialog.titleLabel')}
            >
              <Input
                id="discussion-edit-title"
                maxLength={DISCUSSION_TITLE_MAX_LENGTH}
                value={titleDraft}
                onChange={(event) => onTitleChange(event.currentTarget.value)}
              />
            </FormField>
            <FormTextareaField
              id="discussion-edit-body"
              label={t('rooms.detail.discussions.editDialog.bodyLabel')}
              maxLength={DISCUSSION_BODY_MAX_LENGTH}
              rows={6}
              value={bodyDraft}
              onChange={(event) => onBodyChange(event.currentTarget.value)}
            />
          </DialogBody>
          <DialogActions>
            <Button variant="ghost" onClick={() => close()}>
              {t('common.cancel')}
            </Button>
            <Button
              isLoading={isPending}
              loadingLabel={t('rooms.detail.discussions.saving')}
              onClick={onSubmit}
            >
              {t('rooms.detail.discussions.actions.saveDiscussion')}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
