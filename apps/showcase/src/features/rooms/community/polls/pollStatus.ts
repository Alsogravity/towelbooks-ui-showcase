import type { PollDerivedStatus, PollListItem } from '@towelbooks/schemas';
import type { TagVariant } from '../../../../components/primitives';

export function getPollStatusMeta(derivedStatus: PollDerivedStatus): {
  labelKey: string;
  variant: TagVariant;
} {
  switch (derivedStatus) {
    case 'draft':
      return { labelKey: 'rooms.detail.polls.status.draft', variant: 'role' };
    case 'scheduled':
      return {
        labelKey: 'rooms.detail.polls.status.scheduled',
        variant: 'default',
      };
    case 'open':
      return {
        labelKey: 'rooms.detail.polls.status.open',
        variant: 'reading',
      };
    case 'closed':
      return {
        labelKey: 'rooms.detail.polls.status.closed',
        variant: 'paused',
      };
  }
}

/**
 * Whether the viewer is allowed to see tallies. Mirrors the API gating: always
 * once closed; before close only when the organizer opted in AND the viewer has
 * already voted (or can no longer vote).
 */
export function canShowPollResults(poll: PollListItem): boolean {
  if (poll.derivedStatus === 'closed') {
    return true;
  }

  if (!poll.showResultsBeforeClose) {
    return false;
  }

  return poll.viewerHasVoted || !poll.viewerCanVote;
}

/** The default voting form shows for open polls the viewer has not answered. */
export function shouldShowPollVotingForm(poll: PollListItem): boolean {
  return poll.derivedStatus === 'open' && !poll.viewerHasVoted;
}

/**
 * Viewer has voted on an open poll whose results stay hidden until it closes —
 * we acknowledge the recorded vote instead of showing live tallies.
 */
export function shouldShowAwaitingResults(poll: PollListItem): boolean {
  return (
    poll.derivedStatus === 'open' &&
    poll.viewerHasVoted &&
    !canShowPollResults(poll)
  );
}

export function needsViewerVote(poll: PollListItem): boolean {
  return poll.derivedStatus === 'open' && !poll.viewerHasVoted;
}
