import {
  ROOM_ANNOUNCEMENT_BODY_MAX_LENGTH,
  ROOM_ANNOUNCEMENT_TITLE_MAX_LENGTH,
} from '@towelbooks/schemas';

import {
  DialogBody,
  FormRows,
  FormTextField,
  FormTextareaField,
} from '../../../../components/primitives';
import { useI18n } from '../../../../i18n';

export function RoomAnnouncementDialogFields({
  bodyDraft,
  onBodyChange,
  onTitleChange,
  titleDraft,
}: {
  bodyDraft: string;
  onBodyChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  titleDraft: string;
}) {
  const { t } = useI18n();

  return (
    <DialogBody>
      <FormRows>
        <FormTextField
          id="announcement-title"
          label={t('rooms.detail.announcements.form.titleLabel')}
          maxLength={ROOM_ANNOUNCEMENT_TITLE_MAX_LENGTH}
          value={titleDraft}
          onChange={(event) => onTitleChange(event.currentTarget.value)}
        />
        <FormTextareaField
          id="announcement-body"
          label={t('rooms.detail.announcements.form.bodyLabel')}
          maxLength={ROOM_ANNOUNCEMENT_BODY_MAX_LENGTH}
          rows={6}
          value={bodyDraft}
          onChange={(event) => onBodyChange(event.currentTarget.value)}
        />
      </FormRows>
    </DialogBody>
  );
}
