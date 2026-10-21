import { useMemo, useState } from 'react';

import { Alert, Button } from '../../../../components/primitives';
import { handleApiProblem } from '../../../../features/errors';
import { useI18n } from '../../../../i18n';

import { getPollOptionLabel } from './pollPresentation';

import type { Poll, PollQuestion } from '@towelbooks/schemas';

type PollVotingFormProps = {
  isPending: boolean;
  mutationError: unknown;
  onCancel?: () => void;
  onSubmit: (
    responses: Array<{ questionId: string; optionIds: string[] }>,
  ) => void;
  poll: Poll;
  submitLabel?: string;
};

export function PollVotingForm({
  isPending,
  mutationError,
  onCancel,
  onSubmit,
  poll,
  submitLabel,
}: PollVotingFormProps) {
  const { formatDateTime, t } = useI18n();
  const [selections, setSelections] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      poll.questions.map((question) => [question.id, question.viewerOptionIds]),
    ),
  );

  const canSubmit = useMemo(
    () =>
      poll.questions.every((question) => {
        const selected = selections[question.id] ?? [];
        const minChoices = question.minChoices;
        const maxChoices = question.maxChoices ?? question.options.length;
        return selected.length >= minChoices && selected.length <= maxChoices;
      }),
    [poll.questions, selections],
  );

  const toggleOption = (question: PollQuestion, optionId: string) => {
    setSelections((current) => {
      const existing = current[question.id] ?? [];

      if (question.choiceMode === 'single') {
        return { ...current, [question.id]: [optionId] };
      }

      if (existing.includes(optionId)) {
        return {
          ...current,
          [question.id]: existing.filter((id) => id !== optionId),
        };
      }

      const maxChoices = question.maxChoices ?? question.options.length;
      if (existing.length >= maxChoices) {
        return current;
      }

      return { ...current, [question.id]: [...existing, optionId] };
    });
  };

  return (
    <form
      className="space-y-8"
      data-testid="poll-voting-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(
          poll.questions.map((question) => ({
            questionId: question.id,
            optionIds: selections[question.id] ?? [],
          })),
        );
      }}
    >
      {mutationError ? (
        <Alert variant="error">
          {
            handleApiProblem(mutationError, {
              fallbackKey: 'rooms.detail.polls.error.submit',
              t,
            }).message
          }
        </Alert>
      ) : null}

      {poll.questions.map((question) => {
        const isMultiple = question.choiceMode === 'multiple';

        return (
          <fieldset key={question.id} className="space-y-3">
            {question.title !== poll.title ? (
              <legend className="text-base font-semibold text-ink">
                {question.title}
              </legend>
            ) : null}
            {isMultiple ? (
              <p className="text-sm text-ink-muted">
                {poll.kind === 'scheduling'
                  ? t('rooms.detail.polls.voting.selectAllSlots')
                  : t('rooms.detail.polls.voting.selectAll')}
              </p>
            ) : null}
            <ul className="space-y-2">
              {question.options.map((option) => {
                const selected = selections[question.id]?.includes(option.id);
                const label = getPollOptionLabel(option, formatDateTime, t);
                const inputType = isMultiple ? 'checkbox' : 'radio';

                return (
                  <li key={option.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-rule/80 px-4 py-3 transition-colors hover:bg-rule/10 has-[:checked]:border-brick/40 has-[:checked]:bg-brick/5">
                      <input
                        checked={selected}
                        name={`poll-question-${question.id}`}
                        type={inputType}
                        value={option.id}
                        onChange={() => toggleOption(question, option.id)}
                      />
                      {option.referenceSnapshot?.coverUrl ? (
                        <img
                          alt=""
                          className="h-12 w-9 shrink-0 rounded object-cover"
                          src={option.referenceSnapshot.coverUrl}
                        />
                      ) : null}
                      <span className="min-w-0">
                        <span className="block text-sm text-ink">{label}</span>
                        {option.referenceSnapshot?.subtitle ? (
                          <span className="block text-xs text-ink-3">
                            {option.referenceSnapshot.subtitle}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        );
      })}

      <div className="flex flex-wrap gap-3">
        <Button
          disabled={!canSubmit}
          isLoading={isPending}
          loadingLabel={t('rooms.detail.polls.voting.submitting')}
          type="submit"
        >
          {submitLabel ?? t('rooms.detail.polls.voting.submit')}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t('rooms.detail.polls.voting.cancelChange')}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
