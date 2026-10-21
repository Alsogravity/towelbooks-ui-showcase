import {
  FormRows,
  FormTextField,
  FormTextareaField,
} from '../../../../../components/primitives';
import { useI18n } from '../../../../../i18n';

import {
  POLL_DESCRIPTION_MAX_LENGTH,
  POLL_TITLE_MAX_LENGTH,
} from '@towelbooks/schemas';

type PollBasicsFieldsProps = {
  description: string;
  onDescriptionChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  title: string;
};

export function PollBasicsFields({
  description,
  onDescriptionChange,
  onTitleChange,
  title,
}: PollBasicsFieldsProps) {
  const { t } = useI18n();

  return (
    <FormRows>
      <FormTextField
        id="create-poll-title"
        label={t('rooms.detail.polls.createDialog.titleLabel')}
        maxLength={POLL_TITLE_MAX_LENGTH}
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
      />

      <FormTextareaField
        id="create-poll-description"
        label={t('rooms.detail.polls.createDialog.descriptionLabel')}
        maxLength={POLL_DESCRIPTION_MAX_LENGTH}
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
      />
    </FormRows>
  );
}
