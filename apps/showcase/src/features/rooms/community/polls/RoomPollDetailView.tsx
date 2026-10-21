import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { ErrorState, LoadingState } from '../../../../components/feedback';
import { Icon } from '@towelbooks/ui';
import {
  Alert,
  Button,
  ButtonLink,
  Tag,
} from '../../../../components/primitives';
import { handleApiProblem } from '../../../../features/errors';
import { useI18n } from '../../../../i18n';
import { sdk } from '../../../../lib/sdk';
import { buildCommunityPollsHref } from '../communityViewModel';

import { PollResultsView } from './PollResultsView';
import { PollVotingForm } from './PollVotingForm';
import { getPollKindEmoji } from './pollPresentation';
import { getPollKey, getPollListKey } from './pollQueryKeys';
import {
  canShowPollResults,
  getPollStatusMeta,
  shouldShowAwaitingResults,
  shouldShowPollVotingForm,
} from './pollStatus';

type RoomPollDetailViewProps = {
  roomId: string;
  pollId: string;
};

export function RoomPollDetailView({
  roomId,
  pollId,
}: RoomPollDetailViewProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const pollQuery = useQuery({
    queryKey: getPollKey(roomId, pollId),
    queryFn: () => sdk.polls.getPoll(roomId, pollId),
  });

  const invalidatePoll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getPollKey(roomId, pollId) }),
      queryClient.invalidateQueries({ queryKey: getPollListKey(roomId) }),
    ]);
  };

  const submitMutation = useMutation({
    mutationFn: (
      responses: Array<{ questionId: string; optionIds: string[] }>,
    ) => sdk.polls.submitResponses(roomId, pollId, { responses }),
    onSuccess: async () => {
      setIsEditing(false);
      await invalidatePoll();
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: () => sdk.polls.withdrawResponse(roomId, pollId),
    onSuccess: invalidatePoll,
  });

  const closeMutation = useMutation({
    mutationFn: () => sdk.polls.closePoll(roomId, pollId),
    onSuccess: invalidatePoll,
  });

  const announceMutation = useMutation({
    mutationFn: (optionId: string) =>
      sdk.polls.announceResult(roomId, pollId, { optionId }),
    onSuccess: invalidatePoll,
  });

  if (pollQuery.isLoading) {
    return (
      <div className="rounded-2xl border border-rule/80 bg-paper p-12 shadow-sm">
        <LoadingState
          label={{
            key: 'rooms.detail.polls.detailLoading',
            fallback: 'Opening poll...',
          }}
        />
      </div>
    );
  }

  if (pollQuery.error || !pollQuery.data) {
    return (
      <div className="rounded-2xl border border-rule/80 bg-paper p-12 shadow-sm">
        <ErrorState
          title={{ key: 'rooms.detail.polls.error.detailTitle' }}
          body={{ key: 'rooms.detail.polls.error.detailBody' }}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant="secondary"
                onClick={() => void pollQuery.refetch()}
              >
                {t('errors.action.retry')}
              </Button>
              <ButtonLink
                to={buildCommunityPollsHref(roomId)}
                variant="tertiary"
              >
                {t('rooms.detail.polls.backToList')}
              </ButtonLink>
            </div>
          }
        />
      </div>
    );
  }

  const poll = pollQuery.data;
  const showForm = isEditing || shouldShowPollVotingForm(poll);
  const showResults =
    !showForm && canShowPollResults(poll) && Boolean(poll.results);
  const showAwaiting = !showForm && shouldShowAwaitingResults(poll);
  const showVoteActions =
    poll.derivedStatus === 'open' && poll.viewerHasVoted && !isEditing;

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <ButtonLink
          prependIcon="chevron-left"
          size="sm"
          to={buildCommunityPollsHref(roomId)}
          variant="ghost"
        >
          {t('rooms.detail.polls.backToList')}
        </ButtonLink>
      </div>

      <section className="rounded-2xl border border-rule/80 bg-paper p-5 shadow-sm sm:p-8">
        <div className="space-y-4 border-b border-rule pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-2.5">
              <span aria-hidden className="app-text-stat-value">
                {getPollKindEmoji(poll.kind)}
              </span>
              <div className="min-w-0 space-y-2">
                <h2 className="app-text-section-title text-ink">
                  {poll.title}
                </h2>
                {poll.description ? (
                  <p className="text-sm leading-6 text-ink-muted">
                    {poll.description}
                  </p>
                ) : null}
              </div>
            </div>
            <Tag variant={getPollStatusMeta(poll.derivedStatus).variant}>
              {t(getPollStatusMeta(poll.derivedStatus).labelKey)}
            </Tag>
          </div>

          <p className="text-xs text-ink-3">
            {poll.votesArePublic
              ? t('rooms.detail.polls.meta.votesPublic')
              : t('rooms.detail.polls.meta.votesSecret')}
            <Icon name="dot" size={16} className="inline" />
            {poll.showResultsBeforeClose
              ? t('rooms.detail.polls.meta.resultsImmediate')
              : t('rooms.detail.polls.meta.resultsAtClose')}
          </p>
        </div>

        {closeMutation.error ? (
          <Alert className="mt-6" variant="error">
            {
              handleApiProblem(closeMutation.error, {
                fallbackKey: 'rooms.detail.polls.error.submit',
                t,
              }).message
            }
          </Alert>
        ) : null}
        {withdrawMutation.error ? (
          <Alert className="mt-6" variant="error">
            {
              handleApiProblem(withdrawMutation.error, {
                fallbackKey: 'rooms.detail.polls.error.submit',
                t,
              }).message
            }
          </Alert>
        ) : null}
        {announceMutation.error ? (
          <Alert className="mt-6" variant="error">
            {
              handleApiProblem(announceMutation.error, {
                fallbackKey: 'rooms.detail.polls.error.submit',
                t,
              }).message
            }
          </Alert>
        ) : null}

        <div className="space-y-6 pt-6">
          {showVoteActions ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-rule/10 px-4 py-3">
              <span className="text-sm font-medium text-ink">
                {t('rooms.detail.polls.voting.voteRecorded')}
              </span>
              <Button
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => setIsEditing(true)}
              >
                {t('rooms.detail.polls.voting.changeVote')}
              </Button>
              <Button
                isLoading={withdrawMutation.isPending}
                loadingLabel={t('rooms.detail.polls.voting.withdrawing')}
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => withdrawMutation.mutate()}
              >
                {t('rooms.detail.polls.voting.withdraw')}
              </Button>
            </div>
          ) : null}

          {showForm ? (
            <PollVotingForm
              isPending={submitMutation.isPending}
              mutationError={submitMutation.error}
              poll={poll}
              submitLabel={
                isEditing
                  ? t('rooms.detail.polls.voting.saveChange')
                  : undefined
              }
              onCancel={isEditing ? () => setIsEditing(false) : undefined}
              onSubmit={(responses) => submitMutation.mutate(responses)}
            />
          ) : null}

          {showAwaiting ? (
            <p className="rounded-xl bg-rule/10 px-4 py-6 text-center text-sm text-ink-muted">
              {t('rooms.detail.polls.voting.awaitingResults')}
            </p>
          ) : null}

          {showResults
            ? poll.questions.map((question) => (
                <PollResultsView
                  key={question.id}
                  isConfirming={announceMutation.isPending}
                  poll={poll}
                  question={question}
                  onConfirmSlot={
                    poll.viewerCanAnnounceResult
                      ? (optionId) => announceMutation.mutate(optionId)
                      : undefined
                  }
                />
              ))
            : null}
        </div>

        {poll.viewerCanClose && poll.derivedStatus === 'open' ? (
          <div className="mt-8 border-t border-rule pt-6">
            <Button
              isLoading={closeMutation.isPending}
              loadingLabel={t('rooms.detail.polls.closing')}
              variant="secondary"
              onClick={() => closeMutation.mutate()}
            >
              {t('rooms.detail.polls.close')}
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
