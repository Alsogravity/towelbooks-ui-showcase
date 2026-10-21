import {
  DISCUSSION_BODY_MAX_LENGTH,
  DISCUSSION_TITLE_MAX_LENGTH,
} from '@towelbooks/schemas';

import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  FormRows,
  FormTextField,
  FormTextareaField,
} from '../../../../../components/primitives';
import { useI18n } from '../../../../../i18n';

type CreateDiscussionDialogProps = {
  body: string;
  isPending: boolean;
  onBodyChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  onTitleChange: (value: string) => void;
  title: string;
};

export function CreateDiscussionDialog({
  body,
  isPending,
  onBodyChange,
  onClose,
  onSubmit,
  onTitleChange,
  title,
}: CreateDiscussionDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog
      title={t('rooms.detail.discussions.createDialog.title')}
      onClose={onClose}
      size="md"
    >
      {({ close }) => (
        <>
          <DialogBody>
            <FormRows>
              <FormTextField
                id="discussion-title"
                label={t('rooms.detail.discussions.createDialog.titleLabel')}
                maxLength={DISCUSSION_TITLE_MAX_LENGTH}
                value={title}
                onChange={(event) => onTitleChange(event.currentTarget.value)}
              />
              <FormTextareaField
                id="discussion-body"
                label={t('rooms.detail.discussions.createDialog.bodyLabel')}
                maxLength={DISCUSSION_BODY_MAX_LENGTH}
                rows={6}
                value={body}
                onChange={(event) => onBodyChange(event.currentTarget.value)}
              />
            </FormRows>
          </DialogBody>
          <DialogActions>
            <Button variant="ghost" onClick={() => close()}>
              {t('common.cancel')}
            </Button>
            <Button
              isLoading={isPending}
              loadingLabel={t('rooms.detail.discussions.creating')}
              onClick={onSubmit}
            >
              {t('rooms.detail.discussions.create')}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
