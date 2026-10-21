import {
  FormSection,
  SegmentedControl,
} from '../../../../../components/primitives';
import { useI18n } from '../../../../../i18n';

import { pollKindSchema, type PollKind } from '@towelbooks/schemas';
import type { IconName } from '@towelbooks/ui';

const POLL_KINDS = pollKindSchema.options;
const POLL_KIND_ICONS: Record<PollKind, IconName> = {
  general: 'message-square',
  reading: 'library',
  scheduling: 'calendar-clock',
};

type PollKindSelectorProps = {
  kind: PollKind;
  onChange: (kind: PollKind) => void;
  sectionless?: boolean;
};

export function PollKindSelector({
  kind,
  onChange,
  sectionless = false,
}: PollKindSelectorProps) {
  const { t } = useI18n();

  const control = (
    <SegmentedControl
      ariaLabel={t('rooms.detail.polls.createDialog.sections.type')}
      className="max-w-full"
      name="create-poll-kind"
      onChange={onChange}
      options={POLL_KINDS.map((pollKind) => ({
        value: pollKind,
        ariaLabel: t(`rooms.detail.polls.kind.${pollKind}`),
        title: t(`rooms.detail.polls.kind.${pollKind}.description`),
        icon: POLL_KIND_ICONS[pollKind],
        label: t(`rooms.detail.polls.kind.${pollKind}`),
      }))}
      iconSize={20}
      segmentSize="content"
      selectionTone="primary"
      value={kind}
    />
  );

  if (sectionless) {
    return control;
  }

  return (
    <FormSection
      icon="poll-glyph"
      title={t('rooms.detail.polls.createDialog.sections.type')}
      withDivider
    >
      {control}
    </FormSection>
  );
}
