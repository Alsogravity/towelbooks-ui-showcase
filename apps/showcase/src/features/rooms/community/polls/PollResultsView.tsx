import { Button, ProgressBar } from '../../../../components/primitives';
import { UserAvatar } from '../../../../entities/user/ui/UserAvatar';
import { useI18n } from '../../../../i18n';

import { getPollOptionLabel } from './pollPresentation';

import type { Poll, PollQuestion } from '@towelbooks/schemas';

type PollResultsViewProps = {
  isConfirming?: boolean;
  onConfirmSlot?: (optionId: string) => void;
  poll: Poll;
  question: PollQuestion;
};

export function PollResultsView({
  isConfirming = false,
  onConfirmSlot,
  poll,
  question,
}: PollResultsViewProps) {
  const { formatDateTime, formatNumber, t } = useI18n();
  const result =
    poll.results?.find((entry) => entry.questionId === question.id) ?? null;

  if (!result) {
    return (
      <p className="text-sm text-ink-muted">
        {t('rooms.detail.polls.results.pending')}
      </p>
    );
  }

  const totalVotes = result.options.reduce(
    (sum, option) => sum + option.count,
    0,
  );
  const isScheduling = poll.kind === 'scheduling';

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">
        {t('rooms.detail.polls.results.votes', {
          values: { count: totalVotes },
        })}
        {' · '}
        {t('rooms.detail.polls.results.participants', {
          values: { count: result.totalResponses },
        })}
      </p>
      <ul className="space-y-4">
        {result.options.map((option) => {
          const label = getPollOptionLabel(option, formatDateTime, t);

          return (
            <li key={option.optionId} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  {option.referenceSnapshot?.coverUrl ? (
                    <img
                      alt=""
                      className="h-9 w-7 shrink-0 rounded object-cover"
                      src={option.referenceSnapshot.coverUrl}
                    />
                  ) : null}
                  <span className="min-w-0 truncate text-ink">{label}</span>
                </span>
                <span className="shrink-0 tabular-nums text-ink-muted">
                  {isScheduling
                    ? t('rooms.detail.polls.results.availability', {
                        values: { count: option.count },
                      })
                    : formatNumber(option.count)}
                </span>
              </div>

              <ProgressBar value={option.percentage} />

              {option.voters && option.voters.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {option.voters.map((voter) => (
                    <span
                      key={voter.userId}
                      className="flex items-center gap-1 rounded-full bg-rule/20 py-0.5 pl-0.5 pr-2"
                    >
                      <UserAvatar
                        avatar={voter.avatar}
                        decorative
                        displayName={voter.displayName}
                        size="xs"
                      />
                      <span className="text-xs text-ink-3">
                        {voter.displayName ?? voter.username}
                      </span>
                    </span>
                  ))}
                </div>
              ) : null}

              {isScheduling && onConfirmSlot ? (
                <div className="pt-1">
                  <Button
                    isLoading={isConfirming}
                    loadingLabel={t('rooms.detail.polls.confirm.confirming')}
                    size="sm"
                    type="button"
                    variant="secondary"
                    onClick={() => onConfirmSlot(option.optionId)}
                  >
                    {t('rooms.detail.polls.confirm.cta')}
                  </Button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
