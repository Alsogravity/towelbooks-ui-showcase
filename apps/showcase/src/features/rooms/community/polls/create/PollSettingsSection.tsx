import { FormRows, FormSection } from '../../../../../components/primitives';
import { useI18n } from '../../../../../i18n';

import { FormChoiceGroup } from './FormChoiceGroup';

type PollSettingsSectionProps = {
  onShowResultsBeforeCloseChange: (value: boolean) => void;
  onVotesArePublicChange: (value: boolean) => void;
  showResultsBeforeClose: boolean;
  votesArePublic: boolean;
};

export function PollSettingsSection({
  onShowResultsBeforeCloseChange,
  onVotesArePublicChange,
  showResultsBeforeClose,
  votesArePublic,
}: PollSettingsSectionProps) {
  const { t } = useI18n();

  return (
    <FormSection
      icon="settings-2"
      title={t('rooms.detail.polls.createDialog.sections.settings')}
      withDivider
    >
      <FormRows>
        <FormChoiceGroup
          label={t('rooms.detail.polls.createDialog.settings.votesLabel')}
          value={votesArePublic ? 'public' : 'secret'}
          options={[
            {
              value: 'public',
              icon: 'globe',
              label: t('rooms.detail.polls.createDialog.settings.votesPublic'),
            },
            {
              value: 'secret',
              icon: 'lock',
              label: t('rooms.detail.polls.createDialog.settings.votesSecret'),
            },
          ]}
          onChange={(value) => onVotesArePublicChange(value === 'public')}
        />

        <FormChoiceGroup
          label={t('rooms.detail.polls.createDialog.settings.resultsLabel')}
          value={showResultsBeforeClose ? 'immediate' : 'atClose'}
          options={[
            {
              value: 'immediate',
              icon: 'eye',
              label: t(
                'rooms.detail.polls.createDialog.settings.resultsImmediate',
              ),
            },
            {
              value: 'atClose',
              icon: 'eye-off',
              label: t(
                'rooms.detail.polls.createDialog.settings.resultsAtClose',
              ),
            },
          ]}
          onChange={(value) =>
            onShowResultsBeforeCloseChange(value === 'immediate')
          }
        />
      </FormRows>
    </FormSection>
  );
}
