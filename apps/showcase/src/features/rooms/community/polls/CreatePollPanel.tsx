import { useEffect, useMemo, useRef, useState } from 'react';

import {
  Button,
  FormSection,
  FormStack,
} from '../../../../components/primitives';
import { MobilePanelShell } from '../../../../components/overlay';
import { useToast } from '../../../../components/feedback';
import { createApiProblemToast } from '../../../../features/errors';
import { useI18n } from '../../../../i18n';
import { validateLocalDateTimeRange } from '../../../../lib/datetime';

import {
  buildCreatePollBody,
  buildDefaultWindowDraft,
  canCreatePoll,
  getValidatedDateSlots,
  translateDateTimeErrors,
  type CreatePollDraft,
} from './create/buildCreatePollBody';
import { createEmptyDateSlot } from './create/DateSlotsField';
import { PollBasicsFields } from './create/PollBasicsFields';
import { PollKindSelector as _PollKindSelector } from './create/PollKindSelector';
import { PollOptionsSection } from './create/PollOptionsSection';
import { PollSettingsSection } from './create/PollSettingsSection';
import { PollVotingWindowSection } from './create/PollVotingWindowSection';
import type { ReadingOptionDraft } from './create/ReadingOptionsField';
import type { DateSlotDraft } from './create/DateSlotsField';

import type { CreatePollRequest, PollKind } from '@towelbooks/schemas';

type CreatePollPanelProps = {
  isPending: boolean;
  mutationError: unknown;
  onClose: () => void;
  onSubmit: (body: CreatePollRequest) => void;
};

export function CreatePollPanel({
  isPending,
  mutationError,
  onClose,
  onSubmit,
}: CreatePollPanelProps) {
  const { t } = useI18n();
  const { pushToast } = useToast();
  const lastToastedError = useRef<unknown>(null);

  const [kind, setKind] = useState<PollKind>('general');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [windowDraft, setWindowDraft] = useState(buildDefaultWindowDraft);
  const [closesAutomatically, setClosesAutomatically] = useState(true);
  const [votesArePublic, setVotesArePublic] = useState(true);
  const [showResultsBeforeClose, setShowResultsBeforeClose] = useState(true);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [textOptions, setTextOptions] = useState<string[]>(['', '']);
  const [readingOptions, setReadingOptions] = useState<ReadingOptionDraft[]>(
    [],
  );
  const [dateSlots, setDateSlots] = useState<DateSlotDraft[]>([
    createEmptyDateSlot(),
    createEmptyDateSlot(),
  ]);

  const draft: CreatePollDraft = {
    allowMultiple,
    closesAutomatically,
    dateSlots,
    description,
    kind,
    readingOptions,
    showResultsBeforeClose,
    textOptions,
    title,
    votesArePublic,
    windowDraft,
  };

  const validatedDateSlots = useMemo(
    () => getValidatedDateSlots(dateSlots, t),
    [dateSlots, t],
  );
  const windowErrors = closesAutomatically
    ? translateDateTimeErrors(validateLocalDateTimeRange(windowDraft), t)
    : {};
  const canSubmit = canCreatePoll(draft, t);

  useEffect(() => {
    if (!mutationError) {
      lastToastedError.current = null;
      return;
    }

    if (lastToastedError.current === mutationError) {
      return;
    }

    lastToastedError.current = mutationError;
    pushToast(
      createApiProblemToast(mutationError, {
        fallbackKey: 'rooms.detail.polls.error.submit',
        t,
      }),
    );
  }, [mutationError, pushToast, t]);

  const _handleKindChange = (nextKind: PollKind) => {
    if (nextKind === kind) {
      return;
    }

    setKind(nextKind);

    if (nextKind !== 'general') {
      setTextOptions(['', '']);
      setAllowMultiple(false);
    }

    if (nextKind !== 'reading') {
      setReadingOptions([]);
    }

    if (nextKind !== 'scheduling') {
      setDateSlots([createEmptyDateSlot(), createEmptyDateSlot()]);
    }
  };

  void _handleKindChange;

  return (
    <MobilePanelShell
      closeLabel={t('rooms.detail.polls.createDialog.cancel')}
      contentClassName="gap-6"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('rooms.detail.polls.createDialog.cancel')}
          </Button>
          <Button
            disabled={!canSubmit}
            isLoading={isPending}
            loadingLabel={t('rooms.detail.polls.creating')}
            type="submit"
          >
            {t('rooms.detail.polls.create')}
          </Button>
        </>
      }
      formProps={{
        onSubmit: (event) => {
          event.preventDefault();
          if (!canSubmit) {
            return;
          }
          onSubmit(buildCreatePollBody(draft, t));
        },
      }}
      onClose={onClose}
      panelClassName="max-w-md overflow-hidden sm:max-w-xl"
      title={t('rooms.detail.polls.createDialog.title')}
      titleId="create-poll-panel-title"
    >
      <FormStack>
        {/*
          TODO MVP: re-enable when non-general poll types are ready
          <_PollKindSelector kind={kind} onChange={_handleKindChange} />
        */}

        <FormSection
          icon="pencil-line"
          title={t('rooms.detail.polls.createDialog.sections.details')}
          withDivider
        >
          <PollBasicsFields
            description={description}
            title={title}
            onDescriptionChange={setDescription}
            onTitleChange={setTitle}
          />
        </FormSection>

        <PollOptionsSection
          allowMultiple={allowMultiple}
          dateSlotErrors={validatedDateSlots.map((slot) => slot.errors)}
          dateSlots={dateSlots}
          kind={kind}
          readingOptions={readingOptions}
          textOptions={textOptions}
          onAllowMultipleChange={setAllowMultiple}
          onDateSlotsChange={setDateSlots}
          onReadingOptionsChange={setReadingOptions}
          onTextOptionsChange={setTextOptions}
        />

        <PollVotingWindowSection
          closesAutomatically={closesAutomatically}
          errors={windowErrors}
          onClosesAutomaticallyChange={setClosesAutomatically}
          value={windowDraft}
          onChange={(patch) =>
            setWindowDraft((current) => ({
              ...current,
              ...patch,
            }))
          }
        />

        <PollSettingsSection
          showResultsBeforeClose={showResultsBeforeClose}
          votesArePublic={votesArePublic}
          onShowResultsBeforeCloseChange={setShowResultsBeforeClose}
          onVotesArePublicChange={setVotesArePublic}
        />
      </FormStack>
    </MobilePanelShell>
  );
}
